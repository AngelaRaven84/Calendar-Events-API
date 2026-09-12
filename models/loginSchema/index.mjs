import { z } from 'zod';

export const loginSchema = z
	.object({
		identifier: z
			.string()
			.trim()
			.toLowerCase()
			.min(1, 'Username or email is required')
			.max(254, 'Username or email is too long'),
		password: z
			.string()
			.min(1, 'Password is required')
			.max(128, 'Password must contain at most 128 characters'),
	})
	.strict();
