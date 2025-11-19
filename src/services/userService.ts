import { User } from '../entities/userEntity';
import { UserRepository } from '../repositories/userRepository';

export class UserService {
	constructor(private readonly userRepository: UserRepository) {}

	async createUser(data: Partial<User>): Promise<User> {
		return this.userRepository.create(data);
	}

	async getAllUsers(): Promise<User[]> {
		return this.userRepository.findAll();
	}

	async getUserById(id: number): Promise<User | null> {
		return this.userRepository.findById(id);
	}

	async updateUser(id: number, updatedData: Partial<User>): Promise<User | null> {
		const existing = await this.userRepository.findById(id);
		if (!existing) return null;

		const merged = Object.assign(existing, updatedData);
		return this.userRepository.update(merged);
	}

	async upsertUser(id: number, data: Partial<User>): Promise<{ created: boolean; user: User }> {
		const existing = await this.userRepository.findById(id);

		if (!existing) {
			const createdUser = await this.userRepository.create({ id, ...data });
			return { created: true, user: createdUser };
		}

		const updated = await this.updateUser(id, data);
		return { created: false, user: updated! };
	}

	async deleteUser(id: number): Promise<boolean> {
		return this.userRepository.softDelete(id);
	}
}
