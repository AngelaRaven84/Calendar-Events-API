import middy from '@middy/core';

import { getEventById } from '../../../services/events.mjs';
import { sendResponse } from '../../../responses/index.mjs';
import { requireAuth } from '../../../middlewares/requireAuth/index.mjs';
import { errorHandler } from '../../../middlewares/errorHandler/index.mjs';

const getSingleEvent = async (event) => {
	const { userId } = event.auth;
	const { id } = event.pathParameters;

	const foundEvent = await getEventById(userId, id);

	if (!foundEvent) {
		return sendResponse(404, {
			message: 'Event not found',
		});
	}

	return sendResponse(200, foundEvent);
};

export const handler = middy(getSingleEvent)
	.use(requireAuth())
	.use(errorHandler());
