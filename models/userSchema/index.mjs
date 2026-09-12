import { z } from 'zod';

export const userSchema = z
	.object({
		name: z.string().trim().min(1, 'Name is required'),
	})
	.strict();
