import { getEvents } from '../../../services/events.mjs';
import { sendResponse } from '../../../responses/index.mjs';

export const handler = async (event) => {
	const { userId } = event.pathParameters;

	const events = await getEvents(userId);

	return sendResponse(200, events);
};
