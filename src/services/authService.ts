import { AuthRepository } from '../repositories/authRepository';
import {
	SignupDTO,
	LoginDTO,
	InitiatePasswordChangeDTO,
	ConfirmPasswordChangeDTO,
} from '../dtos/authDTO';
import { ErrorFactory } from '../errors/errorFactory';
import { HTTP_MESSAGES } from '../constants/httpConstants';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { transformToDTO } from '../utils/mapper';
import { UserResponseDTO, SignupResponseDTO } from '../dtos/userDTO';
import { injectable } from 'tsyringe';
import { UserService } from './userService';
import { TransactionService } from './transactionService';
import { env } from '../utils/envParser';
import transporter from '../config/email';
import { emailTemplates } from '../utils/emailTemplates';
import crypto from 'crypto';

const JWT_SECRET = env.JWT_SECRET;
const JWT_EXPIRES_IN = env.JWT_EXPIRES_IN;
const BCRYPT_SALT_ROUNDS = env.BCRYPT_SALT_ROUNDS;
const EMAIL_TOKEN_SECRET = env.EMAIL_TOKEN_SECRET;
const EMAIL_TOKEN_EXPIRES_IN = env.EMAIL_TOKEN_EXPIRES_IN;
const BACKEND_URL = env.BACKEND_URL;
const EMAIL_FROM = env.EMAIL_FROM;
const PASSWORD_CHANGE_CODE_EXPIRY = env.PASSWORD_CHANGE_CODE_EXPIRY;

@injectable()
export class AuthService {
	constructor(
		private readonly authRepository: AuthRepository,
		private readonly userService: UserService,
		private readonly transactionService: TransactionService,
	) {}

	signup = async (data: SignupDTO): Promise<SignupResponseDTO> => {
		await this.transactionService.execute(async (authRepo, userRepo) => {
			const isUsernameFound = await userRepo.findByUsername(data.username);
			if (isUsernameFound) {
				throw ErrorFactory.conflict(HTTP_MESSAGES.USERNAME_ALREADY_EXISTS);
			}

			const isEmailFound = await userRepo.findByEmail(data.email);
			if (isEmailFound) {
				throw ErrorFactory.conflict(HTTP_MESSAGES.EMAIL_ALREADY_EXISTS);
			}

			const user = await userRepo.create({
				username: data.username,
				name: data.name,
				email: data.email,
			});

			const hashedPassword = await bcrypt.hash(data.password, BCRYPT_SALT_ROUNDS);

			await authRepo.create({
				hashedPassword,
				passwordLastModificationTime: new Date(),
				userByUserId: { userId: user.userId } as any,
			});

			await this.sendConfirmationEmail(user.userId, user.email);
		});

		const signupResponse = await this.userService.getUserByEmailRaw(data.email);

		return signupResponse;
	};

	login = async (data: LoginDTO): Promise<{ token: string; user: UserResponseDTO }> => {
		const email = data.email;

		const userRaw = await this.userService.getUserByEmailRaw(email);

		const authRow = await this.authRepository.findByUserId(userRaw.userId);
		if (!authRow) throw ErrorFactory.unauthorized(HTTP_MESSAGES.INVALID_CREDENTIALS);

		const match = await bcrypt.compare(data.password, authRow.hashedPassword);
		if (!match) throw ErrorFactory.unauthorized(HTTP_MESSAGES.INVALID_PASSWORD);

		if (!userRaw.isEmailConfirmed) {
			throw ErrorFactory.forbidden(HTTP_MESSAGES.EMAIL_NOT_CONFIRMED);
		}

		const token = jwt.sign(
			{
				userId: userRaw.userId,
				username: userRaw.username,
				role: userRaw.role,
			},
			JWT_SECRET,
			{ expiresIn: JWT_EXPIRES_IN },
		);

		return {
			token,
			user: transformToDTO(UserResponseDTO, userRaw),
		};
	};

	confirmEmail = async (token: string): Promise<{ message: string; isConfirmed: boolean }> => {
		const decoded = jwt.verify(token, EMAIL_TOKEN_SECRET) as { userId: string };

		const userRaw = await this.userService.getUserByIdRaw(decoded.userId);
		if (!userRaw) {
			throw ErrorFactory.notFound(HTTP_MESSAGES.USER_NOT_FOUND);
		}

		if (userRaw.isEmailConfirmed) {
			return {
				message: HTTP_MESSAGES.EMAIL_ALREADY_CONFIRMED,
				isConfirmed: true,
			};
		}

		await this.userService.confirmEmailAddress(userRaw.userId);

		return {
			message: HTTP_MESSAGES.EMAIL_CONFIRMED_SUCCESSFULLY,
			isConfirmed: true,
		};
	};

	resendConfirmationEmail = async (email: string): Promise<{ message: string }> => {
		const userRaw = await this.userService.getUserByEmailRaw(email);

		if (userRaw.isEmailConfirmed) {
			return {
				message: HTTP_MESSAGES.EMAIL_ALREADY_CONFIRMED,
			};
		}

		await this.sendConfirmationEmail(userRaw.userId, userRaw.email);

		return {
			message: HTTP_MESSAGES.EMAIL_CONFIRMATION_RESENT,
		};
	};

	private sendConfirmationEmail = async (userId: string, userEmail: string): Promise<void> => {
		const emailToken = jwt.sign({ userId }, EMAIL_TOKEN_SECRET, {
			expiresIn: EMAIL_TOKEN_EXPIRES_IN,
		} as any);

		const confirmUrl = `${BACKEND_URL}/api/v1/auth/confirm-email/${emailToken}`;

		await transporter.sendMail({
			from: EMAIL_FROM,
			to: userEmail,
			subject: 'Confirm your FinTalks email address',
			html: emailTemplates.confirmationEmail(confirmUrl, EMAIL_TOKEN_EXPIRES_IN),
		});
	};

	initiatePasswordChange = async (
		userId: string,
		data: InitiatePasswordChangeDTO,
	): Promise<{ message: string }> => {
		const userRaw = await this.userService.getUserByIdRaw(userId);
		if (!userRaw) {
			throw ErrorFactory.notFound(HTTP_MESSAGES.USER_NOT_FOUND);
		}

		const authRow = await this.authRepository.findByUserId(userId);
		if (!authRow) {
			throw ErrorFactory.unauthorized(HTTP_MESSAGES.INVALID_CREDENTIALS);
		}

		const isPasswordValid = await bcrypt.compare(data.currentPassword, authRow.hashedPassword);
		if (!isPasswordValid) {
			throw ErrorFactory.unauthorized(HTTP_MESSAGES.CURRENT_PASSWORD_INCORRECT);
		}

		const code = crypto.randomInt(100000, 999999).toString();
		const expiryTime = new Date(Date.now() + PASSWORD_CHANGE_CODE_EXPIRY * 1000);

		await this.authRepository.validatePasswordChangeCode(authRow.authId, code, expiryTime);

		await this.sendPasswordChangeEmail(userRaw.email, code);

		return {
			message: HTTP_MESSAGES.PASSWORD_CHANGE_EMAIL_SENT,
		};
	};

	confirmPasswordChange = async (
		userId: string,
		data: ConfirmPasswordChangeDTO,
	): Promise<{ message: string }> => {
		const userRaw = await this.userService.getUserByIdRaw(userId);
		if (!userRaw) {
			throw ErrorFactory.notFound(HTTP_MESSAGES.USER_NOT_FOUND);
		}

		const authRow = await this.authRepository.findByUserId(userId);
		if (!authRow) {
			throw ErrorFactory.unauthorized(HTTP_MESSAGES.INVALID_CREDENTIALS);
		}

		const hashedPassword = await bcrypt.hash(data.newPassword, BCRYPT_SALT_ROUNDS);
		await this.authRepository.updatePassword(authRow.authId, hashedPassword);

		return {
			message: HTTP_MESSAGES.PASSWORD_CHANGED_SUCCESSFULLY,
		};
	};

	confirmPasswordCode = async (
		userId: string,
		code: string,
	): Promise<{ message: string; token: string }> => {
		const userRaw = await this.userService.getUserByIdRaw(userId);
		if (!userRaw) {
			throw ErrorFactory.notFound(HTTP_MESSAGES.USER_NOT_FOUND);
		}

		const authRow = await this.authRepository.findByUserId(userId);
		if (!authRow) {
			throw ErrorFactory.unauthorized(HTTP_MESSAGES.INVALID_CREDENTIALS);
		}

		if (
			authRow.passwordChangeCode !== code ||
			!authRow.passwordChangeCodeExpiry ||
			authRow.passwordChangeCodeExpiry < new Date()
		) {
			throw ErrorFactory.unauthorized(HTTP_MESSAGES.PASSWORD_CHANGE_CODE_INVALID);
		}

		const passwordChangeToken = jwt.sign(
			{
				userId,
			},
			JWT_SECRET,
			{ expiresIn: '15m' },
		);

		return {
			message: HTTP_MESSAGES.PASSWORD_CHANGE_CODE_VERIFIED,
			token: passwordChangeToken,
		};
	};

	private sendPasswordChangeEmail = async (userEmail: string, code: string): Promise<void> => {
		await transporter.sendMail({
			from: EMAIL_FROM,
			to: userEmail,
			subject: 'Confirm your password change request',
			html: emailTemplates.passwordChangeEmail(
				code,
				`${PASSWORD_CHANGE_CODE_EXPIRY / 60} minutes`,
			),
		});
	};
}
