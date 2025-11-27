import { Router } from 'express';
import { userController } from '../containers/userContainer';
import { validateRequest } from '../middleware/validationMiddleware';
import { createUserDTO, updateUserDTO, userIdDTO, paginationQueryDTO } from '../dtos/userDTO';

const router = Router();

router
	.post('/', validateRequest({ body: createUserDTO }), userController.create)
	.get('/', validateRequest({ query: paginationQueryDTO }), userController.findAll)
	.get('/:userId', validateRequest({ params: userIdDTO }), userController.findOne)
	.patch(
		'/:userId',
		validateRequest({ params: userIdDTO, body: updateUserDTO }),
		userController.patchUpdate,
	)
	.delete('/:userId', validateRequest({ params: userIdDTO }), userController.delete);

export default router;
