import { Response } from 'express';
import { UserService } from '../services/userService';
import { CreateUserDTO, UpdateUserDTO } from '../dtos/userDTO';
import { HTTP_STATUS, HTTP_MESSAGES } from '../constants/httpConstants';
import { ValidatedRequest } from '../middleware/validationMiddleware';

export class UserController {
	constructor(private readonly userService: UserService) {}

	create = async (req: ValidatedRequest, res: Response): Promise<void> => {
		const createUser: CreateUserDTO = req.validated?.body as CreateUserDTO;
		const result = await this.userService.createUser(createUser);
		res.status(HTTP_STATUS.CREATED).json({
			success: true,
			message: HTTP_MESSAGES.USER_CREATED,
			user: result,
		});
	};

	findAll = async (req: ValidatedRequest, res: Response): Promise<void> => {
		const users = await this.userService.getAllUsers();
		res.json({ success: true, users });
	};

	findOne = async (req: ValidatedRequest, res: Response): Promise<void> => {
		const id = (req.validated?.params as Record<string, string>).userId;
		const user = await this.userService.getUserById(id);

		res.json({ success: true, user });
	};

	patchUpdate = async (req: ValidatedRequest, res: Response): Promise<void> => {
		const id = (req.validated?.params as Record<string, string>).userId;
		const updateUser: UpdateUserDTO = req.validated?.body as UpdateUserDTO;
		await this.userService.updateUser(id, updateUser);

		res.json({ success: true, message: HTTP_MESSAGES.USER_UPDATED });
	};

	delete = async (req: ValidatedRequest, res: Response): Promise<void> => {
		const id = (req.validated?.params as Record<string, string>).userId;
		await this.userService.deleteUser(id);
		res.json({ success: true, message: HTTP_MESSAGES.USER_DELETED });
	};
}
