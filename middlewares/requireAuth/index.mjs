import createError from 'http-errors';
import { errors } from 'jose';
import { verifyAccessToken } from '../../services/tokens.mjs';

export const requireAuth = () => ({
	before: async (request) => {
		const headers = request.event.headers ?? {};
		const authorization = headers.authorization ?? headers.Authorization;
		const match = authorization?.match(/^Bearer\s+(\S+)$/i);

		if (!match) {
			throw new createError.Unauthorized('Bearer token is required');
		}

		let userId;

		try {
			userId = await verifyAccessToken(match[1]);
		} catch (error) {
			if (error instanceof errors.JOSEError) {
				throw new createError.Unauthorized('Invalid or expired token');
			}

			throw error;
		}

		if (request.event.pathParameters?.userId !== userId) {
			throw new createError.Forbidden('Access denied');
		}

		request.event.auth = { userId };
	},
});
