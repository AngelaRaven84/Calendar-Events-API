import middy from '@middy/core';
import httpJsonBodyParser from '@middy/http-json-body-parser';
import createError from 'http-errors';
import { randomUUID } from 'node:crypto';

import { events } from '../../../data/events.mjs';
import { eventSchema } from '../../../models/eventSchema/index.mjs';
import { validateBody } from '../../../middlewares/validateBody/index.mjs';
import { errorHandler } from '../../../middlewares/errorHandler/index.mjs';
import { sendResponse } from '../../../responses/index.mjs';
import { createEvent as saveEvent } from '../../../services/events.mjs';

const createEvent = async (event) => {
	const hasConflict = events.some(
		(existingEvent) =>
			existingEvent.date === event.body.date &&
			event.body.startTime < existingEvent.endTime &&
			event.body.endTime > existingEvent.startTime,
	);

	if (hasConflict) {
		throw new createError.Conflict('Event conflicts with an existing event');
	}

	const newEvent = {
		...event.body,
		id: randomUUID(),
		userId: 'test-user',
	};

	await saveEvent(newEvent);

	return sendResponse(201, newEvent);
};

export const handler = middy(createEvent)
	.use(httpJsonBodyParser())
	.use(validateBody(eventSchema))
	.use(errorHandler());
