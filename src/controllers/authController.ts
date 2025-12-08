import { Request, Response } from 'express';
import { AuthService } from '../services/authService';
import { HTTP_STATUS, HTTP_MESSAGES } from '../constants/httpConstants';
import { SignupDTO, LoginDTO } from '../dtos/authDTO';
import { injectable } from 'tsyringe';

@injectable()
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	signup = async (req: Request, res: Response): Promise<void> => {
		const data = req.body as SignupDTO;
		const user = await this.authService.signup(data);
		res.status(HTTP_STATUS.CREATED).json({
			success: true,
			message: HTTP_MESSAGES.EMAIL_CONFIRMATION_SENT,
			user,
		});
	};

	login = async (req: Request, res: Response): Promise<void> => {
		const data = req.body as LoginDTO;
		const { token, user } = await this.authService.login(data);
		res.status(HTTP_STATUS.OK).json({ success: true, token, user });
	};

	confirmEmail = async (req: Request, res: Response): Promise<void> => {
		const { token } = req.params;
		const result = await this.authService.confirmEmail(token);
		res.status(HTTP_STATUS.OK).json({
			success: true,
			message: result.message,
			isConfirmed: result.isConfirmed,
		});
	};

	resendConfirmationEmail = async (req: Request, res: Response): Promise<void> => {
		const { email } = req.body;
		const result = await this.authService.resendConfirmationEmail(email);
		res.status(HTTP_STATUS.OK).json({
			success: true,
			message: result.message,
		});
	};
}
