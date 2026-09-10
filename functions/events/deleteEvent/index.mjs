import createError from 'http-errors';
import middy from '@middy/core';

import { deleteEvent as removeEvent } from '../../../services/events.mjs';
import { errorHandler } from '../../../middlewares/errorHandler/index.mjs';
import { sendResponse } from '../../../responses/index.mjs';

const deleteEvent = async (event) => {
	const { userId, id } = event.pathParameters;

	const deletedEvent = await removeEvent(userId, id);

	if (!deletedEvent) {
		throw new createError.NotFound('Event not found');
	}

	return sendResponse(200, {
		message: 'Event deleted',
		event: deletedEvent,
	});
};

export const handler = middy(deleteEvent).use(errorHandler());
