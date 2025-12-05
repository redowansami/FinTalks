import { container } from 'tsyringe';
import { AppDataSource } from './dataSource';
import { AuthRepository } from '../repositories/authRepository';
import { UserRepository } from '../repositories/userRepository';
import { StoryRepository } from '../repositories/storyRepository';
import { AuthService } from '../services/authService';
import { UserService } from '../services/userService';
import { StoryService } from '../services/storyService';
import { TransactionService } from '../services/transactionService';
import { ENTITY_MANAGER } from '../constants/tokens';

export const registerDependencies = async (): Promise<void> => {
	await AppDataSource.initialize();

	container.registerInstance(ENTITY_MANAGER, AppDataSource.manager);
	container.registerSingleton(AuthRepository);
	container.registerSingleton(UserRepository);
	container.registerSingleton(StoryRepository);
	container.registerSingleton(AuthService);
	container.registerSingleton(UserService);
	container.registerSingleton(StoryService);
	container.registerSingleton(TransactionService);
};
