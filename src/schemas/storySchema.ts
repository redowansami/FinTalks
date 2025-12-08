import { z } from 'zod';
import { LENTGH_CONSTRAINTS, VALIDATION_MESSAGES } from '../constants/validationConstants';
import { StoryOrderByFields } from '../constants/databaseConstants';

export const createStorySchema = z
	.object({
		title: z
			.string()
			.min(LENTGH_CONSTRAINTS.TITLE_MIN, VALIDATION_MESSAGES.TITLE_MIN)
			.max(LENTGH_CONSTRAINTS.TITLE_MAX, VALIDATION_MESSAGES.TITLE_MAX),
		body: z
			.string()
			.min(LENTGH_CONSTRAINTS.BODY_MIN, VALIDATION_MESSAGES.BODY_MIN)
			.max(LENTGH_CONSTRAINTS.BODY_MAX, VALIDATION_MESSAGES.BODY_MAX),
		categoryIds: z.array(z.uuid()).optional(),
	})
	.strict();

export const updateStorySchema = createStorySchema.partial().strict();

export const storyIdSchema = z.object({ storyId: z.uuid(VALIDATION_MESSAGES.INVALID_STORY_ID) });

export const storyAndCategoryIdSchema = z.object({
	storyId: z.uuid(VALIDATION_MESSAGES.INVALID_STORY_ID),
	categoryId: z.uuid(VALIDATION_MESSAGES.INVALID_CATEGORY_ID),
});

export const storyQuerySchema = z.object({
	search: z.string().optional(),
	orderBy: z.enum(StoryOrderByFields).optional(),
	category: z.string().optional(),
	startAfter: z.string().optional(),
	limit: z.coerce
		.number()
		.int()
		.positive()
		.max(LENTGH_CONSTRAINTS.MAX_LIMIT, VALIDATION_MESSAGES.MAX_LIMIT)
		.default(LENTGH_CONSTRAINTS.DEFAULT_PAGINATION_LIMIT),
});
