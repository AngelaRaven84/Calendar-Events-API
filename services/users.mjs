import { PutCommand } from '@aws-sdk/lib-dynamodb';
import { db } from './db.mjs';

export const createUser = async (user) => {
	const command = new PutCommand({
		TableName: 'Calendar-users',
		Item: user,
	});

	await db.send(command);

	return user;
};
