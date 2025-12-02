import { Router } from 'express';
import { container } from 'tsyringe';
import { StoryController } from '../controllers/storyController';
import { validateRequest } from '../middleware/validationMiddleware';
import {
	createStorySchema,
	storyIdSchema,
	storyQuerySchema,
	updateStorySchema,
} from '../dtos/storyDTO';
import 'reflect-metadata';

const router = Router();
const storyController = container.resolve(StoryController);

router
	.post('/', validateRequest({ body: createStorySchema }), storyController.create)
	.get('/', validateRequest({ query: storyQuerySchema }), storyController.findAll)
	.get('/:storyId', validateRequest({ params: storyIdSchema }), storyController.findOne)
	.patch(
		'/:storyId',
		validateRequest({ params: storyIdSchema, body: updateStorySchema }),
		storyController.update,
	)
	.delete('/:storyId', validateRequest({ params: storyIdSchema }), storyController.delete);

export default router;
