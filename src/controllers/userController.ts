import { Request, Response } from 'express';
import { UserService } from '../services/userService';
import { UpdateUserDTO, UserQueryDTO } from '../dtos/userDTO';
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
		const queryParams = req.query as unknown as UserQueryDTO;
		const result = await this.userService.getAllUsersPaginated(queryParams);
		res.status(HTTP_STATUS.OK).json({ success: true, ...result });
	};

	findOne = async (req: Request, res: Response): Promise<void> => {
		const { userId } = req.params;
		const user = await this.userService.getUserById(userId);

		res.status(HTTP_STATUS.OK).json({ success: true, user });
	};

	patchUpdate = async (req: Request, res: Response): Promise<void> => {
		const { userId } = req.params;
		await this.userService.updateUser(userId, req.body as UpdateUserDTO);

		res.status(HTTP_STATUS.OK).json({ success: true, message: HTTP_MESSAGES.USER_UPDATED });
	};

	delete = async (req: Request, res: Response): Promise<void> => {
		const { userId } = req.params;
		await this.userService.deleteUser(userId);
		res.sendStatus(HTTP_STATUS.NO_CONTENT);
	};
}
