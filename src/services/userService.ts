import { UserRepository } from '../repositories/userRepository';
import { ErrorFactory } from '../errors/errorFactory';
import { CreateUserDTO, UpdateUserDTO, UserResponseDTO, UserQueryDTO } from '../dtos/userDTO';
import { HTTP_MESSAGES } from '../constants/httpConstants';
import { transformToDTO } from '../utils/mapper';
import { getOffsetPaginatedResults } from '../utils/offsetPaginationHelper';

export class UserService {
	constructor(private readonly userRepository: UserRepository) {}

	createUser = async (data: CreateUserDTO): Promise<UserResponseDTO> => {
		const existingUsername = await this.userRepository.findByUsername(data.username);
		if (existingUsername) {
			throw ErrorFactory.conflict(HTTP_MESSAGES.USERNAME_ALREADY_EXISTS);
		}

		const existingEmail = await this.userRepository.findByEmail(data.email);
		if (existingEmail) {
			throw ErrorFactory.conflict(HTTP_MESSAGES.EMAIL_ALREADY_EXISTS);
		}

		const user = await this.userRepository.create(data);
		return transformToDTO(UserResponseDTO, user);
	};

	findAllUsers = async (
		queryParams: UserQueryDTO,
	): Promise<{ items: UserResponseDTO[]; page: number; nextPage: number | null }> => {
		return getOffsetPaginatedResults(
			queryParams,
			(params: UserQueryDTO) => this.userRepository.findAll(params),
			UserResponseDTO,
		);
	};

	getUserById = async (id: string): Promise<UserResponseDTO> => {
		const user: UserResponseDTO | null = await this.userRepository.findById(id);
		if (!user) {
			throw ErrorFactory.notFound(HTTP_MESSAGES.USER_NOT_FOUND);
		}
		return transformToDTO(UserResponseDTO, user);
	};

	updateUser = async (id: string, updatedData: UpdateUserDTO): Promise<UserResponseDTO> => {
		await this.getUserById(id);
		const user = await this.userRepository.update(id, updatedData);
		return transformToDTO(UserResponseDTO, user);
	};

	deleteUser = async (id: string): Promise<void> => {
		await this.getUserById(id);
		await this.userRepository.softDelete(id);
	};
}
