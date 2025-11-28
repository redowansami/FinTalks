import { z } from 'zod';
import { LENTGH_CONSTRAINTS, VALIDATION_MESSAGES } from '../constants/validationConstants';
import { StoryOrderByFields } from '../constants/databaseConstants';
import { Expose } from 'class-transformer';

export const createStoryDTO = z
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

export const updateStoryDTO = createStoryDTO.partial().omit({ userId: true }).strict();

export const storyIdDTO = z.object({
	storyId: z.uuid(VALIDATION_MESSAGES.INVALID_STORY_ID),
});

export const storyQueryDTO = z.object({
	search: z.string().optional(),
	orderBy: z.enum(StoryOrderByFields).optional(),
	startAfter: z.string().min(1, 'Invalid cursor format').optional(),
	limit: z.coerce.number().int().positive().max(100).default(10),
});

export type CreateStoryDTO = z.infer<typeof createStoryDTO>;
export type UpdateStoryDTO = z.infer<typeof updateStoryDTO>;
export type StoryIdDTO = z.infer<typeof storyIdDTO>;
export type StoryQueryDTO = z.infer<typeof storyQueryDTO>;

export class StoryResponseDTO {
	@Expose() storyId: string;
	@Expose() userId: string;
	@Expose() title: string;
	@Expose() body: string;
	@Expose() createdAt: Date;
	@Expose() updatedAt: Date;
}
