import { User } from "../entities/userEntity";
import { UserRepository } from "../repositories/userRepository";

export class UserService {
    constructor(private readonly userRepository: UserRepository) {}

    async createUser(data: Partial<User>): Promise<User> {
        return await this.userRepository.create(data);
    }

    async getAllUsers(): Promise<User[]> {
        return await this.userRepository.findAll();
    }

    async getUserById(id: number): Promise<User | null> {
        return await this.userRepository.findById(id);
    }

    async updateUser(id: number, updatedData: Partial<User>): Promise<User | null> {
        const existingUser = await this.userRepository.findById(id);
        if (!existingUser) return null;

        Object.assign(existingUser, updatedData);
        return await this.userRepository.update(existingUser);
    }

    async deleteUser(id: number): Promise<boolean> {
        return await this.userRepository.softDelete(id);
    }
}
