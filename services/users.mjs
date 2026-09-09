import { GetCommand, PutCommand } from '@aws-sdk/lib-dynamodb';
import { db } from './db.mjs';

export const createUser = async (user) => {
	const command = new PutCommand({
		TableName: 'Calendar-users',
		Item: user,
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

	return result.Item;
};
