import createError from 'http-errors';
import middy from '@middy/core';

import { getUserById } from '../../../services/users.mjs';
import { errorHandler } from '../../../middlewares/errorHandler/index.mjs';
import { sendResponse } from '../../../responses/index.mjs';

const getUser = async (event) => {
	const { userId } = event.pathParameters;

	const user = await getUserById(userId);

	if (!user) {
		throw new createError.NotFound('User not found');
	}

	return sendResponse(200, user);
};

export const handler = middy(getUser).use(errorHandler());
