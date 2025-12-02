import { Router } from 'express';
import { storyController } from '../containers/storyContainer';
import { validateRequest } from '../middleware/validationMiddleware';
import {
	createStorySchema,
	storyIdSchema,
	storyQuerySchema,
	updateStorySchema,
} from '../dtos/storyDTO';

const router = Router();

router
	.post('/', validateRequest({ body: createStorySchema }), storyController.create)
	.get('/', validateRequest({ query: storyQuerySchema }), storyController.findAll)
	.get('/:storyId', validateRequest({ params: storyIdSchema }), storyController.findOne)
	.patch(
		'/:storyId',
		validateRequest({ params: storyIdSchema, body: updateStorySchema }),
		storyController.patchUpdate,
	)
	.delete('/:storyId', validateRequest({ params: storyIdSchema }), storyController.delete);

export default router;
