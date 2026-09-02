import { events } from '../../../data/events.mjs';
import { sendResponse } from '../../../responses/index.mjs';

export const handler = async () => {
	return sendResponse(200, events);
};
