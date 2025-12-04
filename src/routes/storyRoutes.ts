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
	storyQuerySchema,
	updateStorySchema,
} from '../schemas/storySchema';
import 'reflect-metadata';

const router = Router();
const storyController = container.resolve(StoryController);

router
	.post('/', validateRequest({ body: createStorySchema }), requireAuth, storyController.create)
	.get('/', validateRequest({ query: storyQuerySchema }), storyController.findAll)
	.get('/:storyId', validateRequest({ params: storyIdSchema }), storyController.findOne)
	.patch(
		'/:storyId',
		validateRequest({ params: storyIdSchema, body: updateStorySchema }),
		requireAuth,
		requireRolesStory(),
		storyController.update,
	)
	.delete(
		'/:storyId',
		validateRequest({ params: storyIdSchema }),
		requireAuth,
		requireRolesStory([UserRole.ADMIN]),
		storyController.delete,
	);

export default router;
