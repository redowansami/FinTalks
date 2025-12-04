import { container } from 'tsyringe';
import { UserController } from '../controllers/userController';
import { Router } from 'express';
import { validateRequest } from '../middleware/validationMiddleware';
import { requireAuth } from '../middleware/authenticationMiddleware';
import { requireRolesUser, requireAdmin } from '../middleware/authorizationMiddleware';
import { UserRole } from '../entities/userEntity';
import {
	createUserSchema,
	escalateToAdminSchema,
	updateUserSchema,
	userIdSchema,
	userQuerySchema,
} from '../schemas/userSchema';

const router = Router();
const userController = container.resolve(UserController);

router
	.post('/', validateRequest({ body: createUserSchema }), userController.create)
	.get('/', validateRequest({ query: userQuerySchema }), userController.findAll)
	.patch(
		'/escalate-to-admin',
		requireAuth,
		requireAdmin,
		validateRequest({ body: escalateToAdminSchema }),
		userController.escalateToAdmin,
	)
	.get('/:userId', validateRequest({ params: userIdSchema }), userController.findOne)
	.patch(
		'/:userId',
		requireAuth,
		requireRolesUser(),
		validateRequest({ params: userIdSchema, body: updateUserSchema }),
		userController.update,
	)
	.delete(
		'/:userId',
		requireAuth,
		requireRolesUser([UserRole.ADMIN]),
		validateRequest({ params: userIdSchema }),
		userController.delete,
	);

export default router;
