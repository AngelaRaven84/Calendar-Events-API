import { PutCommand, QueryCommand, GetCommand } from '@aws-sdk/lib-dynamodb';
import { db } from './db.mjs';

export const createEvent = async (calendarEvent) => {
	const command = new PutCommand({
		TableName: 'Calendar-db',
		Item: calendarEvent,
	});

	await db.send(command);

	return calendarEvent;
};

export const getEvents = async (userId) => {
	const command = new QueryCommand({
		TableName: 'Calendar-db',
		KeyConditionExpression: 'userId = :userId',
		ExpressionAttributeValues: {
			':userId': userId,
		},
	});

	const result = await db.send(command);

	return result.Items ?? [];
};

export const getEventById = async (userId, id) => {
	const command = new GetCommand({
		TableName: 'Calendar-db',
		Key: {
			userId,
			id,
		},
	});

	const result = await db.send(command);

	return result.Item;
};
