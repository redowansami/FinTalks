import { Router } from 'express';
import { storyController } from '../containers/storyContainer';
import { validateRequest } from '../middleware/validationMiddleware';
import { createStoryDTO, updateStoryDTO, storyIdDTO, storyQueryDTO } from '../dtos/storyDTO';

const router = Router();

router
	.post('/', validateRequest({ body: createStoryDTO }), storyController.create)
	.get('/', validateRequest({ query: storyQueryDTO }), storyController.findAll)
	.get('/:storyId', validateRequest({ params: storyIdDTO }), storyController.findOne)
	.patch(
		'/:storyId',
		validateRequest({ params: storyIdDTO, body: updateStoryDTO }),
		storyController.patchUpdate,
	)
	.delete('/:storyId', validateRequest({ params: storyIdDTO }), storyController.delete);

export default router;
