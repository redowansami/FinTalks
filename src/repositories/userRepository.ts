import { Repository } from 'typeorm';
import { AppDataSource } from '../config/dataSource';
import { User } from '../entities/userEntity';
import { CreateUserDTO } from 'dtos/userDTO';

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
