import { randomUUID } from 'node:crypto';
import middy from '@middy/core';
import httpJsonBodyParser from '@middy/http-json-body-parser';
import createError from 'http-errors';

import { createUser as saveUser } from '../../../services/users.mjs';
import { sendResponse } from '../../../responses/index.mjs';
import { userSchema } from '../../../models/userSchema/index.mjs';
import { validateBody } from '../../../middlewares/validateBody/index.mjs';
import { errorHandler } from '../../../middlewares/errorHandler/index.mjs';
import { hashPassword } from '../../../services/passwords.mjs';

const createUser = async (event) => {
	const { name, username, email, password } = event.body;

	const passwordHash = await hashPassword(password);

	const user = {
		userId: randomUUID(),
		name,
		username,
		email,
		passwordHash,
	};

	try {
		const savedUser = await saveUser(user);

		return sendResponse(201, {
			userId: savedUser.userId,
			name: savedUser.name,
		});
	} catch (error) {
		const loginAlreadyExists = error.CancellationReasons?.slice(1).some(
			(reason) => reason.Code === 'ConditionalCheckFailed',
		);

		if (error.name === 'TransactionCanceledException' && loginAlreadyExists) {
			throw new createError.Conflict('Username or email is already in use');
		}

		throw error;
	}
};

export const handler = middy(createUser)
	.use(httpJsonBodyParser())
	.use(validateBody(userSchema))
	.use(errorHandler());
