import { Repository } from 'typeorm';
import { AppDataSource } from '../config/dataSource';
import { User } from '../entities/userEntity';
import { CreateUserDTO, UserQueryDTO } from 'dtos/userDTO';
import { buildCursorPaginationQuery } from '../utils/paginationQuery';
import { applyFuzzySearch } from '../utils/fuzzySearch';

export class UserRepository {
	private repository: Repository<User>;

	constructor() {
		this.repository = AppDataSource.getRepository(User);
	}

	create = async (data: CreateUserDTO): Promise<User> => {
		const user = this.repository.create(data);
		return this.repository.save(user);
	};

	findPaginated = async (queryParams: UserQueryDTO): Promise<User[]> => {
		const { search, orderBy, startAfter, limit } = queryParams;
		const queryBuilder = this.repository.createQueryBuilder('user');

		if (search && search.trim()) {
			applyFuzzySearch(queryBuilder, {
				'user.name': search,
				'user.username': search,
				'user.email': search,
			});
		}

		const orderByField = orderBy ? `user.${orderBy}` : 'user.userId';
		buildCursorPaginationQuery(queryBuilder, 'user.userId', startAfter, limit, orderByField);

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
		console.log(result);
		return result.affected === 1;
	};

	softDelete = async (id: string): Promise<boolean> => {
		const result = await this.repository.softDelete(id);
		return result.affected === 1;
	};
}
