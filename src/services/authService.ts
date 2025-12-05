import { AuthRepository } from '../repositories/authRepository';
import { SignupDTO, LoginDTO } from '../dtos/authDTO';
import { ErrorFactory } from '../errors/errorFactory';
import { HTTP_MESSAGES } from '../constants/httpConstants';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { transformToDTO } from '../utils/mapper';
import { UserResponseDTO } from '../dtos/userDTO';
import { injectable } from 'tsyringe';
import { UserService } from './userService';
import { TransactionService } from './transactionService';
import { env } from '../utils/envParser';

const JWT_SECRET = env.JWT_SECRET;
const JWT_EXPIRES_IN = env.JWT_EXPIRES_IN;
const BCRYPT_SALT_ROUNDS = env.BCRYPT_SALT_ROUNDS;

@injectable()
export class AuthService {
	constructor(
		private readonly authRepository: AuthRepository,
		private readonly userService: UserService,
		private readonly transactionService: TransactionService,
	) {}

	signup = async (data: SignupDTO): Promise<UserResponseDTO> => {
		return await this.transactionService.execute(async (authRepo, userRepo) => {
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

			return transformToDTO(UserResponseDTO, user);
		});
	};

	login = async (data: LoginDTO): Promise<{ token: string; user: UserResponseDTO }> => {
		const email = data.email;

		const user = await this.userService.getUserByEmail(email);
		if (!user) throw ErrorFactory.unauthorized(HTTP_MESSAGES.INVALID_CREDENTIALS);

		const authRow = await this.authRepository.findByUserId(user.userId);
		if (!authRow) throw ErrorFactory.unauthorized(HTTP_MESSAGES.INVALID_CREDENTIALS);

		const match = await bcrypt.compare(data.password, authRow.hashedPassword);
		if (!match) throw ErrorFactory.unauthorized(HTTP_MESSAGES.INVALID_PASSWORD);

		const token = jwt.sign(
			{
				userId: user.userId,
				username: user.username,
				role: user.role,
			},
			JWT_SECRET,
			{ expiresIn: JWT_EXPIRES_IN },
		);

		return {
			token,
			user: transformToDTO(UserResponseDTO, user),
		};
	};
}
