import { Router } from 'express';
import asyncHandler from 'express-async-handler';
import { userController } from '../containers/userContainer';
import { validateRequest } from '../middleware/validationMiddleware';
import { createUserDTO, updateUserDTO, userIdDTO } from '../dtos/userDTO';

const router = Router();

router.post('/', validateRequest({ body: createUserDTO }), asyncHandler(userController.create));

router.get('/', asyncHandler(userController.findAll));

router.get(
	'/:userId',
	validateRequest({ params: userIdDTO }),
	asyncHandler(userController.findOne),
);

router.patch(
	'/:userId',
	validateRequest({ params: userIdDTO, body: updateUserDTO }),
	asyncHandler(userController.patchUpdate),
);

router.delete(
	'/:userId',
	validateRequest({ params: userIdDTO }),
	asyncHandler(userController.delete),
);

export default router;
