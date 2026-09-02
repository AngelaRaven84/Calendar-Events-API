import { z } from 'zod';

export const eventSchema = z
	.object({
		title: z.string().trim().min(1, 'Title is required'),
		date: z
			.string()
			.regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must use the format YYYY-MM-DD'),
		startTime: z
			.string()
			.regex(
				/^([01]\d|2[0-3]):[0-5]\d$/,
				'Start time must use the format HH:mm',
			),
		endTime: z
			.string()
			.regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'End time must use the format HH:mm'),
	})
	.strict()
	.refine((data) => data.endTime > data.startTime, {
		message: 'End time must be after start time',
		path: ['endTime'],
	});
