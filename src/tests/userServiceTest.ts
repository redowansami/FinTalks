import { UserService } from '../services/userService';
import { UserRepository } from '../repositories/userRepository';
import { notFoundCreator, conflictCreator } from '../errors/errorFactory';
import { HTTP_MESSAGES } from '../constants/httpConstants';
import { User, UserRole } from '../entities/userEntity';
import { UpdateProfileDTO } from 'dtos/userDTO';

jest.mock('../errors/errorFactory', () => ({
	notFoundCreator: { create: jest.fn() },
	conflictCreator: { create: jest.fn() },
}));

const mockUserRepository = {
	findByUsername: jest.fn(),
	findByEmail: jest.fn(),
	create: jest.fn(),
	findAll: jest.fn(),
	findById: jest.fn(),
	softDelete: jest.fn(),
	update: jest.fn(),
} as unknown as jest.Mocked<UserRepository>;

describe('UserService', () => {
	let userService: UserService;

	const mockUser = {
		userId: 'user-123',
		username: 'testuser',
		email: 'test@example.com',
		name: 'Test User',
		role: UserRole.USER,
		isEmailConfirmed: true,
		joinDate: new Date(),
		deletedAt: null,
		bio: null,
		profilePictureUrl: null,
	};

	beforeEach(() => {
		userService = new UserService(mockUserRepository);
		jest.clearAllMocks();
		(conflictCreator.create as jest.Mock).mockImplementation((msg) => new Error(msg));
		(notFoundCreator.create as jest.Mock).mockImplementation((msg) => new Error(msg));
	});

	describe('createUser', () => {
		const createUserData = {
			username: 'newuser',
			email: 'newuser@example.com',
			name: 'New User',
		};

		it('should successfully create a new user', async () => {
			mockUserRepository.findByUsername.mockResolvedValue(null);
			mockUserRepository.findByEmail.mockResolvedValue(null);
			mockUserRepository.create.mockResolvedValue(mockUser as User);

			const result = await userService.createUser(createUserData);

			expect(result).toEqual(
				expect.objectContaining({
					userId: mockUser.userId,
					username: mockUser.username,
					email: mockUser.email,
				}),
			);
			expect(mockUserRepository.findByUsername).toHaveBeenCalledWith(createUserData.username);
			expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(createUserData.email);
			expect(mockUserRepository.create).toHaveBeenCalledWith(createUserData);
		});

		it('should throw error if username already exists', async () => {
			mockUserRepository.findByUsername.mockResolvedValue(mockUser as User);

			(conflictCreator.create as jest.Mock).mockReturnValue(
				new Error(HTTP_MESSAGES.USERNAME_ALREADY_EXISTS),
			);

			await expect(userService.createUser(createUserData)).rejects.toThrow(
				HTTP_MESSAGES.USERNAME_ALREADY_EXISTS,
			);
			expect(mockUserRepository.create).not.toHaveBeenCalled();
		});

		it('should throw error if email already exists', async () => {
			mockUserRepository.findByUsername.mockResolvedValue(null);
			mockUserRepository.findByEmail.mockResolvedValue(mockUser as User);

			(conflictCreator.create as jest.Mock).mockReturnValue(
				new Error(HTTP_MESSAGES.EMAIL_ALREADY_EXISTS),
			);

			await expect(userService.createUser(createUserData)).rejects.toThrow(
				HTTP_MESSAGES.EMAIL_ALREADY_EXISTS,
			);
			expect(mockUserRepository.create).not.toHaveBeenCalled();
		});
	});

	describe('findAllUsers', () => {
		const queryParams = {
			page: 1,
			limit: 10,
			search: '',
		};

		it('should return paginated list of users', async () => {
			const mockUsers = [
				mockUser,
				{
					...mockUser,
					userId: 'user-456',
					username: 'testuser2',
				},
			];
			mockUserRepository.findAll.mockResolvedValue(mockUsers as User[]);

			const result = await userService.findAllUsers(queryParams);

			expect(result).toEqual(
				expect.objectContaining({
					list: expect.any(Array),
					page: expect.any(Number),
				}),
			);
			expect(mockUserRepository.findAll).toHaveBeenCalledWith(queryParams);
		});

		it('should return empty list when no users found', async () => {
			mockUserRepository.findAll.mockResolvedValue([] as User[]);

			const result = await userService.findAllUsers(queryParams);

			expect(result.list).toEqual([]);
			expect(result.page).toBe(1);
		});

		it('should handle search parameters', async () => {
			const searchParams = { ...queryParams, search: 'test' };
			mockUserRepository.findAll.mockResolvedValue([mockUser] as User[]);

			await userService.findAllUsers(searchParams);

			expect(mockUserRepository.findAll).toHaveBeenCalledWith(searchParams);
		});
	});

	describe('getUserById', () => {
		const userId = 'user-123';

		it('should return user when found', async () => {
			mockUserRepository.findById.mockResolvedValue(mockUser as User);

			const result = await userService.getUserById(userId);

			expect(result).toEqual(
				expect.objectContaining({
					userId: mockUser.userId,
					username: mockUser.username,
					email: mockUser.email,
				}),
			);
			expect(mockUserRepository.findById).toHaveBeenCalledWith(userId);
		});

		it('should throw error if user not found', async () => {
			mockUserRepository.findById.mockResolvedValue(null);

			(notFoundCreator.create as jest.Mock).mockReturnValue(
				new Error(HTTP_MESSAGES.USER_NOT_FOUND),
			);

			await expect(userService.getUserById(userId)).rejects.toThrow(
				HTTP_MESSAGES.USER_NOT_FOUND,
			);
		});

		it('should return transformed user data', async () => {
			mockUserRepository.findById.mockResolvedValue(mockUser as User);

			const result = await userService.getUserById(userId);

			expect(result).toBeDefined();
			expect(result.userId).toBe(mockUser.userId);
			expect(result.email).toBe(mockUser.email);
		});
	});

	describe('getUserByEmail', () => {
		const email = 'test@example.com';

		it('should return user when found', async () => {
			mockUserRepository.findByEmail.mockResolvedValue(mockUser as User);

			const result = await userService.getUserByEmail(email);

			expect(result).toEqual(
				expect.objectContaining({
					userId: mockUser.userId,
					username: mockUser.username,
					email: mockUser.email,
				}),
			);
			expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(email);
		});

		it('should throw error if user not found', async () => {
			mockUserRepository.findByEmail.mockResolvedValue(null);

			(notFoundCreator.create as jest.Mock).mockReturnValue(
				new Error(HTTP_MESSAGES.USER_NOT_FOUND),
			);

			await expect(userService.getUserByEmail(email)).rejects.toThrow(
				HTTP_MESSAGES.USER_NOT_FOUND,
			);
		});

		it('should return transformed user data', async () => {
			mockUserRepository.findByEmail.mockResolvedValue(mockUser as User);

			const result = await userService.getUserByEmail(email);

			expect(result).toBeDefined();
			if (result) {
				expect(result.email).toBe(email);
			}
		});

		it('should handle different email formats', async () => {
			const differentEmail = 'another@example.com';
			const differentUser = { ...mockUser, email: differentEmail };
			mockUserRepository.findByEmail.mockResolvedValue(differentUser as User);

			const result = await userService.getUserByEmail(differentEmail);

			expect(result).toBeDefined();
			if (result) {
				expect(result.email).toBe(differentEmail);
			}
			expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(differentEmail);
		});
	});

	describe('getUserByIdRaw', () => {
		const userId = 'user-123';

		it('should return user raw data when found', async () => {
			mockUserRepository.findById.mockResolvedValue(mockUser as User);

			const result = await userService.getUserByIdRaw(userId);

			expect(result).toBeDefined();
			expect(result.userId).toBe(mockUser.userId);
			expect(result.email).toBe(mockUser.email);
			expect(result.isEmailConfirmed).toBe(mockUser.isEmailConfirmed);
			expect(mockUserRepository.findById).toHaveBeenCalledWith(userId);
		});

		it('should throw error if user not found', async () => {
			mockUserRepository.findById.mockResolvedValue(null);

			(notFoundCreator.create as jest.Mock).mockReturnValue(
				new Error(HTTP_MESSAGES.USER_NOT_FOUND),
			);

			await expect(userService.getUserByIdRaw(userId)).rejects.toThrow(
				HTTP_MESSAGES.USER_NOT_FOUND,
			);
		});
	});

	describe('getUserByEmailRaw', () => {
		const email = 'test@example.com';

		it('should return user raw data when found', async () => {
			mockUserRepository.findByEmail.mockResolvedValue(mockUser as User);

			const result = await userService.getUserByEmailRaw(email);

			expect(result).toBeDefined();
			expect(result.userId).toBe(mockUser.userId);
			expect(result.email).toBe(mockUser.email);
			expect(result.isEmailConfirmed).toBe(mockUser.isEmailConfirmed);
			expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(email);
		});

		it('should throw error if user not found', async () => {
			mockUserRepository.findByEmail.mockResolvedValue(null);

			(notFoundCreator.create as jest.Mock).mockReturnValue(
				new Error(HTTP_MESSAGES.USER_NOT_FOUND),
			);

			await expect(userService.getUserByEmailRaw(email)).rejects.toThrow(
				HTTP_MESSAGES.USER_NOT_FOUND,
			);
		});
	});

	describe('deleteUser', () => {
		const userId = 'user-123';

		it('should successfully delete user', async () => {
			mockUserRepository.findById.mockResolvedValue(mockUser as User);
			mockUserRepository.softDelete.mockResolvedValue(true as never);

			await userService.deleteUser(userId);

			expect(mockUserRepository.findById).toHaveBeenCalledWith(userId);
			expect(mockUserRepository.softDelete).toHaveBeenCalledWith(userId);
		});

		it('should throw error if user not found', async () => {
			mockUserRepository.findById.mockResolvedValue(null);

			(notFoundCreator.create as jest.Mock).mockReturnValue(
				new Error(HTTP_MESSAGES.USER_NOT_FOUND),
			);

			await expect(userService.deleteUser(userId)).rejects.toThrow(
				HTTP_MESSAGES.USER_NOT_FOUND,
			);
			expect(mockUserRepository.softDelete).not.toHaveBeenCalled();
		});
	});

	describe('escalateUserToAdmin', () => {
		const userId = 'user-123';

		it('should successfully escalate user to admin', async () => {
			const adminUser = { ...mockUser, role: UserRole.ADMIN };
			mockUserRepository.findById.mockResolvedValue(mockUser as User);
			mockUserRepository.update.mockResolvedValue(adminUser as User);

			const result = await userService.escalateUserToAdmin(userId);

			expect(result.role).toBe(UserRole.ADMIN);
			expect(mockUserRepository.findById).toHaveBeenCalledWith(userId);
			expect(mockUserRepository.update).toHaveBeenCalledWith(userId, {
				role: UserRole.ADMIN,
			});
		});

		it('should throw error if user not found', async () => {
			mockUserRepository.findById.mockResolvedValue(null);

			(notFoundCreator.create as jest.Mock).mockReturnValue(
				new Error(HTTP_MESSAGES.USER_NOT_FOUND),
			);

			await expect(userService.escalateUserToAdmin(userId)).rejects.toThrow(
				HTTP_MESSAGES.USER_NOT_FOUND,
			);
			expect(mockUserRepository.update).not.toHaveBeenCalled();
		});
	});

	describe('confirmEmailAddress', () => {
		const userId = 'user-123';

		it('should successfully confirm email address', async () => {
			mockUserRepository.update.mockResolvedValue(mockUser as User);

			await userService.confirmEmailAddress(userId);

			expect(mockUserRepository.update).toHaveBeenCalledWith(userId, {
				isEmailConfirmed: true,
			});
		});
	});

	describe('getProfile', () => {
		const userId = 'user-123';

		it('should return user profile', async () => {
			mockUserRepository.findById.mockResolvedValue(mockUser as User);

			const result = await userService.getProfile(userId);

			expect(result).toBeDefined();
			expect(result.userId).toBe(mockUser.userId);
			expect(result.email).toBe(mockUser.email);
			expect(result.bio).toBe(mockUser.bio);
			expect(result.profilePictureUrl).toBe(mockUser.profilePictureUrl);
			expect(mockUserRepository.findById).toHaveBeenCalledWith(userId);
		});

		it('should throw error if user not found', async () => {
			mockUserRepository.findById.mockResolvedValue(null);

			(notFoundCreator.create as jest.Mock).mockReturnValue(
				new Error(HTTP_MESSAGES.USER_NOT_FOUND),
			);

			await expect(userService.getProfile(userId)).rejects.toThrow(
				HTTP_MESSAGES.USER_NOT_FOUND,
			);
		});
	});

	describe('updateProfile', () => {
		const userId = 'user-123';
		const updateData = {
			name: 'Updated Name',
			bio: 'Updated bio',
			profilePictureUrl: 'https://example.com/avatar.jpg',
		};

		it('should successfully update user profile', async () => {
			const updatedUser = { ...mockUser, ...updateData };
			mockUserRepository.findById.mockResolvedValue(mockUser as User);
			mockUserRepository.update.mockResolvedValue(updatedUser as User);

			const result = await userService.updateProfile(userId, updateData as UpdateProfileDTO);

			expect(result).toBeDefined();
			expect(result.name).toBe(updateData.name);
			expect(result.bio).toBe(updateData.bio);
			expect(result.profilePictureUrl).toBe(updateData.profilePictureUrl);
			expect(mockUserRepository.findById).toHaveBeenCalledWith(userId);
			expect(mockUserRepository.update).toHaveBeenCalledWith(userId, updateData);
		});

		it('should throw error if user not found', async () => {
			mockUserRepository.findById.mockResolvedValue(null);

			(notFoundCreator.create as jest.Mock).mockReturnValue(
				new Error(HTTP_MESSAGES.USER_NOT_FOUND),
			);

			await expect(
				userService.updateProfile(userId, updateData as UpdateProfileDTO),
			).rejects.toThrow(HTTP_MESSAGES.USER_NOT_FOUND);
			expect(mockUserRepository.update).not.toHaveBeenCalled();
		});

		it('should update only provided fields', async () => {
			const partialUpdate = { bio: 'New bio' };
			const updatedUser = { ...mockUser, bio: partialUpdate.bio };
			mockUserRepository.findById.mockResolvedValue(mockUser as User);
			mockUserRepository.update.mockResolvedValue(updatedUser as User);

			const result = await userService.updateProfile(
				userId,
				partialUpdate as UpdateProfileDTO,
			);

			expect(result.bio).toBe(partialUpdate.bio);
			expect(mockUserRepository.update).toHaveBeenCalledWith(userId, partialUpdate);
		});
	});
});
