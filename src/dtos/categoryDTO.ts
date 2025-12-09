import { z } from 'zod';
import { Expose, Type } from 'class-transformer';
import { createCategorySchema, updateCategorySchema } from '../schemas/categorySchema';
import { StoryResponseDTO } from './storyDTO';

export type CreateCategoryDTO = z.infer<typeof createCategorySchema>;
export type UpdateCategoryDTO = z.infer<typeof updateCategorySchema>;

export class CategoryResponseDTO {
	@Expose() categoryId: string;
	@Expose() name: string;
	@Expose() description: string | null;
	@Expose() @Type(() => StoryResponseDTO) stories?: StoryResponseDTO[];
}
