import { sendResponse } from '../../responses/index.mjs';

export const errorHandler = () => ({
	onError: (request) => {
		const statusCode = request.error.statusCode ?? request.error.status ?? 500;

		const message =
			statusCode === 500 ? 'Internal server error' : request.error.message;

		request.response = sendResponse(statusCode, {
			message,
		});
	},
});
