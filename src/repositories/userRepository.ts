import { Repository } from 'typeorm';
import { AppDataSource } from '../config/dataSource';
import { User } from '../entities/userEntity';
import { CreateUserDTO } from 'dtos/userDTO';
import { buildCursorPaginationQuery } from '../utils/paginationQuery';

export class UserRepository {
	private repository: Repository<User>;

	constructor() {
		this.repository = AppDataSource.getRepository(User);
	}

	create = async (data: CreateUserDTO): Promise<User> => {
		const user = this.repository.create(data);
		return this.repository.save(user);
	};

	findAll = async (): Promise<User[]> => {
		return this.repository.find();
	};

	findPaginated = async (startAfter: string | undefined, limit: number): Promise<User[]> => {
		const queryBuilder = this.repository.createQueryBuilder('user');
		buildCursorPaginationQuery(queryBuilder, 'user.userId', startAfter, limit);
		return queryBuilder.getMany();
	};

	findById = async (id: string): Promise<User | null> => {
		return this.repository.findOne({ where: { userId: id } });
	};

	findByUsername = async (username: string): Promise<User | null> => {
		return this.repository.findOne({ where: { username } });
	};

	findByEmail = async (email: string): Promise<User | null> => {
		return this.repository.findOne({ where: { email } });
	};

	update = async (id: string, user: Partial<User>): Promise<boolean> => {
		const result = await this.repository.update(id, user);
		return result.affected === 1;
	};

	softDelete = async (id: string): Promise<boolean> => {
		const result = await this.repository.softDelete(id);
		return result.affected === 1;
	};
}
