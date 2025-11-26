import { UserRepository } from '../repositories/userRepository';
import { NotFoundError } from '../errors/customErrors';
import { CreateUserDTO, UpdateUserDTO, UserResponseDTO } from '../dtos/userDTO';
import { HTTP_MESSAGES } from '../constants/httpConstants';
import { transformToDTO } from '../utils/mapper';

export class UserService {
	constructor(private readonly userRepository: UserRepository) {}

	createUser = async (data: CreateUserDTO): Promise<UserResponseDTO> => {
		const user = await this.userRepository.create(data);
		return transformToDTO(UserResponseDTO, user);
	};

	getAllUsers = async (): Promise<UserResponseDTO[]> => {
		const users = await this.userRepository.findAll();
		return users.map((user) => transformToDTO(UserResponseDTO, user));
	};

	getUserById = async (id: string): Promise<UserResponseDTO> => {
		const user: UserResponseDTO | null = await this.userRepository.findById(id);
		if (!user) {
			throw new NotFoundError(HTTP_MESSAGES.USER_NOT_FOUND);
		}
		return transformToDTO(UserResponseDTO, user);
	};

	updateUser = async (id: string, updatedData: UpdateUserDTO): Promise<void> => {
		await this.getUserById(id);
		await this.userRepository.update(id, updatedData);
	};

	deleteUser = async (id: string): Promise<void> => {
		await this.getUserById(id);
		await this.userRepository.softDelete(id);
	};
}
