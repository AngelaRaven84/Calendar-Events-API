import { z } from 'zod';

export const userSchema = z
	.object({
		name: z.string().trim().min(1, 'Name is required'),
		username: z
			.string()
			.trim()
			.toLowerCase()
			.min(3, 'Username must contain at least 3 characters')
			.max(30, 'Username must contain at most 30 characters')
			.regex(
				/^[a-z0-9_-]+$/,
				'Username may only contain letters a-z, numbers, underscores and hyphens',
			),
		email: z
			.string()
			.trim()
			.toLowerCase()
			.pipe(z.email('A valid email address is required')),
		password: z
			.string()
			.min(15, 'Password must contain at least 15 characters')
			.max(128, 'Password must contain at most 128 characters'),
	})
	.strict();
