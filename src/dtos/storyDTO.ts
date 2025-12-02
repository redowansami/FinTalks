import { z } from 'zod';
import { LENTGH_CONSTRAINTS, VALIDATION_MESSAGES } from '../constants/validationConstants';
import { StoryOrderByFields } from '../constants/databaseConstants';
import { Expose } from 'class-transformer';

export const createStorySchema = z
	.object({
		userId: z.uuid(VALIDATION_MESSAGES.INVALID_USER_ID),
		title: z
			.string()
			.min(LENTGH_CONSTRAINTS.TITLE_MIN, VALIDATION_MESSAGES.TITLE_MIN)
			.max(LENTGH_CONSTRAINTS.TITLE_MAX, VALIDATION_MESSAGES.TITLE_MAX),
		body: z
			.string()
			.min(LENTGH_CONSTRAINTS.BODY_MIN, VALIDATION_MESSAGES.BODY_MIN)
			.max(LENTGH_CONSTRAINTS.BODY_MAX, VALIDATION_MESSAGES.BODY_MAX),
	})
	.strict();

export const updateStorySchema = createStorySchema.partial().omit({ userId: true }).strict();

export const storyIdSchema = z.object({
	storyId: z.uuid(VALIDATION_MESSAGES.INVALID_STORY_ID),
});

export const storyQuerySchema = z.object({
	search: z.string().optional(),
	orderBy: z.enum(StoryOrderByFields).optional(),
	startAfter: z.string().optional(),
	limit: z.coerce
		.number()
		.int()
		.positive()
		.max(LENTGH_CONSTRAINTS.MAX_LIMIT, VALIDATION_MESSAGES.MAX_LIMIT)
		.default(LENTGH_CONSTRAINTS.DEFAULT_PAGINATION_LIMIT),
});

export type CreateStoryDTO = z.infer<typeof createStorySchema>;
export type UpdateStoryDTO = z.infer<typeof updateStorySchema>;
export type StoryIdDTO = z.infer<typeof storyIdSchema>;
export type StoryQueryDTO = z.infer<typeof storyQuerySchema>;

export class StoryResponseDTO {
	@Expose() storyId: string;
	@Expose() userId: string;
	@Expose() title: string;
	@Expose() body: string;
	@Expose() createdAt: Date;
	@Expose() updatedAt: Date;
}
