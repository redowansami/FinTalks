import { Router } from 'express';
import { userController } from '../containers/userContainer';
import { validateRequest } from '../middleware/validationMiddleware';
import { createUserSchema, updateUserSchema, userIdSchema, userQuerySchema } from '../dtos/userDTO';

const router = Router();

router
	.post('/', validateRequest({ body: createUserSchema }), userController.create)
	.get('/', validateRequest({ query: userQuerySchema }), userController.findAll)
	.get('/:userId', validateRequest({ params: userIdSchema }), userController.findOne)
	.patch(
		'/:userId',
		validateRequest({ params: userIdSchema, body: updateUserSchema }),
		userController.update,
	)
	.delete('/:userId', validateRequest({ params: userIdSchema }), userController.delete);

export default router;
