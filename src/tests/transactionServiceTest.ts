import { TransactionService } from '../services/transactionService';
import { AuthRepository } from '../repositories/authRepository';
import { UserRepository } from '../repositories/userRepository';
import { AppDataSource } from '../config/dataSource';
import { container } from 'tsyringe';
import { ENTITY_MANAGER } from '../constants/tokens';
import { EntityManager } from 'typeorm';

jest.mock('../config/dataSource');

interface MockTransactionManager extends EntityManager {
	transaction: jest.Mock;
}

interface MockAuthRepository extends Partial<AuthRepository> {
	findByUserId: jest.Mock;
	create: jest.Mock;
	updatePassword: jest.Mock;
	updatePasswordChangeCode: jest.Mock;
}

interface MockUserRepository extends Partial<UserRepository> {
	getUserByIdRaw: jest.Mock;
	getUserByEmailRaw: jest.Mock;
}

interface MockChildContainer {
	registerInstance: jest.Mock;
	resolve: jest.Mock;
}

interface MockDataSource {
	manager: {
		transaction: jest.Mock;
	};
}

const mockAppDataSource = AppDataSource as unknown as MockDataSource;

describe('TransactionService', () => {
	let transactionService: TransactionService;
	let mockTransactionManager: MockTransactionManager;
	let mockChildContainer: MockChildContainer;
	let mockAuthRepository: MockAuthRepository;
	let mockUserRepository: MockUserRepository;

	beforeEach(() => {
		jest.clearAllMocks();

		mockTransactionManager = {
			transaction: jest.fn(),
		} as unknown as MockTransactionManager;

		mockAuthRepository = {
			findByUserId: jest.fn(),
			create: jest.fn(),
			updatePassword: jest.fn(),
			updatePasswordChangeCode: jest.fn(),
		};

		mockUserRepository = {
			getUserByIdRaw: jest.fn(),
			getUserByEmailRaw: jest.fn(),
		};

		mockChildContainer = {
			registerInstance: jest.fn().mockReturnThis(),
			resolve: jest.fn((token: unknown) => {
				if (token === AuthRepository) {
					return mockAuthRepository;
				} else if (token === UserRepository) {
					return mockUserRepository;
				}
			}),
		};

		Object.defineProperty(mockAppDataSource, 'manager', {
			value: {
				transaction: jest.fn(),
			},
			writable: true,
			configurable: true,
		});

		jest.spyOn(container, 'createChildContainer').mockReturnValue(mockChildContainer as never);

		transactionService = new TransactionService();
	});

	afterEach(() => {
		jest.restoreAllMocks();
	});

	describe('execute', () => {
		it('should execute callback within a transaction', async () => {
			const mockCallback = jest.fn().mockResolvedValue('success');

			mockAppDataSource.manager.transaction = jest
				.fn()
				.mockImplementation(
					async (cb: (manager: MockTransactionManager) => Promise<string>) => {
						return cb(mockTransactionManager);
					},
				);

			const result = await transactionService.execute(mockCallback);

			expect(mockAppDataSource.manager.transaction).toHaveBeenCalledTimes(1);
			expect(mockChildContainer.registerInstance).toHaveBeenCalledWith(
				ENTITY_MANAGER,
				mockTransactionManager,
			);
			expect(mockChildContainer.resolve).toHaveBeenCalledTimes(2);
			expect(mockChildContainer.resolve).toHaveBeenNthCalledWith(1, AuthRepository);
			expect(mockChildContainer.resolve).toHaveBeenNthCalledWith(2, UserRepository);
			expect(mockCallback).toHaveBeenCalledWith(mockAuthRepository, mockUserRepository);
			expect(result).toBe('success');
		});

		it('should pass resolved repositories to the callback function', async () => {
			const mockCallback = jest.fn().mockResolvedValue('resolved');

			mockAppDataSource.manager.transaction = jest.fn().mockImplementation(async (cb) => {
				return cb(mockTransactionManager);
			});

			await transactionService.execute(mockCallback);

			expect(mockCallback).toHaveBeenCalledWith(mockAuthRepository, mockUserRepository);
		});

		it('should return the result from the callback', async () => {
			const expectedResult = { data: 'test-result' };
			const mockCallback = jest.fn().mockResolvedValue(expectedResult);

			mockAppDataSource.manager.transaction = jest.fn().mockImplementation(async (cb) => {
				return cb(mockTransactionManager);
			});

			const result = await transactionService.execute(mockCallback);

			expect(result).toEqual(expectedResult);
		});

		it('should handle callback errors and propagate them', async () => {
			const testError = new Error('Callback execution failed');
			const mockCallback = jest.fn().mockRejectedValue(testError);

			mockAppDataSource.manager.transaction = jest.fn().mockImplementation(async (cb) => {
				return cb(mockTransactionManager);
			});

			await expect(transactionService.execute(mockCallback)).rejects.toThrow(
				'Callback execution failed',
			);
			expect(mockCallback).toHaveBeenCalled();
		});

		it('should handle transaction manager errors', async () => {
			const transactionError = new Error('Transaction failed');
			const mockCallback = jest.fn();

			mockAppDataSource.manager.transaction = jest.fn().mockRejectedValue(transactionError);

			await expect(transactionService.execute(mockCallback)).rejects.toThrow(
				'Transaction failed',
			);
			expect(mockCallback).not.toHaveBeenCalled();
		});

		it('should create a child container for transaction isolation', async () => {
			const mockCallback = jest.fn().mockResolvedValue('success');

			mockAppDataSource.manager.transaction = jest.fn().mockImplementation(async (cb) => {
				return cb(mockTransactionManager);
			});

			await transactionService.execute(mockCallback);

			expect(container.createChildContainer).toHaveBeenCalledTimes(1);
		});

		it('should register entity manager with the correct token', async () => {
			const mockCallback = jest.fn().mockResolvedValue('success');

			mockAppDataSource.manager.transaction = jest.fn().mockImplementation(async (cb) => {
				return cb(mockTransactionManager);
			});

			await transactionService.execute(mockCallback);

			expect(mockChildContainer.registerInstance).toHaveBeenCalledWith(
				ENTITY_MANAGER,
				mockTransactionManager,
			);
		});

		it('should resolve repositories from child container', async () => {
			const mockCallback = jest.fn().mockResolvedValue('success');

			mockAppDataSource.manager.transaction = jest.fn().mockImplementation(async (cb) => {
				return cb(mockTransactionManager);
			});

			await transactionService.execute(mockCallback);

			expect(mockChildContainer.resolve).toHaveBeenCalledWith(AuthRepository);
			expect(mockChildContainer.resolve).toHaveBeenCalledWith(UserRepository);
		});

		it('should support multiple sequential executions', async () => {
			const mockCallback1 = jest.fn().mockResolvedValue('result1');
			const mockCallback2 = jest.fn().mockResolvedValue('result2');

			mockAppDataSource.manager.transaction = jest.fn().mockImplementation(async (cb) => {
				return cb(mockTransactionManager);
			});

			const result1 = await transactionService.execute(mockCallback1);
			const result2 = await transactionService.execute(mockCallback2);

			expect(result1).toBe('result1');
			expect(result2).toBe('result2');
			expect(mockAppDataSource.manager.transaction).toHaveBeenCalledTimes(2);
			expect(container.createChildContainer).toHaveBeenCalledTimes(2);
		});

		it('should pass different transaction managers to sequential executions', async () => {
			const mockCallback1 = jest.fn().mockResolvedValue('result1');
			const mockCallback2 = jest.fn().mockResolvedValue('result2');

			const mockTransactionManager1 = { id: '1' };
			const mockTransactionManager2 = { id: '2' };

			let callCount = 0;
			mockAppDataSource.manager.transaction = jest.fn(async (cb) => {
				callCount++;
				if (callCount === 1) {
					return cb(mockTransactionManager1);
				} else {
					return cb(mockTransactionManager2);
				}
			});

			await transactionService.execute(mockCallback1);
			await transactionService.execute(mockCallback2);

			expect(mockAppDataSource.manager.transaction).toHaveBeenCalledTimes(2);
		});

		it('should handle callback that returns undefined', async () => {
			const mockCallback = jest.fn().mockResolvedValue(undefined);

			mockAppDataSource.manager.transaction = jest.fn().mockImplementation(async (cb) => {
				return cb(mockTransactionManager);
			});

			const result = await transactionService.execute(mockCallback);

			expect(result).toBeUndefined();
			expect(mockCallback).toHaveBeenCalled();
		});

		it('should handle callback that returns null', async () => {
			const mockCallback = jest.fn().mockResolvedValue(null);

			mockAppDataSource.manager.transaction = jest.fn().mockImplementation(async (cb) => {
				return cb(mockTransactionManager);
			});

			const result = await transactionService.execute(mockCallback);

			expect(result).toBeNull();
			expect(mockCallback).toHaveBeenCalled();
		});

		it('should handle complex return types from callback', async () => {
			const complexResult = {
				user: { id: '123', name: 'Test' },
				status: 'success',
				metadata: { timestamp: new Date(), count: 5 },
			};
			const mockCallback = jest.fn().mockResolvedValue(complexResult);

			mockAppDataSource.manager.transaction = jest.fn().mockImplementation(async (cb) => {
				return cb(mockTransactionManager);
			});

			const result = (await transactionService.execute(mockCallback)) as typeof complexResult;

			expect(result).toEqual(complexResult);
			expect(result.user.id).toBe('123');
			expect(result.status).toBe('success');
		});

		it('should ensure repositories are instantiated within transaction context', async () => {
			const callOrder: string[] = [];

			mockAppDataSource.manager.transaction = jest.fn().mockImplementation(async (cb) => {
				callOrder.push('transaction-start');
				const result = cb(mockTransactionManager);
				callOrder.push('transaction-end');
				return result;
			});

			mockChildContainer.registerInstance = jest.fn(() => {
				callOrder.push('register-instance');
				return mockChildContainer;
			});

			mockChildContainer.resolve = jest.fn(() => {
				callOrder.push('resolve');
				return mockAuthRepository;
			});

			const mockCallback = jest.fn(async () => {
				callOrder.push('callback-execution');
			});

			await transactionService.execute(mockCallback);

			expect(callOrder).toContain('transaction-start');
			expect(callOrder.indexOf('register-instance')).toBeLessThan(
				callOrder.indexOf('callback-execution'),
			);
		});
	});
});
