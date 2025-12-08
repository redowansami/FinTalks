import { Router } from 'express';
import { container } from 'tsyringe';
import { AuthController } from '../controllers/authController';
import { validateRequest } from '../middleware/validationMiddleware';
import { signupSchema, loginSchema, resendConfirmationEmailSchema } from '../schemas/authSchema';

const router = Router();
const authController = container.resolve(AuthController);

router.post('/signup', validateRequest({ body: signupSchema }), authController.signup);
router.post('/login', validateRequest({ body: loginSchema }), authController.login);
router.get('/confirm-email/:token', authController.confirmEmail);
router.post(
	'/resend-confirmation-email',
	validateRequest({ body: resendConfirmationEmailSchema }),
	authController.resendConfirmationEmail,
);

export default router;
