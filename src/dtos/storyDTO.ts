import { z } from 'zod';
import { Expose, Type } from 'class-transformer';
import {
	createStorySchema,
	storyIdSchema,
	storyQuerySchema,
	updateStorySchema,
} from '../schemas/storySchema';
import { CategoryResponseDTO } from './categoryDTO';

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
	@Expose() summary?: string | null;
	@Expose() reliabilityScore?: number | null;
	@Expose() predictionComparison?: string | null;
	@Expose() summaryUpdatedAt?: Date | null;
	@Expose() imageUrl?: string | null;
	@Expose() @Type(() => CategoryResponseDTO) categories?: CategoryResponseDTO[];
}
