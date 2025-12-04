import { AuthRepository } from '../repositories/authRepository';
import { SignupDTO, LoginDTO } from '../dtos/authDTO';
import { ErrorFactory } from '../errors/errorFactory';
import { HTTP_MESSAGES } from '../constants/httpConstants';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { transformToDTO } from '../utils/mapper';
import { UserResponseDTO } from '../dtos/userDTO';
import { autoInjectable } from 'tsyringe';
import { UserService } from './userService';
import { env } from '../utils/envParser';
import { AppDataSource } from '../config/dataSource';

const JWT_SECRET = env.JWT_SECRET;
const JWT_EXPIRES_IN = env.JWT_EXPIRES_IN;
const BCRYPT_SALT_ROUNDS = env.BCRYPT_SALT_ROUNDS;

@autoInjectable()
export class AuthService {
	constructor(
		private readonly authRepository: AuthRepository,
		private readonly userService: UserService,
	) {}

	signup = async (data: SignupDTO): Promise<UserResponseDTO> => {
		return await AppDataSource.manager.transaction(async (transactionManager) => {
			const user = await this.userService.createUser(
				{
					username: data.username,
					name: data.name,
					email: data.email,
				},
				transactionManager,
			);

			const hashedPassword = await bcrypt.hash(data.password, BCRYPT_SALT_ROUNDS);

			await this.authRepository.create(
				{
					hashedPassword,
					passwordLastModificationTime: new Date(),
					userByUserId: { userId: user.userId } as any,
				},
				transactionManager,
			);

			return user;
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
