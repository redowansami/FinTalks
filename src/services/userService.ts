import { User } from '../entities/userEntity';
import { UserRepository } from '../repositories/userRepository';
import { UserNotFoundException } from '../exceptions/UserNotFoundException';

export class UserService {
	constructor(private readonly userRepository: UserRepository) {}

	async createUser(data: Partial<User>): Promise<User> {
		return this.userRepository.create(data);
	}

	async getAllUsers(): Promise<User[]> {
		return this.userRepository.findAll();
	}

	async getUserById(id: string): Promise<User> {
		const user = await this.userRepository.findById(id);
		if (!user) {
			throw new UserNotFoundException();
		}
		return user;
	}

	async updateUser(id: string, updatedData: Partial<User>): Promise<User> {
		const existing = await this.getUserById(id);
		const merged = Object.assign(existing, updatedData);
		return this.userRepository.update(merged);
	}

	async deleteUser(id: string): Promise<void> {
		await this.getUserById(id);
		await this.userRepository.softDelete(id);
	}
}
