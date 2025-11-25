import { Router } from 'express';
import { userController } from '../containers/userContainer';
import { validateRequest } from '../middleware/validationMiddleware';
import { createUserDTO, updateUserDTO, userIdDTO } from '../dtos/userDTO';

const router = Router();

router
	.post('/', validateRequest({ body: createUserDTO }), userController.create.bind(userController))
	.get('/', userController.findAll.bind(userController))
	.get(
		'/:userId',
		validateRequest({ params: userIdDTO }),
		userController.findOne.bind(userController),
	)
	.patch(
		'/:userId',
		validateRequest({ params: userIdDTO, body: updateUserDTO }),
		userController.patchUpdate.bind(userController),
	)
	.delete(
		'/:userId',
		validateRequest({ params: userIdDTO }),
		userController.delete.bind(userController),
	);

export default router;
