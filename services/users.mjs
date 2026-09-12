import { GetCommand, TransactWriteCommand } from '@aws-sdk/lib-dynamodb';
import { db } from './db.mjs';

export const createUser = async (user) => {
	const usernameLookup = {
		userId: `USERNAME#${user.username}`,
		targetUserId: user.userId,
		type: 'loginLookup',
	};

	const emailLookup = {
		userId: `EMAIL#${user.email}`,
		targetUserId: user.userId,
		type: 'loginLookup',
	};

	const command = new TransactWriteCommand({
		TransactItems: [user, usernameLookup, emailLookup].map((item) => ({
			Put: {
				TableName: 'Calendar-users',
				Item: item,
				ConditionExpression: 'attribute_not_exists(userId)',
			},
		})),
	});

	await db.send(command);

	return user;
};

export const getUserById = async (userId) => {
	const command = new GetCommand({
		TableName: 'Calendar-users',
		Key: {
			userId,
		},
	});

	const result = await db.send(command);

	if (result.Item?.type === 'loginLookup') {
		return undefined;
	}

	return result.Item;
};

export const getUserByLogin = async (identifier) => {
	const normalized = identifier.trim().toLowerCase();

	const lookupKey = normalized.includes('@')
		? `EMAIL#${normalized}`
		: `USERNAME#${normalized}`;

	const command = new GetCommand({
		TableName: 'Calendar-users',
		Key: {
			userId: lookupKey,
		},
		ConsistentRead: true,
	});

	const result = await db.send(command);
	const lookup = result.Item;

	if (lookup?.type !== 'loginLookup' || !lookup.targetUserId) {
		return undefined;
	}

	return getUserById(lookup.targetUserId);
};
