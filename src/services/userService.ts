import { UserRepository } from '../repositories/userRepository';
import { ErrorFactory } from '../errors/errorFactory';
import { CreateUserDTO, UpdateUserDTO, UserResponseDTO } from '../dtos/userDTO';
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

	getAllUsers = async (): Promise<UserResponseDTO[]> => {
		const users = await this.userRepository.findAll();
		return users.map((user) => transformToDTO(UserResponseDTO, user));
	};

	getAllUsersPaginated = async (
		startAfter: string | undefined,
		limit: number,
	): Promise<{ items: UserResponseDTO[]; nextCursor: string | null }> => {
		const decodedCursor = startAfter ? CursorEncoder.decode(startAfter) : undefined;
		const users = await this.userRepository.findPaginated(decodedCursor, limit + 1);
		const hasMore = users.length > limit;
		const items = users.slice(0, limit).map((user) => transformToDTO(UserResponseDTO, user));
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
