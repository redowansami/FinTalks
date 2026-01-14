import { CategoryController } from '../controllers/categoryController';
import { CategoryService } from '../services/categoryService';
import { CreateCategoryDTO, UpdateCategoryDTO, CategoryResponseDTO } from '../dtos/categoryDTO';
import { HTTP_STATUS, HTTP_MESSAGES } from '../constants/httpConstants';
import { Request, Response } from 'express';

jest.mock('../services/categoryService');

describe('CategoryController', () => {
	let categoryController: CategoryController;
	let mockCategoryService: jest.Mocked<CategoryService>;
	let mockReq: Partial<Request>;
	let mockRes: Partial<Response>;

	beforeEach(() => {
		jest.clearAllMocks();
		mockCategoryService = {
			createCategory: jest.fn(),
			getAllCategories: jest.fn(),
			getCategoryById: jest.fn(),
			updateCategory: jest.fn(),
			deleteCategory: jest.fn(),
			getCategoriesByIds: jest.fn(),
		} as unknown as jest.Mocked<CategoryService>;

		categoryController = new CategoryController(mockCategoryService);

		mockReq = {
			body: {},
			params: {},
		};

		mockRes = {
			status: jest.fn().mockReturnThis(),
			json: jest.fn().mockReturnThis(),
		};
	});

	describe('createCategory', () => {
		it('should create a new category and return 201 status', async () => {
			const createData: CreateCategoryDTO = {
				name: 'Technology',
				description: 'All tech related stories',
			};

			const mockCategory: CategoryResponseDTO = {
				categoryId: '123e4567-e89b-12d3-a456-426614174000',
				name: 'Technology',
				description: 'All tech related stories',
			};

			mockReq.body = createData;
			mockCategoryService.createCategory.mockResolvedValue(mockCategory);

			await categoryController.createCategory(mockReq as Request, mockRes as Response);

			expect(mockCategoryService.createCategory).toHaveBeenCalledWith(createData);
			expect(mockRes.status).toHaveBeenCalledWith(HTTP_STATUS.CREATED);
			expect(mockRes.json).toHaveBeenCalledWith({
				success: true,
				message: HTTP_MESSAGES.CATEGORY_CREATED,
				data: mockCategory,
			});
		});
	});

	describe('getAllCategories', () => {
		it('should return all categories with 200 status', async () => {
			const mockCategories: CategoryResponseDTO[] = [
				{
					categoryId: '123e4567-e89b-12d3-a456-426614174000',
					name: 'Technology',
					description: 'All tech related stories',
				},
				{
					categoryId: '223e4567-e89b-12d3-a456-426614174001',
					name: 'Finance',
					description: 'All finance related stories',
				},
			];

			mockCategoryService.getAllCategories.mockResolvedValue(mockCategories);

			await categoryController.getAllCategories(mockReq as Request, mockRes as Response);

			expect(mockCategoryService.getAllCategories).toHaveBeenCalled();
			expect(mockRes.status).toHaveBeenCalledWith(HTTP_STATUS.OK);
			expect(mockRes.json).toHaveBeenCalledWith({
				success: true,
				message: HTTP_MESSAGES.CATEGORY_FETCHED,
				data: mockCategories,
			});
		});

		it('should return empty array when no categories exist', async () => {
			mockCategoryService.getAllCategories.mockResolvedValue([]);

			await categoryController.getAllCategories(mockReq as Request, mockRes as Response);

			expect(mockRes.status).toHaveBeenCalledWith(HTTP_STATUS.OK);
			expect(mockRes.json).toHaveBeenCalledWith({
				success: true,
				message: HTTP_MESSAGES.CATEGORY_FETCHED,
				data: [],
			});
		});
	});

	describe('getCategoryById', () => {
		it('should return a category by id with 200 status', async () => {
			const categoryId = '123e4567-e89b-12d3-a456-426614174000';
			const mockCategory: CategoryResponseDTO = {
				categoryId,
				name: 'Technology',
				description: 'All tech related stories',
			};

			mockReq.params = { categoryId };
			mockCategoryService.getCategoryById.mockResolvedValue(mockCategory);

			await categoryController.getCategoryById(mockReq as Request, mockRes as Response);

			expect(mockCategoryService.getCategoryById).toHaveBeenCalledWith(categoryId);
			expect(mockRes.status).toHaveBeenCalledWith(HTTP_STATUS.OK);
			expect(mockRes.json).toHaveBeenCalledWith({
				success: true,
				message: HTTP_MESSAGES.CATEGORY_FETCHED,
				data: mockCategory,
			});
		});
	});

	describe('updateCategory', () => {
		it('should update a category and return 200 status', async () => {
			const categoryId = '123e4567-e89b-12d3-a456-426614174000';
			const updateData: UpdateCategoryDTO = {
				name: 'Updated Technology',
				description: 'Updated description',
			};

			const mockUpdatedCategory: CategoryResponseDTO = {
				categoryId,
				name: 'Updated Technology',
				description: 'Updated description',
			};

			mockReq.params = { categoryId };
			mockReq.body = updateData;
			mockCategoryService.updateCategory.mockResolvedValue(mockUpdatedCategory);

			await categoryController.updateCategory(mockReq as Request, mockRes as Response);

			expect(mockCategoryService.updateCategory).toHaveBeenCalledWith(categoryId, updateData);
			expect(mockRes.status).toHaveBeenCalledWith(HTTP_STATUS.OK);
			expect(mockRes.json).toHaveBeenCalledWith({
				success: true,
				message: HTTP_MESSAGES.CATEGORY_UPDATED,
				data: mockUpdatedCategory,
			});
		});

		it('should update only name field', async () => {
			const categoryId = '123e4567-e89b-12d3-a456-426614174000';
			const updateData: UpdateCategoryDTO = {
				name: 'New Name',
			};

			const mockUpdatedCategory: CategoryResponseDTO = {
				categoryId,
				name: 'New Name',
				description: 'Old description',
			};

			mockReq.params = { categoryId };
			mockReq.body = updateData;
			mockCategoryService.updateCategory.mockResolvedValue(mockUpdatedCategory);

			await categoryController.updateCategory(mockReq as Request, mockRes as Response);

			expect(mockCategoryService.updateCategory).toHaveBeenCalledWith(categoryId, updateData);
			expect(mockRes.status).toHaveBeenCalledWith(HTTP_STATUS.OK);
		});
	});

	describe('deleteCategory', () => {
		it('should delete a category and return 200 status', async () => {
			const categoryId = '123e4567-e89b-12d3-a456-426614174000';
			const mockDeleteResponse = { message: HTTP_MESSAGES.CATEGORY_DELETED };

			mockReq.params = { categoryId };
			mockCategoryService.deleteCategory.mockResolvedValue(mockDeleteResponse);

			await categoryController.deleteCategory(mockReq as Request, mockRes as Response);

			expect(mockCategoryService.deleteCategory).toHaveBeenCalledWith(categoryId);
			expect(mockRes.status).toHaveBeenCalledWith(HTTP_STATUS.OK);
			expect(mockRes.json).toHaveBeenCalledWith({
				success: true,
				message: mockDeleteResponse.message,
			});
		});
	});
});
