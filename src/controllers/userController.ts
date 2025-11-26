import { Request, Response } from 'express';
import { UserService } from '../services/userService';
import { UpdateUserDTO } from '../dtos/userDTO';
import { HTTP_STATUS, HTTP_MESSAGES } from '../constants/httpConstants';

export class UserController {
	constructor(private readonly userService: UserService) {}

	create = async (req: Request, res: Response): Promise<void> => {
		const result = await this.userService.createUser(req.body);
		res.status(HTTP_STATUS.CREATED).json({
			success: true,
			message: HTTP_MESSAGES.USER_CREATED,
			user: result,
		});
	};

	findAll = async (req: Request, res: Response): Promise<void> => {
		const users = await this.userService.getAllUsers();
		res.json({ success: true, users });
	};

	findOne = async (req: Request, res: Response): Promise<void> => {
		const { userId } = req.params;
		const user = await this.userService.getUserById(userId);

		res.json({ success: true, user });
	};

	patchUpdate = async (req: Request, res: Response): Promise<void> => {
		const { userId } = req.params;
		await this.userService.updateUser(userId, req.body as UpdateUserDTO);

		res.json({ success: true, message: HTTP_MESSAGES.USER_UPDATED });
	};

	delete = async (req: Request, res: Response): Promise<void> => {
		const { userId } = req.params;
		await this.userService.deleteUser(userId);
		res.json({ success: true, message: HTTP_MESSAGES.USER_DELETED });
	};
}
