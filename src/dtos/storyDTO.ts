import { z } from 'zod';
import { Expose } from 'class-transformer';
import {
	createStorySchema,
	storyIdSchema,
	storyQuerySchema,
	updateStorySchema,
} from '../schemas/storySchema';

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
