import { Router } from 'express';
import { userController } from '../containers/userContainer';
import { validateRequest } from '../middleware/validationMiddleware';
import { createUserSchema, updateUserSchema, userIdSchema } from '../schemas/userSchema';

const router = Router();

router.post(
	'/',
	validateRequest({ body: createUserSchema }),
	userController.create.bind(userController),
);
router.get('/', userController.findAll.bind(userController));
router.get(
	'/:userId',
	validateRequest({ params: userIdSchema }),
	userController.findOne.bind(userController),
);
router.patch(
	'/:userId',
	validateRequest({ params: userIdSchema, body: updateUserSchema }),
	userController.patchUpdate.bind(userController),
);
router.delete(
	'/:userId',
	validateRequest({ params: userIdSchema }),
	userController.delete.bind(userController),
);

export default router;
