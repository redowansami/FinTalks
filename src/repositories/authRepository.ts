import { Repository, EntityManager } from 'typeorm';
import { AppDataSource } from '../config/dataSource';
import { Auth } from '../entities/authEntity';
import { inject, injectable } from 'tsyringe';
import { ENTITY_MANAGER } from '../constants/tokens';

@injectable()
export class AuthRepository {
	private repository: Repository<Auth>;

	constructor(@inject(ENTITY_MANAGER) private manager?: EntityManager) {
		this.repository = this.manager
			? this.manager.getRepository(Auth)
			: AppDataSource.getRepository(Auth);
	}

	create = async (auth: Partial<Auth>): Promise<Auth> => {
		const entity = this.repository.create(auth);
		return this.repository.save(entity);
	};

	findByUserId = async (userId: string): Promise<Auth | null> => {
		return this.repository.findOne({
			where: { userByUserId: { userId } },
			relations: ['userByUserId'],
		});
	};

	update = async (authId: string, data: Partial<Auth>): Promise<Auth | null> => {
		await this.repository.update(authId, data);
		return this.repository.findOne({ where: { authId } });
	};

	updatePasswordChangeCode = async (
		authId: string,
		code: string,
		expiryTime: Date,
	): Promise<Auth | null> => {
		await this.repository.update(authId, {
			passwordChangeCode: code,
			passwordChangeCodeExpiry: expiryTime,
		});
		return this.repository.findOne({ where: { authId } });
	};

	clearPasswordChangeCode = async (authId: string): Promise<Auth | null> => {
		await this.repository.update(authId, {
			passwordChangeCode: null,
			passwordChangeCodeExpiry: null,
		});
		return this.repository.findOne({ where: { authId } });
	};

	updatePassword = async (authId: string, hashedPassword: string): Promise<Auth | null> => {
		await this.repository.update(authId, {
			hashedPassword,
			passwordLastModificationTime: new Date(),
			passwordChangeCode: null,
			passwordChangeCodeExpiry: null,
		});
		return this.repository.findOne({ where: { authId } });
	};
}
