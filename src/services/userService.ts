import { User } from '../entities/userEntity';
import { UserRepository } from '../repositories/userRepository';
import { UserNotFoundException } from '../exceptions/UserNotFoundException';
import { CreateUserDTO, UpdateUserDTO, UserResponseDTO } from '../dtos/userDTO';

export class UserService {
	constructor(private readonly userRepository: UserRepository) {}

	async createUser(data: CreateUserDTO): Promise<UserResponseDTO> {
		const user = await this.userRepository.create(data);
		return this.mapToResponseDTO(user);
	}

	async getAllUsers(): Promise<UserResponseDTO[]> {
		const users = await this.userRepository.findAll();
		return users.map((user) => this.mapToResponseDTO(user));
	}

	async getUserById(id: string): Promise<UserResponseDTO> {
		const user = await this.userRepository.findById(id);
		if (!user) {
			throw new UserNotFoundException();
		}
		return this.mapToResponseDTO(user);
	}

	async updateUser(id: string, updatedData: UpdateUserDTO): Promise<UserResponseDTO> {
		const existing = await this.getUserById(id);
		const merged = Object.assign(existing, updatedData);
		const updated = await this.userRepository.update(merged as User);
		return this.mapToResponseDTO(updated);
	}

	async deleteUser(id: string): Promise<void> {
		await this.getUserById(id);
		await this.userRepository.softDelete(id);
	}

	private mapToResponseDTO(user: User): UserResponseDTO {
		return {
			id: user.id,
			username: user.username,
			name: user.name,
			email: user.email,
			joinDate: user.joinDate,
			role: user.role,
		};
	}
}
