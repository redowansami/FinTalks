import { Router } from 'express';
import asyncHandler from 'express-async-handler';
import { userController } from '../containers/userContainer';
import { validateRequest } from '../middleware/validationMiddleware';
import { createUserDTO, updateUserDTO, userIdDTO } from '../dtos/userDTO';

const router = Router();

router
	.post('/', validateRequest({ body: createUserDTO }), asyncHandler(userController.create))
	.get('/', asyncHandler(userController.findAll))
	.get('/:userId', validateRequest({ params: userIdDTO }), asyncHandler(userController.findOne))
	.patch(
		'/:userId',
		validateRequest({ params: userIdDTO, body: updateUserDTO }),
		asyncHandler(userController.patchUpdate),
	)
	.delete(
		'/:userId',
		validateRequest({ params: userIdDTO }),
		asyncHandler(userController.delete),
	);

export default router;
