import { z } from 'zod';

const eventFields = {
	title: z.string().trim().min(1, 'Title is required'),
	date: z
		.string()
		.regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must use the format YYYY-MM-DD'),
	startTime: z
		.string()
		.regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Start time must use the format HH:mm'),
	endTime: z
		.string()
		.regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'End time must use the format HH:mm'),
};

const eventObjectSchema = z.object(eventFields).strict();

export const eventSchema = eventObjectSchema.refine(
	(data) => data.endTime > data.startTime,
	{
		message: 'End time must be after start time',
		path: ['endTime'],
	},
);

export const updateEventSchema = eventObjectSchema
	.partial()
	.refine((data) => Object.keys(data).length > 0, {
		message: 'At least one field must be provided',
	});
