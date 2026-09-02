import createError from 'http-errors';

export const validateBody = (schema) => ({
	before: (request) => {
		const result = schema.safeParse(request.event.body);

		if (!result.success) {
			const message = result.error.issues
				.map((issue) => issue.message)
				.join(', ');

			throw new createError.BadRequest(message);
		}

		request.event.body = result.data;
	},
});
