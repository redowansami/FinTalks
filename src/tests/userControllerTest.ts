import { UserController } from '../controllers/userController';
import { UserService } from '../services/userService';
import { AuthService } from '../services/authService';
import { HTTP_STATUS, HTTP_MESSAGES } from '../constants/httpConstants';
import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';

jest.mock('../services/userService');
jest.mock('../services/authService');
jest.mock('jsonwebtoken');

describe('UserController', () => {
	let userController: UserController;
	let mockUserService: jest.Mocked<UserService>;
	let mockAuthService: jest.Mocked<AuthService>;
	let mockReq: Partial<Request & { user?: any; validatedReq?: any }>;
	let mockRes: Partial<Response>;

	beforeEach(() => {
		jest.clearAllMocks();

		mockUserService = {
			findAllUsers: jest.fn(),
			getUserById: jest.fn(),
			deleteUser: jest.fn(),
			escalateUserToAdmin: jest.fn(),
			getProfile: jest.fn(),
			updateProfile: jest.fn(),
		} as unknown as jest.Mocked<UserService>;

		mockAuthService = {
			initiatePasswordChange: jest.fn(),
			confirmPasswordChange: jest.fn(),
			confirmPasswordCode: jest.fn(),
		} as unknown as jest.Mocked<AuthService>;

		userController = new UserController(mockUserService, mockAuthService);

		mockReq = {
			body: {},
			params: {},
			user: undefined,
			validatedReq: {},
		};

		mockRes = {
			status: jest.fn().mockReturnThis(),
			json: jest.fn().mockReturnThis(),
			sendStatus: jest.fn(),
		};
	});

	describe('findAll', () => {
		it('should return all users with pagination', async () => {
			const mockQueryParams = {
				cursor: null,
				limit: 10,
			};

			const mockUsers = [
				{
					userId: 'user-1',
					username: 'john',
					email: 'john@example.com',
					role: 'user',
				},
				{
					userId: 'user-2',
					username: 'jane',
					email: 'jane@example.com',
					role: 'admin',
				},
			];

			const mockResponse = {
				list: mockUsers,
				nextCursor: 'next-cursor-123',
			};

			mockReq.validatedReq = { query: mockQueryParams };
			mockUserService.findAllUsers.mockResolvedValue(mockResponse as any);

			await userController.findAll(mockReq as Request, mockRes as Response);

			expect(mockUserService.findAllUsers).toHaveBeenCalledWith(mockQueryParams);
			expect(mockRes.status).toHaveBeenCalledWith(HTTP_STATUS.OK);
			expect(mockRes.json).toHaveBeenCalledWith({
				success: true,
				list: mockUsers,
				nextCursor: 'next-cursor-123',
			});
		});
	});

	describe('findOne', () => {
		it('should return a user by id', async () => {
			const userId = 'user-123';
			const mockUser = {
				userId,
				username: 'johndoe',
				email: 'john@example.com',
				name: 'John Doe',
				role: 'user',
			};

			mockReq.params = { userId };
			mockUserService.getUserById.mockResolvedValue(mockUser as any);

			await userController.findOne(mockReq as Request, mockRes as Response);

			expect(mockUserService.getUserById).toHaveBeenCalledWith(userId);
			expect(mockRes.status).toHaveBeenCalledWith(HTTP_STATUS.OK);
			expect(mockRes.json).toHaveBeenCalledWith({
				success: true,
				user: mockUser,
			});
		});
	});

	describe('delete', () => {
		it('should delete a user and return 204 status', async () => {
			const userId = 'user-123';

			mockReq.params = { userId };
			mockUserService.deleteUser.mockResolvedValue(undefined);

			await userController.delete(mockReq as Request, mockRes as Response);

			expect(mockUserService.deleteUser).toHaveBeenCalledWith(userId);
			expect(mockRes.sendStatus).toHaveBeenCalledWith(HTTP_STATUS.NO_CONTENT);
		});
	});

	describe('escalateToAdmin', () => {
		it('should escalate user to admin and return updated user', async () => {
			const userId = 'user-123';
			const mockUpdatedUser = {
				userId,
				username: 'johndoe',
				email: 'john@example.com',
				role: 'admin',
			};

			mockReq.body = { userId };
			mockUserService.escalateUserToAdmin.mockResolvedValue(mockUpdatedUser as any);

			await userController.escalateToAdmin(mockReq as Request, mockRes as Response);

			expect(mockUserService.escalateUserToAdmin).toHaveBeenCalledWith(userId);
			expect(mockRes.status).toHaveBeenCalledWith(HTTP_STATUS.OK);
			expect(mockRes.json).toHaveBeenCalledWith({
				success: true,
				message: HTTP_MESSAGES.USER_UPDATED,
				user: mockUpdatedUser,
			});
		});
	});

	describe('initiatePasswordChange', () => {
		it('should initiate password change and return message', async () => {
			const userId = 'user-123';
			const passwordData = {
				currentPassword: 'OldPassword123!',
				newPassword: 'NewPassword123!',
			};

			const mockResponse = {
				message: 'Password change initiated',
			};

			mockReq.user = { userId };
			mockReq.body = passwordData;
			mockAuthService.initiatePasswordChange.mockResolvedValue(mockResponse as any);

			await userController.initiatePasswordChange(mockReq as any, mockRes as Response);

			expect(mockAuthService.initiatePasswordChange).toHaveBeenCalledWith(
				userId,
				passwordData,
			);
			expect(mockRes.status).toHaveBeenCalledWith(HTTP_STATUS.OK);
			expect(mockRes.json).toHaveBeenCalledWith({
				success: true,
				message: mockResponse.message,
			});
		});
	});

	describe('confirmPasswordChange', () => {
		it('should confirm password change with valid token', async () => {
			const token = 'valid-jwt-token';
			const userId = 'user-123';
			const passwordData = {
				code: '123456',
				newPassword: 'NewPassword123!',
			};

			const mockResponse = {
				message: 'Password changed successfully',
			};

			mockReq.params = { token };
			mockReq.body = passwordData;

			(jwt.verify as jest.Mock).mockReturnValue({ userId });
			mockAuthService.confirmPasswordChange.mockResolvedValue(mockResponse as any);

			await userController.confirmPasswordChange(mockReq as Request, mockRes as Response);

			expect(jwt.verify).toHaveBeenCalledWith(token, expect.any(String));
			expect(mockAuthService.confirmPasswordChange).toHaveBeenCalledWith(
				userId,
				passwordData,
			);
			expect(mockRes.status).toHaveBeenCalledWith(HTTP_STATUS.OK);
			expect(mockRes.json).toHaveBeenCalledWith({
				success: true,
				message: mockResponse.message,
			});
		});
	});

	describe('confirmPasswordCode', () => {
		it('should confirm password code and return token', async () => {
			const userId = 'user-123';
			const code = '123456';
			const mockToken = 'new-jwt-token';

			const mockResponse = {
				message: 'Code verified',
				token: mockToken,
			};

			mockReq.user = { userId };
			mockReq.body = { code };
			mockAuthService.confirmPasswordCode.mockResolvedValue(mockResponse as any);

			await userController.confirmPasswordCode(mockReq as any, mockRes as Response);

			expect(mockAuthService.confirmPasswordCode).toHaveBeenCalledWith(userId, code);
			expect(mockRes.status).toHaveBeenCalledWith(HTTP_STATUS.OK);
			expect(mockRes.json).toHaveBeenCalledWith({
				success: true,
				message: mockResponse.message,
				token: mockToken,
			});
		});
	});

	describe('getProfile', () => {
		it('should return user profile', async () => {
			const userId = 'user-123';
			const mockProfile = {
				userId,
				username: 'johndoe',
				email: 'john@example.com',
				name: 'John Doe',
				bio: 'Software developer',
			};

			mockReq.user = { userId };
			mockUserService.getProfile.mockResolvedValue(mockProfile as any);

			await userController.getProfile(mockReq as any, mockRes as Response);

			expect(mockUserService.getProfile).toHaveBeenCalledWith(userId);
			expect(mockRes.status).toHaveBeenCalledWith(HTTP_STATUS.OK);
			expect(mockRes.json).toHaveBeenCalledWith({
				success: true,
				message: HTTP_MESSAGES.PROFILE_FETCHED_SUCCESSFULLY,
				profile: mockProfile,
			});
		});
	});

	describe('updateProfile', () => {
		it('should update user profile and return updated profile', async () => {
			const userId = 'user-123';
			const updateData = {
				name: 'John Updated',
				bio: 'Updated bio',
			};

			const mockUpdatedProfile = {
				userId,
				username: 'johndoe',
				email: 'john@example.com',
				name: 'John Updated',
				bio: 'Updated bio',
			};

			mockReq.user = { userId };
			mockReq.body = updateData;
			mockUserService.updateProfile.mockResolvedValue(mockUpdatedProfile as any);

			await userController.updateProfile(mockReq as any, mockRes as Response);

			expect(mockUserService.updateProfile).toHaveBeenCalledWith(userId, updateData);
			expect(mockRes.status).toHaveBeenCalledWith(HTTP_STATUS.OK);
			expect(mockRes.json).toHaveBeenCalledWith({
				success: true,
				message: HTTP_MESSAGES.PROFILE_UPDATED_SUCCESSFULLY,
				profile: mockUpdatedProfile,
			});
		});
	});
});
