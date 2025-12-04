import { Request, Response } from 'express';
import { AuthService } from '../services/authService';
import { HTTP_STATUS, HTTP_MESSAGES } from '../constants/httpConstants';
import { autoInjectable } from 'tsyringe';
import { SignupDTO, LoginDTO } from '../dtos/authDTO';

@autoInjectable()
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	signup = async (req: Request, res: Response): Promise<void> => {
		const data = req.body as SignupDTO;
		const user = await this.authService.signup(data);
		res.status(HTTP_STATUS.CREATED).json({
			success: true,
			message: HTTP_MESSAGES.USER_CREATED,
			user,
		});
	};

	login = async (req: Request, res: Response): Promise<void> => {
		const data = req.body as LoginDTO;
		const { token, user } = await this.authService.login(data);
		res.status(HTTP_STATUS.OK).json({ success: true, token, user });
	};
}
