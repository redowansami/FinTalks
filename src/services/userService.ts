import { UserRepository } from '../repositories/userRepository';
import { ErrorFactory } from '../errors/errorFactory';
import { CreateUserDTO, UpdateUserDTO, UserResponseDTO, UserQueryDTO } from '../dtos/userDTO';
import { HTTP_MESSAGES } from '../constants/httpConstants';
import { transformToDTO } from '../utils/mapper';
import { CursorEncoder } from '../utils/cursorEncoder';

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
		const decodedCursor = queryParams.startAfter
			? CursorEncoder.decode(queryParams.startAfter)
			: undefined;

		const users = await this.userRepository.findPaginated({
			...queryParams,
			startAfter: decodedCursor,
			limit: queryParams.limit + 1,
		});

		const hasMore = users.length > queryParams.limit;
		const items = users
			.slice(0, queryParams.limit)
			.map((user) => transformToDTO(UserResponseDTO, user));
		const nextCursor = hasMore ? CursorEncoder.encode(items[items.length - 1].userId) : null;

		return { items, nextCursor };
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
