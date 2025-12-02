import { Request, Response } from 'express';
import { UserService } from '../services/userService';
import { UpdateUserDTO, UserQueryDTO } from '../dtos/userDTO';
import { HTTP_STATUS, HTTP_MESSAGES } from '../constants/httpConstants';
import { autoInjectable } from 'tsyringe';

@autoInjectable()
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
		const query = req.query as unknown as UserQueryDTO;
		const result = await this.userService.findAllUsers(query);
		res.status(HTTP_STATUS.OK).json({ success: true, ...result });
	};

	findOne = async (req: Request, res: Response): Promise<void> => {
		const userId = req.params.userId;
		const user = await this.userService.getUserById(userId);

		res.status(HTTP_STATUS.OK).json({ success: true, user });
	};

	update = async (req: Request, res: Response): Promise<void> => {
		const userId = req.params.userId;
		const user = await this.userService.updateUser(userId, req.body as UpdateUserDTO);

		res.status(HTTP_STATUS.OK).json({
			success: true,
			message: HTTP_MESSAGES.USER_UPDATED,
			user,
		});
	};

	delete = async (req: Request, res: Response): Promise<void> => {
		const userId = req.params.userId;
		await this.userService.deleteUser(userId);
		res.sendStatus(HTTP_STATUS.NO_CONTENT);
	};
}
//
