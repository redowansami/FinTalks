import { Request, Response } from 'express';
import { UserService } from '../services/userService';
import { AuthService } from '../services/authService';
import { UserQueryDTO } from '../dtos/userDTO';
import { InitiatePasswordChangeDTO, ConfirmPasswordChangeDTO } from '../dtos/authDTO';
import { HTTP_STATUS, HTTP_MESSAGES } from '../constants/httpConstants';
import '../types/globals';
import { injectable } from 'tsyringe';
import { User } from 'entities/userEntity';
import jwt from 'jsonwebtoken';
import { env } from '../utils/envParser';

@injectable()
export class UserController {
	constructor(
		private readonly userService: UserService,
		private readonly authService: AuthService,
	) {}

	findAll = async (req: Request, res: Response): Promise<void> => {
		const result = await this.userService.findAllUsers(req.validatedReq.query as UserQueryDTO);
		res.status(HTTP_STATUS.OK).json({ success: true, ...result });
	};

	findOne = async (req: Request, res: Response): Promise<void> => {
		const userId = req.params.userId;
		const user = await this.userService.getUserById(userId);

		res.status(HTTP_STATUS.OK).json({ success: true, user });
	};

	delete = async (req: Request, res: Response): Promise<void> => {
		const userId = req.params.userId;
		await this.userService.deleteUser(userId);
		res.sendStatus(HTTP_STATUS.NO_CONTENT);
	};

	escalateToAdmin = async (req: Request, res: Response): Promise<void> => {
		const { userId } = req.body;
		const user = await this.userService.escalateUserToAdmin(userId);

		res.status(HTTP_STATUS.OK).json({
			success: true,
			message: HTTP_MESSAGES.USER_UPDATED,
			user,
		});
	};

	initiatePasswordChange = async (
		req: Request & { user?: User },
		res: Response,
	): Promise<void> => {
		const userId = req.user!.userId;
		const data = req.body as InitiatePasswordChangeDTO;

		const result = await this.authService.initiatePasswordChange(userId, data);

		res.status(HTTP_STATUS.OK).json({
			success: true,
			message: result.message,
		});
	};

	confirmPasswordChange = async (req: Request, res: Response): Promise<void> => {
		const { token } = req.params;
		const data = req.body as ConfirmPasswordChangeDTO;

		const decoded = jwt.verify(token, env.JWT_SECRET) as {
			userId: string;
		};

		const result = await this.authService.confirmPasswordChange(decoded.userId, data);

		res.status(HTTP_STATUS.OK).json({
			success: true,
			message: result.message,
		});
	};

	confirmPasswordCode = async (req: Request & { user?: User }, res: Response): Promise<void> => {
		const userId = req.user!.userId;
		const { code } = req.body;

		const result = await this.authService.confirmPasswordCode(userId, code);

		res.status(HTTP_STATUS.OK).json({
			success: true,
			message: result.message,
			token: result.token,
		});
	};

	getProfile = async (req: Request & { user?: User }, res: Response): Promise<void> => {
		const userId = req.user!.userId;
		const profile = await this.userService.getProfile(userId);

		res.status(HTTP_STATUS.OK).json({
			success: true,
			message: HTTP_MESSAGES.PROFILE_FETCHED_SUCCESSFULLY,
			profile,
		});
	};

	updateProfile = async (req: Request & { user?: User }, res: Response): Promise<void> => {
		const userId = req.user!.userId;
		const profile = await this.userService.updateProfile(userId, req.body);

		res.status(HTTP_STATUS.OK).json({
			success: true,
			message: HTTP_MESSAGES.PROFILE_UPDATED_SUCCESSFULLY,
			profile,
		});
	};
}
