import { Repository } from "typeorm";
import { AppDataSource } from "../config/dataSource";
import { User } from "../entities/userEntity";

export class UserRepository {
    private repository: Repository<User>;

    constructor() {
        this.repository = AppDataSource.getRepository(User);
    }

    async create(data: Partial<User>): Promise<User> {
        const user = this.repository.create(data);
        return await this.repository.save(user);
    }

    async findAll(): Promise<User[]> {
        return await this.repository.find();
    }

    async findById(id: number): Promise<User | null> {
        return await this.repository.findOne({ where: { id } });
    }

    async update(user: User): Promise<User> {
        return await this.repository.save(user);
    }

    async softDelete(id: number): Promise<boolean> {
        const result = await this.repository.softDelete(id);
        return result.affected === 1;
    }
}
