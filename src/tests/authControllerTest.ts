import { AuthController } from '../controllers/authController';
import { AuthService } from '../services/authService';
import { SignupDTO, LoginDTO } from '../dtos/authDTO';
import { HTTP_STATUS, HTTP_MESSAGES } from '../constants/httpConstants';
import { Request, Response } from 'express';

jest.mock('../services/authService');

describe('AuthController', () => {
	let authController: AuthController;
	let mockAuthService: jest.Mocked<AuthService>;
	let mockReq: Partial<Request>;
	let mockRes: Partial<Response>;

	beforeEach(() => {
		jest.clearAllMocks();
		mockAuthService = {
			signup: jest.fn(),
			login: jest.fn(),
			confirmEmail: jest.fn(),
			resendConfirmationEmail: jest.fn(),
			initiatePasswordChange: jest.fn(),
			confirmPasswordChange: jest.fn(),
			confirmPasswordCode: jest.fn(),
		} as unknown as jest.Mocked<AuthService>;

		authController = new AuthController(mockAuthService);

		mockReq = {
			body: {},
			params: {},
		};

		mockRes = {
			status: jest.fn().mockReturnThis(),
			json: jest.fn().mockReturnThis(),
		};
	});

	describe('signup', () => {
		it('should create a new user and send confirmation email with 201 status', async () => {
			const signupData: SignupDTO = {
				username: 'johndoe',
				email: 'john@example.com',
				name: 'John Doe',
				password: 'SecurePassword123!',
			};

			const mockSignupResponse = {
				userId: '123e4567-e89b-12d3-a456-426614174000',
				username: 'johndoe',
				email: 'john@example.com',
				name: 'John Doe',
				isEmailConfirmed: false,
				role: 'user',
			};

			mockReq.body = signupData;
			mockAuthService.signup.mockResolvedValue(mockSignupResponse as any);

			await authController.signup(mockReq as Request, mockRes as Response);

			expect(mockAuthService.signup).toHaveBeenCalledWith(signupData);
			expect(mockRes.status).toHaveBeenCalledWith(HTTP_STATUS.CREATED);
			expect(mockRes.json).toHaveBeenCalledWith({
				success: true,
				message: HTTP_MESSAGES.EMAIL_CONFIRMATION_SENT,
				user: mockSignupResponse,
			});
		});
	});

	describe('login', () => {
		it('should login user and return token with 200 status', async () => {
			const loginData: LoginDTO = {
				email: 'john@example.com',
				password: 'SecurePassword123!',
			};

			const mockUser = {
				userId: '123e4567-e89b-12d3-a456-426614174000',
				username: 'johndoe',
				email: 'john@example.com',
				name: 'John Doe',
				role: 'user',
			};

			const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';

			mockReq.body = loginData;
			mockAuthService.login.mockResolvedValue({
				token: mockToken,
				user: mockUser as any,
			});

			await authController.login(mockReq as Request, mockRes as Response);

			expect(mockAuthService.login).toHaveBeenCalledWith(loginData);
			expect(mockRes.status).toHaveBeenCalledWith(HTTP_STATUS.OK);
			expect(mockRes.json).toHaveBeenCalledWith({
				success: true,
				token: mockToken,
				user: mockUser,
			});
		});
	});

	describe('confirmEmail', () => {
		it('should confirm email and return success message with 200 status', async () => {
			const emailToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
			const mockResult = {
				message: HTTP_MESSAGES.EMAIL_CONFIRMED_SUCCESSFULLY,
				isConfirmed: true,
			};

			mockReq.params = { token: emailToken };
			mockAuthService.confirmEmail.mockResolvedValue(mockResult);

			await authController.confirmEmail(mockReq as Request, mockRes as Response);

			expect(mockAuthService.confirmEmail).toHaveBeenCalledWith(emailToken);
			expect(mockRes.status).toHaveBeenCalledWith(HTTP_STATUS.OK);
			expect(mockRes.json).toHaveBeenCalledWith({
				success: true,
				message: mockResult.message,
				isConfirmed: mockResult.isConfirmed,
			});
		});

		it('should handle already confirmed email', async () => {
			const emailToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
			const mockResult = {
				message: HTTP_MESSAGES.EMAIL_ALREADY_CONFIRMED,
				isConfirmed: true,
			};

			mockReq.params = { token: emailToken };
			mockAuthService.confirmEmail.mockResolvedValue(mockResult);

			await authController.confirmEmail(mockReq as Request, mockRes as Response);

			expect(mockRes.status).toHaveBeenCalledWith(HTTP_STATUS.OK);
			expect(mockRes.json).toHaveBeenCalledWith({
				success: true,
				message: HTTP_MESSAGES.EMAIL_ALREADY_CONFIRMED,
				isConfirmed: true,
			});
		});
	});

	describe('resendConfirmationEmail', () => {
		it('should resend confirmation email with 200 status', async () => {
			const email = 'john@example.com';
			const mockResult = {
				message: HTTP_MESSAGES.EMAIL_CONFIRMATION_RESENT,
			};

			mockReq.body = { email };
			mockAuthService.resendConfirmationEmail.mockResolvedValue(mockResult);

			await authController.resendConfirmationEmail(mockReq as Request, mockRes as Response);

			expect(mockAuthService.resendConfirmationEmail).toHaveBeenCalledWith(email);
			expect(mockRes.status).toHaveBeenCalledWith(HTTP_STATUS.OK);
			expect(mockRes.json).toHaveBeenCalledWith({
				success: true,
				message: mockResult.message,
			});
		});

		it('should handle email already confirmed', async () => {
			const email = 'john@example.com';
			const mockResult = {
				message: HTTP_MESSAGES.EMAIL_ALREADY_CONFIRMED,
			};

			mockReq.body = { email };
			mockAuthService.resendConfirmationEmail.mockResolvedValue(mockResult);

			await authController.resendConfirmationEmail(mockReq as Request, mockRes as Response);

			expect(mockRes.status).toHaveBeenCalledWith(HTTP_STATUS.OK);
			expect(mockRes.json).toHaveBeenCalledWith({
				success: true,
				message: HTTP_MESSAGES.EMAIL_ALREADY_CONFIRMED,
			});
		});
	});
});
