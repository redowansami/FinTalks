import { Router } from 'express';
import { container } from 'tsyringe';
import { StoryController } from '../controllers/storyController';
import { validateRequest } from '../middleware/validationMiddleware';
import { requireAuth } from '../middleware/authenticationMiddleware';
import { requireRolesStory } from '../middleware/authorizationMiddleware';
import { UserRole } from '../entities/userEntity';
import {
	createStorySchema,
	storyIdSchema,
	storyAndCategoryIdSchema,
	storyQuerySchema,
	updateStorySchema,
} from '../schemas/storySchema';
import 'reflect-metadata';

const router = Router();
const storyController = container.resolve(StoryController);

router
	.post('/', requireAuth, validateRequest({ body: createStorySchema }), storyController.create)
	.get('/', validateRequest({ query: storyQuerySchema }), storyController.findAll)
	.get('/:storyId', validateRequest({ params: storyIdSchema }), storyController.findOne)
	.patch(
		'/:storyId',
		requireAuth,
		requireRolesStory(),
		validateRequest({ params: storyIdSchema, body: updateStorySchema }),
		storyController.update,
	)
	.delete(
		'/:storyId/categories/:categoryId',
		requireAuth,
		requireRolesStory(),
		validateRequest({ params: storyAndCategoryIdSchema }),
		storyController.removeCategoryFromStory,
	)
	.delete(
		'/:storyId',
		requireAuth,
		requireRolesStory([UserRole.ADMIN]),
		validateRequest({ params: storyIdSchema }),
		storyController.delete,
	);

export default router;
