import { UserRepository } from '../repositories/userRepository';
import { ErrorFactory } from '../errors/errorFactory';
import { CreateUserDTO, UpdateUserDTO, UserResponseDTO, UserQueryDTO } from '../dtos/userDTO';
import { HTTP_MESSAGES } from '../constants/httpConstants';
import { transformToDTO } from '../utils/mapper';
import { getOffsetPaginatedResults } from '../utils/offsetPaginationHelper';
import { autoInjectable } from 'tsyringe';
import { EntityManager } from 'typeorm';
import { UserRole } from '../entities/userEntity';

@autoInjectable()
export class UserService {
	constructor(private readonly userRepository: UserRepository) {}

	createUser = async (data: CreateUserDTO, manager?: EntityManager): Promise<UserResponseDTO> => {
		const isUsernameFound = await this.userRepository.findByUsername(data.username);
		if (isUsernameFound) {
			throw ErrorFactory.conflict(HTTP_MESSAGES.USERNAME_ALREADY_EXISTS);
		}

		const isEmailFound = await this.userRepository.findByEmail(data.email);
		if (isEmailFound) {
			throw ErrorFactory.conflict(HTTP_MESSAGES.EMAIL_ALREADY_EXISTS);
		}

		const user = await this.userRepository.create(data, manager);
		return transformToDTO(UserResponseDTO, user);
	};

	findAllUsers = async (
		queryParams: UserQueryDTO,
	): Promise<{ list: UserResponseDTO[]; page: number; nextPage: number | null }> => {
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

	getUserByEmail = async (email: string): Promise<UserResponseDTO | null> => {
		const user = await this.userRepository.findByEmail(email);
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

	escalateUserToAdmin = async (id: string): Promise<UserResponseDTO> => {
		await this.getUserById(id);
		const user = await this.userRepository.update(id, { role: UserRole.ADMIN });
		return transformToDTO(UserResponseDTO, user);
	};
}
