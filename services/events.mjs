import { PutCommand } from '@aws-sdk/lib-dynamodb';
import { db } from './db.mjs';

export const createEvent = async (calendarEvent) => {
	const command = new PutCommand({
		TableName: 'calendar-events-db',
		Item: calendarEvent,
	});

	await db.send(command);

	return calendarEvent;
};
