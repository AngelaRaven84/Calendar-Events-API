import { getEventById } from '../../../services/events.mjs';
import { sendResponse } from '../../../responses/index.mjs';

export const handler = async (event) => {
	const { userId, id } = event.pathParameters;

	const foundEvent = await getEventById(userId, id);

	if (!foundEvent) {
		return sendResponse(404, {
			message: 'Event not found',
		});
	}

	return sendResponse(200, foundEvent);
};
