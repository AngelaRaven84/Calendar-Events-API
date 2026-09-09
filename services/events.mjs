import {
	PutCommand,
	QueryCommand,
	GetCommand,
	UpdateCommand,
	DeleteCommand,
} from '@aws-sdk/lib-dynamodb';
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

export const updateEvent = async (userId, id, calendarEvent) => {
	const command = new UpdateCommand({
		TableName: 'Calendar-db',
		Key: {
			userId,
			id,
		},
		UpdateExpression:
			'SET #title = :title, #date = :date, startTime = :startTime, endTime = :endTime',
		ExpressionAttributeNames: {
			'#title': 'title',
			'#date': 'date',
		},
		ExpressionAttributeValues: {
			':title': calendarEvent.title,
			':date': calendarEvent.date,
			':startTime': calendarEvent.startTime,
			':endTime': calendarEvent.endTime,
		},
		ConditionExpression: 'attribute_exists(id)',
		ReturnValues: 'ALL_NEW',
	});

	const result = await db.send(command);

	return result.Attributes;
};

export const deleteEvent = async (userId, id) => {
	const command = new DeleteCommand({
		TableName: 'Calendar-db',
		Key: {
			userId,
			id,
		},
		ReturnValues: 'ALL_OLD',
	});

	const result = await db.send(command);

	return result.Attributes;
};
