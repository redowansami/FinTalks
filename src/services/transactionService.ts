import { AppDataSource } from '../config/dataSource';
import { injectable, container } from 'tsyringe';
import { AuthRepository } from '../repositories/authRepository';
import { UserRepository } from '../repositories/userRepository';
import { ENTITY_MANAGER } from '../constants/tokens';

@injectable()
export class TransactionService {
	async execute<T>(
		callback: (authRepository: AuthRepository, userRepository: UserRepository) => Promise<T>,
	): Promise<T> {
		return await AppDataSource.manager.transaction(async (transactionManager) => {
			const transactionContainer = container.createChildContainer();
			transactionContainer.registerInstance(ENTITY_MANAGER, transactionManager);

			const authRepoWithTx = transactionContainer.resolve(AuthRepository);
			const userRepoWithTx = transactionContainer.resolve(UserRepository);

			return callback(authRepoWithTx, userRepoWithTx);
		});
	}
}
