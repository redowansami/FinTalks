import { Router } from 'express';
import { storyController } from '../containers/storyContainer';
import { validateRequest } from '../middleware/validationMiddleware';
import { createStoryDTO, updateStoryDTO, storyIdDTO } from '../dtos/storyDTO';

const router = Router();

router
	.post(
		'/',
		validateRequest({ body: createStoryDTO }),
		storyController.create.bind(storyController),
	)
	.get('/', storyController.findAll.bind(storyController))
	.get(
		'/:storyId',
		validateRequest({ params: storyIdDTO }),
		storyController.findOne.bind(storyController),
	)
	.patch(
		'/:storyId',
		validateRequest({ params: storyIdDTO, body: updateStoryDTO }),
		storyController.patchUpdate.bind(storyController),
	)
	.delete(
		'/:storyId',
		validateRequest({ params: storyIdDTO }),
		storyController.delete.bind(storyController),
	);

export default router;
