import { Response } from 'express';
import { UserService } from '../services/userService';
import { CreateUserDTO, UpdateUserDTO } from '../dtos/userDTO';
import { HTTP_STATUS, HTTP_MESSAGES } from '../constants/httpConstants';
import { ValidatedRequest } from '../middleware/validationMiddleware';

export class UserController {
	constructor(private readonly userService: UserService) {}

	async create(req: ValidatedRequest, res: Response): Promise<void> {
		const createUser: CreateUserDTO = req.validated?.body as CreateUserDTO;
		const result = await this.userService.createUser(createUser);
		res.status(HTTP_STATUS.CREATED).json({
			success: true,
			message: HTTP_MESSAGES.USER_CREATED,
			user: result,
		});
	}

	async findAll(req: ValidatedRequest, res: Response): Promise<void> {
		const users = await this.userService.getAllUsers();
		res.json({ success: true, users });
	}

	async findOne(req: ValidatedRequest, res: Response): Promise<void> {
		const id = (req.validated?.params as Record<string, string>).userId;
		const user = await this.userService.getUserById(id);

		res.json({ success: true, user });
	}

	async patchUpdate(req: ValidatedRequest, res: Response): Promise<void> {
		const id = (req.validated?.params as Record<string, string>).userId;
		const updateUser: UpdateUserDTO = req.validated?.body as UpdateUserDTO;
		await this.userService.updateUser(id, updateUser);

		res.json({ success: true, message: HTTP_MESSAGES.USER_UPDATED });
	}

	async delete(req: ValidatedRequest, res: Response): Promise<void> {
		const id = (req.validated?.params as Record<string, string>).userId;
		await this.userService.deleteUser(id);
		res.json({ success: true, message: HTTP_MESSAGES.USER_DELETED });
	}
}
