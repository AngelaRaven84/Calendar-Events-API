import middy from '@middy/core';
import httpJsonBodyParser from '@middy/http-json-body-parser';
import createError from 'http-errors';

import { getUserByLogin } from '../../../services/users.mjs';
import { hashPassword, verifyPassword } from '../../../services/passwords.mjs';
import { createAccessToken } from '../../../services/tokens.mjs';
import { loginSchema } from '../../../models/loginSchema/index.mjs';
import { validateBody } from '../../../middlewares/validateBody/index.mjs';
import { errorHandler } from '../../../middlewares/errorHandler/index.mjs';
import { sendResponse } from '../../../responses/index.mjs';

const dummyPasswordHash = await hashPassword('Dummy password for timing only');

const login = async (event) => {
	const { identifier, password } = event.body;

	const user = await getUserByLogin(identifier);

	const passwordMatches = await verifyPassword(
		password,
		user?.passwordHash ?? dummyPasswordHash,
	);

	if (!user?.passwordHash || !passwordMatches) {
		throw new createError.Unauthorized('Invalid username/email or password');
	}

	const accessToken = await createAccessToken(user.userId);

	return sendResponse(200, {
		accessToken,
		tokenType: 'Bearer',
		expiresIn: 900,
	});
};

export const handler = middy(login)
	.use(httpJsonBodyParser())
	.use(validateBody(loginSchema))
	.use(errorHandler());
