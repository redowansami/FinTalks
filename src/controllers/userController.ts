import { Request, Response } from 'express';
import { UserService } from '../services/userService';
import { UserNotFoundException } from '../exceptions/UserNotFoundException';
import { CreateUserDTO, UpdateUserDTO, UserResponseDTO } from '../dtos/userDTO';

export class UserController {
	constructor(private readonly userService: UserService) {}

	async create(req: Request, res: Response): Promise<Response> {
		try {
			const createUser: CreateUserDTO = req.body;
			const result: UserResponseDTO = await this.userService.createUser(createUser);
			return res.status(201).json({ message: 'User created', user: result });
		} catch (err) {
			return res.status(400).json({ message: 'Failed to create user', err });
		}
	}

	async findAll(req: Request, res: Response): Promise<Response> {
		try {
			const users: UserResponseDTO[] = await this.userService.getAllUsers();
			return res.json(users);
		} catch {
			return res.status(400).json({ message: 'Failed to get users' });
		}
	}

	async findOne(req: Request, res: Response): Promise<Response> {
		try {
			const id = req.params.userId;
			const user: UserResponseDTO = await this.userService.getUserById(id);

			return res.json(user);
		} catch (err) {
			if (err instanceof UserNotFoundException) {
				return res.status(err.status).json({ message: err.message });
			}
			return res.status(400).json({ message: 'Failed to fetch user' });
		}
	}

	async patchUpdate(req: Request, res: Response): Promise<Response> {
		try {
			const id = req.params.userId;
			const updateUser: UpdateUserDTO = req.body;
			const result: UserResponseDTO = await this.userService.updateUser(id, updateUser);

			return res.json(result);
		} catch (err) {
			if (err instanceof UserNotFoundException) {
				return res.status(404).json({ message: 'User not found' });
			}
			return res.status(400).json({ message: 'Failed to update user' });
		}
	}

	async delete(req: Request, res: Response): Promise<Response> {
		try {
			const id = req.params.userId;
			await this.userService.deleteUser(id);
			return res.json({ message: 'User deleted' });
		} catch (err) {
			if (err instanceof UserNotFoundException) {
				return res.status(404).json({ message: 'User not found' });
			}
			return res.status(400).json({ message: 'Failed to delete user' });
		}
	}
}
