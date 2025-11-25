import { Repository } from 'typeorm';
import { AppDataSource } from '../config/dataSource';
import { User } from '../entities/userEntity';
import { CreateUserDTO } from 'dtos/userDTO';
import { UpdateResult } from 'typeorm/browser';

export class UserRepository {
	private repository: Repository<User>;

	constructor() {
		this.repository = AppDataSource.getRepository(User);
	}

	async create(data: CreateUserDTO): Promise<User> {
		const user: User = this.repository.create(data);
		return this.repository.save(user);
	}

	async findAll(): Promise<User[]> {
		return this.repository.find();
	}

	async findById(id: string): Promise<User | null> {
		return this.repository.findOne({ where: { userId: id } });
	}

	async update(id: string, user: Partial<User>): Promise<boolean> {
		const result: UpdateResult = await this.repository.update(id, user);
		return result.affected === 1;
	}

	async softDelete(id: string): Promise<boolean> {
		const result: UpdateResult = await this.repository.softDelete(id);
		return result.affected === 1;
	}
}
