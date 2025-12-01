import { UserRepository } from '../repositories/userRepository';
import { ErrorFactory } from '../errors/errorFactory';
import { CreateUserDTO, UpdateUserDTO, UserResponseDTO, UserQueryDTO } from '../dtos/userDTO';
import { HTTP_MESSAGES } from '../constants/httpConstants';
import { transformToDTO } from '../utils/mapper';
import { getPaginatedResults } from '../utils/paginationHelper';

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

	getAllUsersPaginated = async (
		queryParams: UserQueryDTO,
	): Promise<{ items: UserResponseDTO[]; nextCursor: string | null }> => {
		return getPaginatedResults(
			queryParams,
			(params) => this.userRepository.findPaginated(params),
			UserResponseDTO,
			'userId',
		);
	};

	getUserById = async (id: string): Promise<UserResponseDTO> => {
		const user: UserResponseDTO | null = await this.userRepository.findById(id);
		if (!user) {
			throw ErrorFactory.notFound(HTTP_MESSAGES.USER_NOT_FOUND);
		}
		return transformToDTO(UserResponseDTO, user);
	};

	updateUser = async (id: string, updatedData: UpdateUserDTO): Promise<void> => {
		await this.getUserById(id);

		if (updatedData.username) {
			const existingUsername = await this.userRepository.findByUsername(updatedData.username);
			if (existingUsername && existingUsername.userId !== id) {
				throw ErrorFactory.conflict(HTTP_MESSAGES.USERNAME_ALREADY_EXISTS);
			}
		}

		if (updatedData.email) {
			const existingEmail = await this.userRepository.findByEmail(updatedData.email);
			if (existingEmail && existingEmail.userId !== id) {
				throw ErrorFactory.conflict(HTTP_MESSAGES.EMAIL_ALREADY_EXISTS);
			}
		}

		await this.userRepository.update(id, updatedData);
	};

	deleteUser = async (id: string): Promise<void> => {
		await this.getUserById(id);
		await this.userRepository.softDelete(id);
	};
}
