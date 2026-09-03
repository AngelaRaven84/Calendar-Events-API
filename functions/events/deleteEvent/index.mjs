import createError from 'http-errors';
import middy from '@middy/core';

import { events } from '../../../data/events.mjs';
import { errorHandler } from '../../../middlewares/errorHandler/index.mjs';
import { sendResponse } from '../../../responses/index.mjs';

const deleteEvent = async (event) => {
	const { id } = event.pathParameters;

	const eventIndex = events.findIndex(
		(calendarEvent) => calendarEvent.id === id,
	);

	if (eventIndex === -1) {
		throw new createError.NotFound('Event not found');
	}

	const [deletedEvent] = events.splice(eventIndex, 1);

	return sendResponse(200, {
		message: 'Event deleted',
		event: deletedEvent,
	});
};

export const handler = middy(deleteEvent).use(errorHandler());
