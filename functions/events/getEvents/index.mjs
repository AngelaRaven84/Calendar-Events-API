import middy from '@middy/core';

import { getEvents } from '../../../services/events.mjs';
import { sendResponse } from '../../../responses/index.mjs';
import { requireAuth } from '../../../middlewares/requireAuth/index.mjs';
import { errorHandler } from '../../../middlewares/errorHandler/index.mjs';

const listEvents = async (event) => {
	const { userId } = event.auth;

	const events = await getEvents(userId);

	return sendResponse(200, events);
};

export const handler = middy(listEvents).use(requireAuth()).use(errorHandler());
