import { z } from 'zod';
import { Expose } from 'class-transformer';
import { createCategorySchema, updateCategorySchema } from '../schemas/categorySchema';

export type CreateCategoryDTO = z.infer<typeof createCategorySchema>;
export type UpdateCategoryDTO = z.infer<typeof updateCategorySchema>;

export class CategoryResponseDTO {
	@Expose() categoryId: string;
	@Expose() name: string;
	@Expose() description: string | null;
}
