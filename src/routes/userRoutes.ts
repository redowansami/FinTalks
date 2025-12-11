import { container } from 'tsyringe';
import { UserController } from '../controllers/userController';
import { Router } from 'express';
import { validateRequest } from '../middleware/validationMiddleware';
import { requireAuth } from '../middleware/authenticationMiddleware';
import { requireRolesUser, requireAdmin } from '../middleware/authorizationMiddleware';
import { UserRole } from '../entities/userEntity';
import {
	escalateToAdminSchema,
	userIdSchema,
	userQuerySchema,
	updateProfileSchema,
} from '../schemas/userSchema';
import {
	initiatePasswordChangeSchema,
	confirmationCodeSchema,
	confirmPasswordChangeSchema,
} from '../schemas/authSchema';

const router = Router();
const userController = container.resolve(UserController);

router
	.get('/', validateRequest({ query: userQuerySchema }), userController.findAll)
	.get('/profile', requireAuth, userController.getProfile)
	.patch(
		'/profile',
		requireAuth,
		validateRequest({ body: updateProfileSchema }),
		userController.updateProfile,
	)
	.patch(
		'/escalate-to-admin',
		requireAuth,
		requireAdmin,
		validateRequest({ body: escalateToAdminSchema }),
		userController.escalateToAdmin,
	)
	.post(
		'/change-password',
		requireAuth,
		validateRequest({ body: initiatePasswordChangeSchema }),
		userController.initiatePasswordChange,
	)
	.post(
		'/confirm-password-code',
		requireAuth,
		validateRequest({ body: confirmationCodeSchema }),
		userController.confirmPasswordCode,
	)
	.post(
		'/confirm-password-change/:token',
		validateRequest({
			body: confirmPasswordChangeSchema,
		}),
		userController.confirmPasswordChange,
	)
	.get('/:userId', validateRequest({ params: userIdSchema }), userController.findOne)
	.delete(
		'/:userId',
		requireAuth,
		requireRolesUser([UserRole.ADMIN]),
		validateRequest({ params: userIdSchema }),
		userController.delete,
	);

export default router;
