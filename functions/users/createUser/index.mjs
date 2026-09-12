import { randomUUID } from 'node:crypto';
import middy from '@middy/core';
import httpJsonBodyParser from '@middy/http-json-body-parser';

import { createUser as saveUser } from '../../../services/users.mjs';
import { sendResponse } from '../../../responses/index.mjs';
import { userSchema } from '../../../models/userSchema/index.mjs';
import { validateBody } from '../../../middlewares/validateBody/index.mjs';
import { errorHandler } from '../../../middlewares/errorHandler/index.mjs';

const createUser = async (event) => {
	const user = {
		userId: randomUUID(),
		name: event.body.name,
	};

	const savedUser = await saveUser(user);

	return sendResponse(201, savedUser);
};

export const handler = middy(createUser)
	.use(httpJsonBodyParser())
	.use(validateBody(userSchema))
	.use(errorHandler());
