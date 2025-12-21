import { CategoryRepository } from '../repositories/categoryRepository';
import { CreateCategoryDTO, UpdateCategoryDTO, CategoryResponseDTO } from '../dtos/categoryDTO';
import { notFoundCreator, conflictCreator } from '../errors/errorFactory';
import { transformToDTO } from '../utils/mapper';
import { injectable } from 'tsyringe';
import { HTTP_MESSAGES } from '../constants/httpConstants';

@injectable()
export class CategoryService {
	constructor(private readonly categoryRepository: CategoryRepository) {}

	createCategory = async (data: CreateCategoryDTO): Promise<CategoryResponseDTO> => {
		const isNameExists = await this.categoryRepository.findByName(data.name);
		if (isNameExists) {
			throw conflictCreator.create(HTTP_MESSAGES.CATEGORY_EXISTS);
		}

		const category = await this.categoryRepository.create(data);
		return transformToDTO(CategoryResponseDTO, category);
	};

	getAllCategories = async (): Promise<CategoryResponseDTO[]> => {
		const categories = await this.categoryRepository.findAll();
		return categories.map((category) => transformToDTO(CategoryResponseDTO, category));
	};

	getCategoryById = async (categoryId: string): Promise<CategoryResponseDTO> => {
		const category = await this.categoryRepository.findById(categoryId);
		if (!category) {
			throw notFoundCreator.create(HTTP_MESSAGES.CATEGORY_NOT_FOUND);
		}
		return transformToDTO(CategoryResponseDTO, category);
	};

	updateCategory = async (
		categoryId: string,
		data: UpdateCategoryDTO,
	): Promise<CategoryResponseDTO> => {
		const category = await this.categoryRepository.findById(categoryId);
		if (!category) {
			throw notFoundCreator.create(HTTP_MESSAGES.CATEGORY_NOT_FOUND);
		}

		if (data.name && data.name !== category.name) {
			const isNameExists = await this.categoryRepository.findByName(data.name);
			if (isNameExists) {
				throw conflictCreator.create(HTTP_MESSAGES.CATEGORY_EXISTS);
			}
		}

		const updatedCategory = await this.categoryRepository.update(categoryId, data);
		return transformToDTO(CategoryResponseDTO, updatedCategory!);
	};

	deleteCategory = async (categoryId: string): Promise<{ message: string }> => {
		const category = await this.categoryRepository.findById(categoryId);
		if (!category) {
			throw notFoundCreator.create(HTTP_MESSAGES.CATEGORY_NOT_FOUND);
		}

		await this.categoryRepository.delete(categoryId);
		return { message: HTTP_MESSAGES.CATEGORY_DELETED };
	};

	getCategoriesByIds = async (categoryIds: string[]): Promise<CategoryResponseDTO[]> => {
		if (categoryIds.length === 0) {
			return [];
		}

		const categories = await this.categoryRepository.findByIds(categoryIds);
		return categories.map((category) => transformToDTO(CategoryResponseDTO, category));
	};
}
