import { UserRepository } from '../repositories/userRepository';
import { ErrorFactory } from '../errors/errorFactory';
import {
	CreateUserDTO,
	UpdateUserDTO,
	UserResponseDTO,
	UserQueryDTO,
	SignupResponseDTO,
	GetProfileDTO,
	UpdateProfileDTO,
} from '../dtos/userDTO';
import { HTTP_MESSAGES } from '../constants/httpConstants';
import { transformToDTO } from '../utils/mapper';
import { getOffsetPaginatedResults } from '../utils/offsetPaginationHelper';

import { UserRole } from '../entities/userEntity';
import { injectable } from 'tsyringe';

@injectable()
export class UserService {
	constructor(private readonly userRepository: UserRepository) {}

	createUser = async (data: CreateUserDTO): Promise<UserResponseDTO> => {
		const isUsernameFound = await this.userRepository.findByUsername(data.username);
		if (isUsernameFound) {
			throw ErrorFactory.conflict(HTTP_MESSAGES.USERNAME_ALREADY_EXISTS);
		}

		const isEmailFound = await this.userRepository.findByEmail(data.email);
		if (isEmailFound) {
			throw ErrorFactory.conflict(HTTP_MESSAGES.EMAIL_ALREADY_EXISTS);
		}

		const user = await this.userRepository.create(data);
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

	getUserByIdRaw = async (id: string): Promise<SignupResponseDTO> => {
		const user = await this.userRepository.findById(id);
		if (!user) {
			throw ErrorFactory.notFound(HTTP_MESSAGES.USER_NOT_FOUND);
		}
		return transformToDTO(SignupResponseDTO, user);
	};

	getUserByEmailRaw = async (email: string): Promise<SignupResponseDTO> => {
		const user = await this.userRepository.findByEmail(email);
		if (!user) {
			throw ErrorFactory.notFound(HTTP_MESSAGES.USER_NOT_FOUND);
		}
		return transformToDTO(SignupResponseDTO, user);
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

	confirmEmailAddress = async (id: string): Promise<void> => {
		await this.userRepository.update(id, { isEmailConfirmed: true });
	};

	getProfile = async (userId: string): Promise<GetProfileDTO> => {
		const user = await this.userRepository.findById(userId);
		if (!user) {
			throw ErrorFactory.notFound(HTTP_MESSAGES.USER_NOT_FOUND);
		}
		return transformToDTO(GetProfileDTO, user);
	};

	updateProfile = async (userId: string, data: UpdateProfileDTO): Promise<GetProfileDTO> => {
		const user = await this.userRepository.findById(userId);
		if (!user) {
			throw ErrorFactory.notFound(HTTP_MESSAGES.USER_NOT_FOUND);
		}

		const updatedUser = await this.userRepository.update(userId, data);
		return transformToDTO(GetProfileDTO, updatedUser);
	};
}
