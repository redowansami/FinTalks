import { AuthService } from '../services/authService';
import { AuthRepository } from '../repositories/authRepository';
import { UserRepository } from '../repositories/userRepository';
import { UserService } from '../services/userService';
import { TransactionService } from '../services/transactionService';
import {
	notFoundCreator,
	unauthorizedCreator,
	forbiddenCreator,
	conflictCreator,
} from '../errors/errorFactory';
import { HTTP_MESSAGES } from '../constants/httpConstants';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User, UserRole } from '../entities/userEntity';
import { Auth } from '../entities/authEntity';

jest.mock('bcrypt');
jest.mock('jsonwebtoken');
jest.mock('crypto');
jest.mock('../config/email');
jest.mock('../errors/errorFactory', () => ({
	notFoundCreator: { create: jest.fn() },
	unauthorizedCreator: { create: jest.fn() },
	forbiddenCreator: { create: jest.fn() },
	conflictCreator: { create: jest.fn() },
}));
jest.mock('../utils/emailTemplates');

const mockBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;
const mockJwt = jwt as jest.Mocked<typeof jwt>;

describe('AuthService', () => {
	let authService: AuthService;
	let mockAuthRepository: jest.Mocked<AuthRepository>;
	let mockUserService: jest.Mocked<UserService>;
	let mockTransactionService: jest.Mocked<TransactionService>;

	const mockUser: User = {
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

	const mockUnconfirmedUser: User = {
		...mockUser,
		isEmailConfirmed: false,
	};

	const mockAuth: Auth = {
		authId: 'auth-123',
		userByUserId: mockUser,
		hashedPassword: 'hashed-password',
		passwordLastModificationTime: new Date(),
		passwordChangeCode: null,
		passwordChangeCodeExpiry: null,
	};

	beforeEach(() => {
		mockAuthRepository = {
			findByUserId: jest.fn(),
			create: jest.fn(),
			updatePassword: jest.fn(),
			updatePasswordChangeCode: jest.fn(),
		} as unknown as jest.Mocked<AuthRepository>;

		mockUserService = {
			getUserByEmailRaw: jest.fn(),
			getUserByIdRaw: jest.fn(),
			confirmEmailAddress: jest.fn(),
		} as unknown as jest.Mocked<UserService>;

		mockTransactionService = {
			execute: jest.fn(),
		} as unknown as jest.Mocked<TransactionService>;

		authService = new AuthService(mockAuthRepository, mockUserService, mockTransactionService);

		jest.clearAllMocks();
		(notFoundCreator.create as jest.Mock).mockImplementation((msg) => new Error(msg));
		(unauthorizedCreator.create as jest.Mock).mockImplementation((msg) => new Error(msg));
		(forbiddenCreator.create as jest.Mock).mockImplementation((msg) => new Error(msg));
		(conflictCreator.create as jest.Mock).mockImplementation((msg) => new Error(msg));
	});

	describe('signup', () => {
		const signupData = {
			username: 'newuser',
			email: 'newuser@example.com',
			name: 'New User',
			password: 'password123',
		};

		it('should successfully sign up a new user', async () => {
			mockTransactionService.execute.mockImplementation(async (callback) => {
				const mockAuthRepo = {
					create: jest.fn(),
				} as unknown as jest.Mocked<AuthRepository>;
				const mockUserRepo = {
					findByUsername: jest.fn().mockResolvedValue(null),
					findByEmail: jest.fn().mockResolvedValue(null),
					create: jest.fn().mockResolvedValue(mockUser),
				} as unknown as jest.Mocked<UserRepository>;
				await callback(mockAuthRepo, mockUserRepo);
			});

			mockBcrypt.hash.mockResolvedValue('hashed-password' as never);
			mockJwt.sign.mockReturnValue('email-token' as never);
			mockUserService.getUserByEmailRaw.mockResolvedValue(mockUser);

			const result = await authService.signup(signupData);

			expect(result).toEqual(mockUser);
			expect(mockTransactionService.execute).toHaveBeenCalled();
			expect(mockBcrypt.hash).toHaveBeenCalledWith(signupData.password, expect.any(Number));
		});

		it('should throw error if username already exists', async () => {
			mockTransactionService.execute.mockImplementation(async (callback) => {
				const mockAuthRepo = {
					create: jest.fn(),
				} as unknown as jest.Mocked<AuthRepository>;
				const mockUserRepo = {
					findByUsername: jest.fn().mockResolvedValue(mockUser),
					findByEmail: jest.fn(),
					create: jest.fn(),
				} as unknown as jest.Mocked<UserRepository>;
				await callback(mockAuthRepo, mockUserRepo);
			});

			(conflictCreator.create as jest.Mock).mockReturnValue(
				new Error(HTTP_MESSAGES.USERNAME_ALREADY_EXISTS),
			);

			await expect(authService.signup(signupData)).rejects.toThrow(
				HTTP_MESSAGES.USERNAME_ALREADY_EXISTS,
			);
		});

		it('should throw error if email already exists', async () => {
			mockTransactionService.execute.mockImplementation(async (callback) => {
				const mockAuthRepo = {
					create: jest.fn(),
				} as unknown as jest.Mocked<AuthRepository>;
				const mockUserRepo = {
					findByUsername: jest.fn().mockResolvedValue(null),
					findByEmail: jest.fn().mockResolvedValue(mockUser),
					create: jest.fn(),
				} as unknown as jest.Mocked<UserRepository>;
				await callback(mockAuthRepo, mockUserRepo);
			});

			(conflictCreator.create as jest.Mock).mockReturnValue(
				new Error(HTTP_MESSAGES.EMAIL_ALREADY_EXISTS),
			);

			await expect(authService.signup(signupData)).rejects.toThrow(
				HTTP_MESSAGES.EMAIL_ALREADY_EXISTS,
			);
		});
	});

	describe('login', () => {
		const loginData = {
			email: 'test@example.com',
			password: 'password123',
		};

		it('should successfully login a user', async () => {
			mockUserService.getUserByEmailRaw.mockResolvedValue(mockUser);
			mockAuthRepository.findByUserId.mockResolvedValue(mockAuth);
			mockBcrypt.compare.mockResolvedValue(true as never);
			mockJwt.sign.mockReturnValue('jwt-token' as never);

			const result = await authService.login(loginData);

			expect(result.token).toBe('jwt-token');
			expect(result.user).toEqual(
				expect.objectContaining({
					userId: mockUser.userId,
					username: mockUser.username,
				}),
			);
			expect(mockBcrypt.compare).toHaveBeenCalledWith(
				loginData.password,
				mockAuth.hashedPassword,
			);
		});

		it('should throw error if user not found', async () => {
			(unauthorizedCreator.create as jest.Mock).mockReturnValue(
				new Error(HTTP_MESSAGES.INVALID_CREDENTIALS),
			);
			mockUserService.getUserByEmailRaw.mockRejectedValue(new Error('User not found'));

			await expect(authService.login(loginData)).rejects.toThrow();
		});

		it('should throw error if password is invalid', async () => {
			mockUserService.getUserByEmailRaw.mockResolvedValue(mockUser);
			mockAuthRepository.findByUserId.mockResolvedValue(mockAuth);
			mockBcrypt.compare.mockResolvedValue(false as never);

			(unauthorizedCreator.create as jest.Mock).mockReturnValue(
				new Error(HTTP_MESSAGES.INVALID_PASSWORD),
			);

			await expect(authService.login(loginData)).rejects.toThrow(
				HTTP_MESSAGES.INVALID_PASSWORD,
			);
		});

		it('should throw error if email is not confirmed', async () => {
			mockUserService.getUserByEmailRaw.mockResolvedValue(mockUnconfirmedUser as User);
			mockAuthRepository.findByUserId.mockResolvedValue(mockAuth);
			mockBcrypt.compare.mockResolvedValue(true as never);

			(forbiddenCreator.create as jest.Mock).mockReturnValue(
				new Error(HTTP_MESSAGES.EMAIL_NOT_CONFIRMED),
			);

			await expect(authService.login(loginData)).rejects.toThrow(
				HTTP_MESSAGES.EMAIL_NOT_CONFIRMED,
			);
		});

		it('should throw error if authRow is not found', async () => {
			mockUserService.getUserByEmailRaw.mockResolvedValue(mockUser);
			mockAuthRepository.findByUserId.mockResolvedValue(null);

			(unauthorizedCreator.create as jest.Mock).mockReturnValue(
				new Error(HTTP_MESSAGES.INVALID_CREDENTIALS),
			);

			await expect(authService.login(loginData)).rejects.toThrow(
				HTTP_MESSAGES.INVALID_CREDENTIALS,
			);
		});
	});

	describe('confirmEmail', () => {
		const emailToken = 'email-confirmation-token';

		it('should confirm email successfully', async () => {
			const unconfirmedUser = { ...mockUser, isEmailConfirmed: false };
			mockJwt.verify.mockReturnValue({ userId: mockUser.userId } as never);
			mockUserService.getUserByIdRaw.mockResolvedValue(unconfirmedUser as User);
			mockUserService.confirmEmailAddress.mockResolvedValue(undefined);

			const result = await authService.confirmEmail(emailToken);

			expect(result.isConfirmed).toBe(true);
			expect(result.message).toBe(HTTP_MESSAGES.EMAIL_CONFIRMED_SUCCESSFULLY);
			expect(mockUserService.confirmEmailAddress).toHaveBeenCalledWith(mockUser.userId);
		});

		it('should return message if email already confirmed', async () => {
			mockJwt.verify.mockReturnValue({ userId: mockUser.userId } as never);
			mockUserService.getUserByIdRaw.mockResolvedValue(mockUser);

			const result = await authService.confirmEmail(emailToken);

			expect(result.isConfirmed).toBe(true);
			expect(result.message).toBe(HTTP_MESSAGES.EMAIL_ALREADY_CONFIRMED);
			expect(mockUserService.confirmEmailAddress).not.toHaveBeenCalled();
		});

		it('should throw error if user not found', async () => {
			mockJwt.verify.mockReturnValue({ userId: 'invalid-id' } as never);
			mockUserService.getUserByIdRaw.mockResolvedValue(null as any);

			(notFoundCreator.create as jest.Mock).mockReturnValue(
				new Error(HTTP_MESSAGES.USER_NOT_FOUND),
			);

			await expect(authService.confirmEmail(emailToken)).rejects.toThrow(
				HTTP_MESSAGES.USER_NOT_FOUND,
			);
		});
	});

	describe('resendConfirmationEmail', () => {
		const email = 'test@example.com';

		it('should resend confirmation email successfully', async () => {
			const unconfirmedUser = { ...mockUser, isEmailConfirmed: false };
			mockUserService.getUserByEmailRaw.mockResolvedValue(unconfirmedUser as User);
			mockJwt.sign.mockReturnValue('email-token' as never);

			const result = await authService.resendConfirmationEmail(email);

			expect(result.message).toBe(HTTP_MESSAGES.EMAIL_CONFIRMATION_RESENT);
		});

		it('should return message if email already confirmed', async () => {
			mockUserService.getUserByEmailRaw.mockResolvedValue(mockUser);

			const result = await authService.resendConfirmationEmail(email);

			expect(result.message).toBe(HTTP_MESSAGES.EMAIL_ALREADY_CONFIRMED);
		});
	});

	describe('changePassword', () => {
		const userId = mockUser.userId;
		const changeData = {
			currentPassword: 'password123',
			newPassword: 'newpassword123',
		};

		it('should change password successfully', async () => {
			mockUserService.getUserByIdRaw.mockResolvedValue(mockUser);
			mockAuthRepository.findByUserId.mockResolvedValue(mockAuth);
			mockBcrypt.compare.mockResolvedValue(true as never);
			mockBcrypt.hash.mockResolvedValue('new-hashed-password' as never);
			mockAuthRepository.updatePassword.mockResolvedValue(mockAuth as never);

			const result = await authService.changePassword(userId, changeData);

			expect(result.message).toBe(HTTP_MESSAGES.PASSWORD_CHANGED_SUCCESSFULLY);
			expect(mockBcrypt.compare).toHaveBeenCalledWith(
				changeData.currentPassword,
				mockAuth.hashedPassword,
			);
			expect(mockBcrypt.hash).toHaveBeenCalledWith(
				changeData.newPassword,
				expect.any(Number),
			);
			expect(mockAuthRepository.updatePassword).toHaveBeenCalledWith(
				mockAuth.authId,
				'new-hashed-password',
			);
		});

		it('should throw error if user not found', async () => {
			mockUserService.getUserByIdRaw.mockResolvedValue(null as any);

			(notFoundCreator.create as jest.Mock).mockReturnValue(
				new Error(HTTP_MESSAGES.USER_NOT_FOUND),
			);

			await expect(authService.changePassword(userId, changeData)).rejects.toThrow(
				HTTP_MESSAGES.USER_NOT_FOUND,
			);
		});

		it('should throw error if current password is incorrect', async () => {
			mockUserService.getUserByIdRaw.mockResolvedValue(mockUser);
			mockAuthRepository.findByUserId.mockResolvedValue(mockAuth);
			mockBcrypt.compare.mockResolvedValue(false as never);

			(unauthorizedCreator.create as jest.Mock).mockReturnValue(
				new Error(HTTP_MESSAGES.CURRENT_PASSWORD_INCORRECT),
			);

			await expect(authService.changePassword(userId, changeData)).rejects.toThrow(
				HTTP_MESSAGES.CURRENT_PASSWORD_INCORRECT,
			);
		});

		it('should throw error if authRow is not found', async () => {
			mockUserService.getUserByIdRaw.mockResolvedValue(mockUser);
			mockAuthRepository.findByUserId.mockResolvedValue(null);

			(unauthorizedCreator.create as jest.Mock).mockReturnValue(
				new Error(HTTP_MESSAGES.INVALID_CREDENTIALS),
			);

			await expect(authService.changePassword(userId, changeData)).rejects.toThrow(
				HTTP_MESSAGES.INVALID_CREDENTIALS,
			);
		});
	});
});
