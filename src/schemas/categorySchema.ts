import { z } from 'zod';
import { LENTGH_CONSTRAINTS, VALIDATION_MESSAGES } from '../constants/validationConstants';

export const createCategorySchema = z.object({
	name: z
		.string()
		.min(LENTGH_CONSTRAINTS.CATEGORY_NAME_MIN, VALIDATION_MESSAGES.CATEGORY_NAME_MIN)
		.max(LENTGH_CONSTRAINTS.CATEGORY_NAME_MAX, VALIDATION_MESSAGES.CATEGORY_NAME_MAX),
	description: z
		.string()
		.max(LENTGH_CONSTRAINTS.DESCRIPTION_MAX, VALIDATION_MESSAGES.DESCRIPTION_MAX)
		.optional(),
});

export const updateCategorySchema = createCategorySchema.partial().strict();

export const categoryIdSchema = z.object({
	categoryId: z.uuid(VALIDATION_MESSAGES.INVALID_CATEGORY_ID),
});
