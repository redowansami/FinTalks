import { Response } from 'express';
import { UserService } from '../services/userService';
import { UserNotFoundException } from '../exceptions/UserNotFoundException';
import { CreateUserDTO, UpdateUserDTO, UserResponseDTO } from '../dtos/userDTO';
import { HTTP_STATUS, HTTP_MESSAGES } from '../constants/httpConstants';
import { ValidatedRequest } from '../middleware/validationMiddleware';

export class UserController {
	constructor(private readonly userService: UserService) {}

	async create(req: ValidatedRequest, res: Response): Promise<Response> {
		try {
			const createUser: CreateUserDTO = req.validated?.body as CreateUserDTO;
			const result: UserResponseDTO = await this.userService.createUser(createUser);
			return res
				.status(HTTP_STATUS.CREATED)
				.json({ message: HTTP_MESSAGES.USER_CREATED, user: result });
		} catch (err) {
			return res
				.status(HTTP_STATUS.BAD_REQUEST)
				.json({ message: HTTP_MESSAGES.FAILED_CREATE_USER, err });
		}
	}

	async findAll(req: ValidatedRequest, res: Response): Promise<Response> {
		try {
			const users: UserResponseDTO[] = await this.userService.getAllUsers();
			return res.json(users);
		} catch {
			return res
				.status(HTTP_STATUS.BAD_REQUEST)
				.json({ message: HTTP_MESSAGES.FAILED_GET_USERS });
		}
	}

	async findOne(req: ValidatedRequest, res: Response): Promise<Response> {
		try {
			const id = (req.validated?.params as Record<string, string>).userId;
			const user: UserResponseDTO = await this.userService.getUserById(id);

			return res.json(user);
		} catch (err) {
			if (err instanceof UserNotFoundException) {
				return res
					.status(HTTP_STATUS.NOT_FOUND)
					.json({ message: HTTP_MESSAGES.USER_NOT_FOUND });
			}
			return res
				.status(HTTP_STATUS.BAD_REQUEST)
				.json({ message: HTTP_MESSAGES.FAILED_FETCH_USER });
		}
	}

	async patchUpdate(req: ValidatedRequest, res: Response): Promise<Response> {
		try {
			const id = (req.validated?.params as Record<string, string>).userId;
			const updateUser: UpdateUserDTO = req.validated?.body as UpdateUserDTO;
			const result: UserResponseDTO = await this.userService.updateUser(id, updateUser);

			return res.json(result);
		} catch (err) {
			if (err instanceof UserNotFoundException) {
				return res
					.status(HTTP_STATUS.NOT_FOUND)
					.json({ message: HTTP_MESSAGES.USER_NOT_FOUND });
			}
			return res
				.status(HTTP_STATUS.BAD_REQUEST)
				.json({ message: HTTP_MESSAGES.FAILED_UPDATE_USER });
		}
	}

	async delete(req: ValidatedRequest, res: Response): Promise<Response> {
		try {
			const id = (req.validated?.params as Record<string, string>).userId;
			await this.userService.deleteUser(id);
			return res.json({ message: HTTP_MESSAGES.USER_DELETED });
		} catch (err) {
			if (err instanceof UserNotFoundException) {
				return res
					.status(HTTP_STATUS.NOT_FOUND)
					.json({ message: HTTP_MESSAGES.USER_NOT_FOUND });
			}
			return res
				.status(HTTP_STATUS.BAD_REQUEST)
				.json({ message: HTTP_MESSAGES.FAILED_DELETE_USER });
		}
	}
}
