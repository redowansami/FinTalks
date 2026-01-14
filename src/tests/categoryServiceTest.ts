import { CategoryService } from '../services/categoryService';
import { CategoryRepository } from '../repositories/categoryRepository';
import { CreateCategoryDTO, UpdateCategoryDTO, CategoryResponseDTO } from '../dtos/categoryDTO';
import { notFoundCreator, conflictCreator } from '../errors/errorFactory';
import { transformToDTO } from '../utils/mapper';
import { HTTP_MESSAGES } from '../constants/httpConstants';
import { ConflictError, NotFoundError } from 'errors/customErrors';

jest.mock('../repositories/categoryRepository');
jest.mock('../utils/mapper');
jest.mock('../errors/errorFactory', () => ({
	notFoundCreator: { create: jest.fn() },
	conflictCreator: { create: jest.fn() },
}));

describe('CategoryService', () => {
	let categoryService: CategoryService;
	let mockCategoryRepository: jest.Mocked<CategoryRepository>;
	let mockTransformToDTO: jest.MockedFunction<typeof transformToDTO>;

	beforeEach(() => {
		jest.clearAllMocks();
		mockCategoryRepository = {
			findByName: jest.fn(),
			create: jest.fn(),
			findAll: jest.fn(),
			findById: jest.fn(),
			update: jest.fn(),
			delete: jest.fn(),
			findByIds: jest.fn(),
		} as unknown as jest.Mocked<CategoryRepository>;
		mockTransformToDTO = transformToDTO as jest.MockedFunction<typeof transformToDTO>;
		categoryService = new CategoryService(mockCategoryRepository);
	});

	describe('createCategory', () => {
		const createCategoryData: CreateCategoryDTO = {
			name: 'Technology',
			description: 'All tech related stories',
		};

		const mockCategoryEntity = {
			categoryId: '123e4567-e89b-12d3-a456-426614174000',
			name: 'Technology',
			description: 'All tech related stories',
			stories: [],
		};

		const mockCategoryDTO: CategoryResponseDTO = {
			categoryId: '123e4567-e89b-12d3-a456-426614174000',
			name: 'Technology',
			description: 'All tech related stories',
			stories: [],
		};

		it('should create a category successfully', async () => {
			mockCategoryRepository.findByName.mockResolvedValue(null);
			mockCategoryRepository.create.mockResolvedValue(mockCategoryEntity);
			mockTransformToDTO.mockReturnValue(mockCategoryDTO);

			const result = await categoryService.createCategory(createCategoryData);

			expect(mockCategoryRepository.findByName).toHaveBeenCalledWith(createCategoryData.name);
			expect(mockCategoryRepository.create).toHaveBeenCalledWith(createCategoryData);
			expect(mockTransformToDTO).toHaveBeenCalledWith(
				CategoryResponseDTO,
				mockCategoryEntity,
			);
			expect(result).toEqual(mockCategoryDTO);
		});

		it('should throw ConflictError if category name already exists', async () => {
			mockCategoryRepository.findByName.mockResolvedValue(mockCategoryEntity);

			const mockError = new Error(HTTP_MESSAGES.CATEGORY_EXISTS) as ConflictError;
			(conflictCreator.create as jest.Mock).mockReturnValue(mockError);

			await expect(categoryService.createCategory(createCategoryData)).rejects.toThrow();

			expect(mockCategoryRepository.findByName).toHaveBeenCalledWith(createCategoryData.name);
			expect(mockCategoryRepository.create).not.toHaveBeenCalled();
		});

		it('should call create with correct parameters', async () => {
			mockCategoryRepository.findByName.mockResolvedValue(null);
			mockCategoryRepository.create.mockResolvedValue(mockCategoryEntity);
			mockTransformToDTO.mockReturnValue(mockCategoryDTO);

			await categoryService.createCategory(createCategoryData);

			expect(mockCategoryRepository.create).toHaveBeenCalledTimes(1);
			expect(mockCategoryRepository.create).toHaveBeenCalledWith(createCategoryData);
		});
	});

	describe('getAllCategories', () => {
		const mockCategories = [
			{
				categoryId: '123e4567-e89b-12d3-a456-426614174001',
				name: 'Technology',
				description: 'Tech stories',
				stories: [],
			},
			{
				categoryId: '123e4567-e89b-12d3-a456-426614174002',
				name: 'Finance',
				description: 'Finance stories',
				stories: [],
			},
		];

		const mockCategoryDTOs = [
			{
				categoryId: '123e4567-e89b-12d3-a456-426614174001',
				name: 'Technology',
				description: 'Tech stories',
			},
			{
				categoryId: '123e4567-e89b-12d3-a456-426614174002',
				name: 'Finance',
				description: 'Finance stories',
			},
		];

		it('should retrieve all categories successfully', async () => {
			mockCategoryRepository.findAll.mockResolvedValue(mockCategories);
			mockTransformToDTO.mockImplementation(
				(dtoClass, entity: any) =>
					({
						categoryId: entity.categoryId,
						name: entity.name,
						description: entity.description,
					}) as CategoryResponseDTO,
			);

			const result = await categoryService.getAllCategories();

			expect(mockCategoryRepository.findAll).toHaveBeenCalled();
			expect(mockTransformToDTO).toHaveBeenCalledTimes(2);
			expect(result).toHaveLength(2);
			expect(result).toEqual(mockCategoryDTOs);
		});

		it('should return empty array when no categories exist', async () => {
			mockCategoryRepository.findAll.mockResolvedValue([]);

			const result = await categoryService.getAllCategories();

			expect(result).toEqual([]);
			expect(mockCategoryRepository.findAll).toHaveBeenCalled();
		});

		it('should call transformToDTO for each category', async () => {
			mockCategoryRepository.findAll.mockResolvedValue(mockCategories);
			mockTransformToDTO.mockReturnValue({} as CategoryResponseDTO);

			await categoryService.getAllCategories();

			expect(mockTransformToDTO).toHaveBeenCalledTimes(mockCategories.length);
		});
	});

	describe('getCategoryById', () => {
		const categoryId = '123e4567-e89b-12d3-a456-426614174000';
		const mockCategory = {
			categoryId,
			name: 'Technology',
			description: 'Tech stories',
			stories: [],
		};

		const mockCategoryDTO: CategoryResponseDTO = {
			categoryId,
			name: 'Technology',
			description: 'Tech stories',
		};

		it('should retrieve a category by id successfully', async () => {
			mockCategoryRepository.findById.mockResolvedValue(mockCategory);
			mockTransformToDTO.mockReturnValue(mockCategoryDTO);

			const result = await categoryService.getCategoryById(categoryId);

			expect(mockCategoryRepository.findById).toHaveBeenCalledWith(categoryId);
			expect(mockTransformToDTO).toHaveBeenCalledWith(CategoryResponseDTO, mockCategory);
			expect(result).toEqual(mockCategoryDTO);
		});

		it('should throw NotFoundError if category does not exist', async () => {
			mockCategoryRepository.findById.mockResolvedValue(null);

			const mockError = new Error(HTTP_MESSAGES.CATEGORY_NOT_FOUND) as NotFoundError;
			(notFoundCreator.create as jest.Mock).mockReturnValue(mockError);

			await expect(categoryService.getCategoryById(categoryId)).rejects.toThrow();

			expect(mockCategoryRepository.findById).toHaveBeenCalledWith(categoryId);
			expect(mockTransformToDTO).not.toHaveBeenCalled();
		});
	});

	describe('updateCategory', () => {
		const categoryId = '123e4567-e89b-12d3-a456-426614174000';
		const updateData: UpdateCategoryDTO = {
			name: 'Updated Technology',
			description: 'Updated description',
		};

		const mockCategory = {
			categoryId,
			name: 'Technology',
			description: 'Tech stories',
			stories: [],
		};

		const mockUpdatedCategory = {
			categoryId,
			name: 'Updated Technology',
			description: 'Updated description',
			stories: [],
		};

		const mockUpdatedDTO: CategoryResponseDTO = {
			categoryId,
			name: 'Updated Technology',
			description: 'Updated description',
		};

		it('should update a category successfully when name is unchanged', async () => {
			const updateDataNoName = { description: 'Updated description' };
			mockCategoryRepository.findById.mockResolvedValue(mockCategory);
			mockCategoryRepository.update.mockResolvedValue(mockUpdatedCategory);
			mockTransformToDTO.mockReturnValue(mockUpdatedDTO);

			const result = await categoryService.updateCategory(categoryId, updateDataNoName);

			expect(mockCategoryRepository.findById).toHaveBeenCalledWith(categoryId);
			expect(mockCategoryRepository.update).toHaveBeenCalledWith(
				categoryId,
				updateDataNoName,
			);
			expect(mockTransformToDTO).toHaveBeenCalledWith(
				CategoryResponseDTO,
				mockUpdatedCategory,
			);
			expect(result).toEqual(mockUpdatedDTO);
		});

		it('should update a category successfully when name is changed and unique', async () => {
			mockCategoryRepository.findById.mockResolvedValueOnce(mockCategory);
			mockCategoryRepository.findByName.mockResolvedValue(null);
			mockCategoryRepository.update.mockResolvedValue(mockUpdatedCategory);
			mockTransformToDTO.mockReturnValue(mockUpdatedDTO);

			const result = await categoryService.updateCategory(categoryId, updateData);

			expect(mockCategoryRepository.findById).toHaveBeenCalledWith(categoryId);
			expect(mockCategoryRepository.findByName).toHaveBeenCalledWith(updateData.name);
			expect(mockCategoryRepository.update).toHaveBeenCalledWith(categoryId, updateData);
			expect(result).toEqual(mockUpdatedDTO);
		});

		it('should throw NotFoundError if category does not exist', async () => {
			mockCategoryRepository.findById.mockResolvedValue(null);

			const mockError = new Error(HTTP_MESSAGES.CATEGORY_NOT_FOUND) as NotFoundError;
			(notFoundCreator.create as jest.Mock).mockReturnValue(mockError);

			await expect(categoryService.updateCategory(categoryId, updateData)).rejects.toThrow();

			expect(mockCategoryRepository.findById).toHaveBeenCalledWith(categoryId);
			expect(mockCategoryRepository.update).not.toHaveBeenCalled();
		});

		it('should throw ConflictError if new name already exists', async () => {
			const existingCategory = {
				categoryId: 'different-id',
				name: 'Updated Technology',
				description: 'Different category',
				stories: [],
			};

			mockCategoryRepository.findById.mockResolvedValueOnce(mockCategory);
			mockCategoryRepository.findByName.mockResolvedValue(existingCategory);

			const mockError = new Error(HTTP_MESSAGES.CATEGORY_EXISTS) as ConflictError;
			(conflictCreator.create as jest.Mock).mockReturnValue(mockError);

			await expect(categoryService.updateCategory(categoryId, updateData)).rejects.toThrow();

			expect(mockCategoryRepository.findByName).toHaveBeenCalledWith(updateData.name);
			expect(mockCategoryRepository.update).not.toHaveBeenCalled();
		});

		it('should not check name uniqueness when name is the same', async () => {
			const sameNameUpdate = { name: 'Technology' };
			mockCategoryRepository.findById.mockResolvedValue(mockCategory);
			mockCategoryRepository.update.mockResolvedValue({
				...mockCategory,
				...sameNameUpdate,
			});
			mockTransformToDTO.mockReturnValue(mockUpdatedDTO);

			await categoryService.updateCategory(categoryId, sameNameUpdate);

			expect(mockCategoryRepository.findByName).not.toHaveBeenCalled();
			expect(mockCategoryRepository.update).toHaveBeenCalledWith(categoryId, sameNameUpdate);
		});
	});

	describe('deleteCategory', () => {
		const categoryId = '123e4567-e89b-12d3-a456-426614174000';
		const mockCategory = {
			categoryId,
			name: 'Technology',
			description: 'Tech stories',
			stories: [],
		};

		it('should delete a category successfully', async () => {
			mockCategoryRepository.findById.mockResolvedValue(mockCategory);
			mockCategoryRepository.delete.mockResolvedValue(true);

			const result = await categoryService.deleteCategory(categoryId);

			expect(mockCategoryRepository.findById).toHaveBeenCalledWith(categoryId);
			expect(mockCategoryRepository.delete).toHaveBeenCalledWith(categoryId);
			expect(result).toEqual({ message: HTTP_MESSAGES.CATEGORY_DELETED });
		});

		it('should throw NotFoundError if category does not exist', async () => {
			mockCategoryRepository.findById.mockResolvedValue(null);

			const mockError = new Error(HTTP_MESSAGES.CATEGORY_NOT_FOUND) as NotFoundError;
			(notFoundCreator.create as jest.Mock).mockReturnValue(mockError);

			await expect(categoryService.deleteCategory(categoryId)).rejects.toThrow(
				HTTP_MESSAGES.CATEGORY_NOT_FOUND,
			);

			expect(mockCategoryRepository.findById).toHaveBeenCalledWith(categoryId);
			expect(mockCategoryRepository.delete).not.toHaveBeenCalled();
		});

		it('should call delete with correct category id', async () => {
			mockCategoryRepository.findById.mockResolvedValue(mockCategory);
			mockCategoryRepository.delete.mockResolvedValue(true);

			await categoryService.deleteCategory(categoryId);

			expect(mockCategoryRepository.delete).toHaveBeenCalledTimes(1);
			expect(mockCategoryRepository.delete).toHaveBeenCalledWith(categoryId);
		});
	});

	describe('getCategoriesByIds', () => {
		const categoryIds = [
			'123e4567-e89b-12d3-a456-426614174001',
			'123e4567-e89b-12d3-a456-426614174002',
		];

		const mockCategories = [
			{
				categoryId: categoryIds[0],
				name: 'Technology',
				description: 'Tech stories',
				stories: [],
			},
			{
				categoryId: categoryIds[1],
				name: 'Finance',
				description: 'Finance stories',
				stories: [],
			},
		];

		const mockCategoryDTOs = [
			{
				categoryId: categoryIds[0],
				name: 'Technology',
				description: 'Tech stories',
			},
			{
				categoryId: categoryIds[1],
				name: 'Finance',
				description: 'Finance stories',
			},
		];

		it('should retrieve multiple categories by ids successfully', async () => {
			mockCategoryRepository.findByIds.mockResolvedValue(mockCategories);
			mockTransformToDTO.mockImplementation(
				(dtoClass, entity: any) =>
					({
						categoryId: entity.categoryId,
						name: entity.name,
						description: entity.description,
					}) as CategoryResponseDTO,
			);

			const result = await categoryService.getCategoriesByIds(categoryIds);

			expect(mockCategoryRepository.findByIds).toHaveBeenCalledWith(categoryIds);
			expect(mockTransformToDTO).toHaveBeenCalledTimes(2);
			expect(result).toEqual(mockCategoryDTOs);
		});

		it('should return empty array when empty array of ids is provided', async () => {
			const result = await categoryService.getCategoriesByIds([]);

			expect(result).toEqual([]);
			expect(mockCategoryRepository.findByIds).not.toHaveBeenCalled();
		});

		it('should return empty array when no categories are found', async () => {
			mockCategoryRepository.findByIds.mockResolvedValue([]);

			const result = await categoryService.getCategoriesByIds(categoryIds);

			expect(mockCategoryRepository.findByIds).toHaveBeenCalledWith(categoryIds);
			expect(result).toEqual([]);
		});

		it('should call transformToDTO for each found category', async () => {
			mockCategoryRepository.findByIds.mockResolvedValue(mockCategories);
			mockTransformToDTO.mockReturnValue({} as CategoryResponseDTO);

			await categoryService.getCategoriesByIds(categoryIds);

			expect(mockTransformToDTO).toHaveBeenCalledTimes(mockCategories.length);
		});

		it('should handle single category id', async () => {
			const singleId = [categoryIds[0]];
			const singleCategory = [mockCategories[0]];
			mockCategoryRepository.findByIds.mockResolvedValue(singleCategory);
			mockTransformToDTO.mockReturnValue(mockCategoryDTOs[0]);

			const result = await categoryService.getCategoriesByIds(singleId);

			expect(mockCategoryRepository.findByIds).toHaveBeenCalledWith(singleId);
			expect(result).toHaveLength(1);
		});
	});

	describe('Edge Cases and Line Coverage', () => {
		it('should handle undefined description in create', async () => {
			const dataWithoutDescription: CreateCategoryDTO = { name: 'Tech' };
			const mockCategoryEntity = {
				categoryId: '123e4567-e89b-12d3-a456-426614174000',
				name: 'Tech',
				description: null,
				stories: [],
			};
			const mockDTO: CategoryResponseDTO = {
				categoryId: '123e4567-e89b-12d3-a456-426614174000',
				name: 'Tech',
				description: null,
			};

			mockCategoryRepository.findByName.mockResolvedValue(null);
			mockCategoryRepository.create.mockResolvedValue(mockCategoryEntity);
			mockTransformToDTO.mockReturnValue(mockDTO);

			const result = await categoryService.createCategory(dataWithoutDescription);

			expect(result).toEqual(mockDTO);
		});

		it('should handle update with no changes', async () => {
			const categoryId = '123e4567-e89b-12d3-a456-426614174000';
			const emptyUpdate: UpdateCategoryDTO = {};
			const mockCategory = {
				categoryId,
				name: 'Technology',
				description: 'Tech stories',
				stories: [],
			};

			mockCategoryRepository.findById.mockResolvedValue(mockCategory);
			mockCategoryRepository.update.mockResolvedValue(mockCategory);
			mockTransformToDTO.mockReturnValue({
				categoryId,
				name: 'Technology',
				description: 'Tech stories',
			});

			const result = await categoryService.updateCategory(categoryId, emptyUpdate);

			expect(mockCategoryRepository.update).toHaveBeenCalledWith(categoryId, emptyUpdate);
			expect(result).toBeDefined();
		});

		it('should preserve null description through transformation', async () => {
			const categoryId = '123e4567-e89b-12d3-a456-426614174000';
			const mockCategory = {
				categoryId,
				name: 'Technology',
				description: null,
				stories: [],
			};

			mockCategoryRepository.findById.mockResolvedValue(mockCategory);
			mockTransformToDTO.mockReturnValue({
				categoryId,
				name: 'Technology',
				description: null,
			});

			const result = await categoryService.getCategoryById(categoryId);

			expect(result.description).toBeNull();
		});

		it('should handle category with empty stories array', async () => {
			const mockCategory = {
				categoryId: '123e4567-e89b-12d3-a456-426614174000',
				name: 'Technology',
				description: 'Tech stories',
				stories: [],
			};

			mockCategoryRepository.findAll.mockResolvedValue([mockCategory]);
			mockTransformToDTO.mockReturnValue({
				categoryId: '123e4567-e89b-12d3-a456-426614174000',
				name: 'Technology',
				description: 'Tech stories',
				stories: [],
			});

			const result = await categoryService.getAllCategories();

			expect(result[0].stories).toEqual([]);
		});
	});

	describe('Injectable Decorator', () => {
		it('should be instantiable with CategoryRepository dependency', () => {
			const instance = new CategoryService(mockCategoryRepository);
			expect(instance).toBeInstanceOf(CategoryService);
		});
	});
});
