import { User } from "../entities/userEntity";
import { UserRepository } from "../repositories/userRepository";

export class UserService {
    constructor(private readonly userRepository: UserRepository) {}

    async createUser(data: Partial<User>): Promise<User> {
        return this.userRepository.create(data);
    }

    async getAllUsers(): Promise<User[]> {
        return this.userRepository.findAll();
    }

    async getUserById(id: number): Promise<User | null> {
        return this.userRepository.findById(id);
    }

    async updateUser(id: number, updatedData: Partial<User>): Promise<User | null> {
        const existingUser = await this.userRepository.findById(id);
        if (!existingUser) return null;

        Object.assign(existingUser, updatedData);
        return this.userRepository.update(existingUser);
    }

    async deleteUser(id: number): Promise<boolean> {
        return this.userRepository.softDelete(id);
    }
}
