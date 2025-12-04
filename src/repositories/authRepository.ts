import { Repository, EntityManager } from 'typeorm';
import { AppDataSource } from '../config/dataSource';
import { Auth } from '../entities/authEntity';

export class AuthRepository {
	private repository: Repository<Auth>;

	constructor() {
		this.repository = AppDataSource.getRepository(Auth);
	}

	create = async (auth: Partial<Auth>, manager?: EntityManager): Promise<Auth> => {
		const repo = manager ? manager.getRepository(Auth) : this.repository;
		const entity = repo.create(auth);
		return repo.save(entity);
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
}
