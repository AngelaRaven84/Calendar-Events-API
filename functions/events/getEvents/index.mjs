import { getEvents } from '../../../services/events.mjs';
import { sendResponse } from '../../../responses/index.mjs';

export const handler = async () => {
	const events = await getEvents('test-user');

	return sendResponse(200, events);
};
