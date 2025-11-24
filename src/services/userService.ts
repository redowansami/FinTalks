import { User } from '../entities/userEntity';
import { UserRepository } from '../repositories/userRepository';
import { UserNotFoundException } from '../exceptions/UserNotFoundException';
import { CreateUserDTO, UpdateUserDTO, UserResponseDTO } from '../dtos/userDTO';

export class UserService {
	constructor(private readonly userRepository: UserRepository) {}

	async createUser(data: CreateUserDTO): Promise<UserResponseDTO> {
		const user: User = await this.userRepository.create(data);
		return this.mapToResponseDTO(user);
	}

	async getAllUsers(): Promise<UserResponseDTO[]> {
		const users: UserResponseDTO[] = await this.userRepository.findAll();
		return users;
	}

	async getUserById(id: string): Promise<UserResponseDTO> {
		const user: UserResponseDTO | null = await this.userRepository.findById(id);
		if (!user) {
			throw new UserNotFoundException();
		}
		return user;
	}

	async updateUser(id: string, updatedData: UpdateUserDTO): Promise<UserResponseDTO> {
		await this.getUserById(id);
		const updated = await this.userRepository.update(id, updatedData as User);
		return updated;
	}

	async deleteUser(id: string): Promise<void> {
		await this.getUserById(id);
		await this.userRepository.softDelete(id);
	}

	private mapToResponseDTO(user: User): UserResponseDTO {
		return {
			userId: user.userId,
			username: user.username,
			name: user.name,
			email: user.email,
			joinDate: user.joinDate,
			role: user.role,
		};
	}
}
