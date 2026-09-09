import middy from '@middy/core';
import httpJsonBodyParser from '@middy/http-json-body-parser';
import createError from 'http-errors';

import {
	getEventById,
	getEvents,
	updateEvent as saveUpdatedEvent,
} from '../../../services/events.mjs';
import {
	eventSchema,
	updateEventSchema,
} from '../../../models/eventSchema/index.mjs';
import { validateBody } from '../../../middlewares/validateBody/index.mjs';
import { errorHandler } from '../../../middlewares/errorHandler/index.mjs';
import { sendResponse } from '../../../responses/index.mjs';

const updateEvent = async (event) => {
	const { id } = event.pathParameters;

	const foundEvent = await getEventById('test-user', id);

	if (!foundEvent) {
		throw new createError.NotFound('Event not found');
	}

	const {
		id: existingId,
		userId: existingUserId,
		...existingEventData
	} = foundEvent;

	const mergedEventData = {
		...existingEventData,
		...event.body,
	};

	const result = eventSchema.safeParse(mergedEventData);

	if (!result.success) {
		const message = result.error.issues
			.map((issue) => issue.message)
			.join(', ');

		throw new createError.BadRequest(message);
	}

	const events = await getEvents(existingUserId);

	const hasConflict = events.some(
		(existingEvent) =>
			existingEvent.id !== existingId &&
			existingEvent.date === result.data.date &&
			result.data.startTime < existingEvent.endTime &&
			result.data.endTime > existingEvent.startTime,
	);

	if (hasConflict) {
		throw new createError.Conflict('Event conflicts with an existing event');
	}

	const updatedEvent = await saveUpdatedEvent(
		existingUserId,
		existingId,
		result.data,
	);

	return sendResponse(200, updatedEvent);
};

export const handler = middy(updateEvent)
	.use(httpJsonBodyParser())
	.use(validateBody(updateEventSchema))
	.use(errorHandler());
