import { Request, Response } from 'express';
import { CategoryService } from '../services/categoryService';
import { CreateCategoryDTO, UpdateCategoryDTO } from '../dtos/categoryDTO';
import { injectable } from 'tsyringe';
import { HTTP_STATUS, HTTP_MESSAGES } from '../constants/httpConstants';

@injectable()
export class CategoryController {
	constructor(private readonly categoryService: CategoryService) {}

	createCategory = async (req: Request, res: Response): Promise<void> => {
		const data = req.body as CreateCategoryDTO;
		const category = await this.categoryService.createCategory(data);
		res.status(HTTP_STATUS.CREATED).json({
			success: true,
			message: HTTP_MESSAGES.CATEGORY_CREATED,
			data: category,
		});
	};

	getAllCategories = async (_req: Request, res: Response): Promise<void> => {
		const categories = await this.categoryService.getAllCategories();
		res.status(HTTP_STATUS.OK).json({
			success: true,
			message: HTTP_MESSAGES.CATEGORY_FETCHED,
			data: categories,
		});
	};

	getCategoryById = async (req: Request, res: Response): Promise<void> => {
		const { categoryId } = req.params;
		const category = await this.categoryService.getCategoryById(categoryId);
		res.status(HTTP_STATUS.OK).json({
			success: true,
			message: HTTP_MESSAGES.CATEGORY_FETCHED,
			data: category,
		});
	};

	updateCategory = async (req: Request, res: Response): Promise<void> => {
		const { categoryId } = req.params;
		const data = req.body as UpdateCategoryDTO;
		const category = await this.categoryService.updateCategory(categoryId, data);
		res.status(HTTP_STATUS.OK).json({
			success: true,
			message: HTTP_MESSAGES.CATEGORY_UPDATED,
			data: category,
		});
	};

	deleteCategory = async (req: Request, res: Response): Promise<void> => {
		const { categoryId } = req.params;
		const result = await this.categoryService.deleteCategory(categoryId);
		res.status(HTTP_STATUS.OK).json({
			success: true,
			message: result.message,
		});
	};
}
