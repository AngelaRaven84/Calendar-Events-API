import { events } from '../../../data/events.mjs';
import { sendResponse } from '../../../responses/index.mjs';

export const handler = async (event) => {
	const { id } = event.pathParameters;

	const foundEvent = events.find((calendarEvent) => calendarEvent.id === id);

	if (!foundEvent) {
		return sendResponse(404, {
			message: 'Event not found',
		});
	}

	return sendResponse(200, foundEvent);
};
