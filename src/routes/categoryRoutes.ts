import { Router } from 'express';
import { container } from 'tsyringe';
import { CategoryController } from '../controllers/categoryController';
import { validateRequest } from '../middleware/validationMiddleware';
import { requireAuth } from '../middleware/authenticationMiddleware';
import { requireAdmin } from '../middleware/authorizationMiddleware';
import { seedCategories } from '../utils/categorySeeder';
import {
	categoryIdSchema,
	createCategorySchema,
	updateCategorySchema,
} from '../schemas/categorySchema';
import { HTTP_MESSAGES } from 'constants/httpConstants';

const router = Router();
const categoryController = container.resolve(CategoryController);

router
	.post(
		'/',
		requireAuth,
		requireAdmin,
		validateRequest({ body: createCategorySchema }),
		categoryController.createCategory,
	)
	.get('/', categoryController.getAllCategories)
	.get(
		'/:categoryId',
		validateRequest({ params: categoryIdSchema }),
		categoryController.getCategoryById,
	)
	.patch(
		'/:categoryId',
		requireAuth,
		requireAdmin,
		validateRequest({ params: categoryIdSchema, body: updateCategorySchema }),
		categoryController.updateCategory,
	)
	.delete(
		'/:categoryId',
		requireAuth,
		requireAdmin,
		validateRequest({ params: categoryIdSchema }),
		categoryController.deleteCategory,
	)
	.post('/seed', requireAuth, requireAdmin, async (_req, res) => {
		await seedCategories();
		res.status(200).json({
			success: true,
			message: HTTP_MESSAGES.SEEDED_SUCCESSFULLY,
		});
	});

export default router;
