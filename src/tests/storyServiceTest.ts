import { StoryService } from '../services/storyService';
import { StoryRepository } from '../repositories/storyRepository';
import { CategoryService } from '../services/categoryService';
import { notFoundCreator, conflictCreator } from '../errors/errorFactory';
import { HTTP_MESSAGES } from '../constants/httpConstants';
import { Story } from '../entities/storyEntity';
import { Category } from '../entities/categoryEntity';
import { CreateStoryDTO, UpdateStoryDTO, StoryResponseDTO, StoryQueryDTO } from '../dtos/storyDTO';
import { transformToDTO } from '../utils/mapper';
import { getPaginatedResults } from '../utils/cursorPaginationHelper';
import summarizerService from '../services/summarizerService';
import { User } from 'entities/userEntity';

jest.mock('../repositories/storyRepository');
jest.mock('../services/categoryService');
jest.mock('../utils/mapper');
jest.mock('../utils/cursorPaginationHelper');
jest.mock('../services/summarizerService');
jest.mock('../errors/errorFactory', () => ({
	notFoundCreator: { create: jest.fn() },
	conflictCreator: { create: jest.fn() },
}));

describe('StoryService', () => {
	let storyService: StoryService;
	let mockStoryRepository: jest.Mocked<StoryRepository>;
	let mockCategoryService: jest.Mocked<CategoryService>;

	const mockCategory: Category = {
		categoryId: 'cat-123',
		name: 'Finance',
		description: 'Finance related stories',
		stories: [],
	};

	const mockCategory2: Category = {
		categoryId: 'cat-456',
		name: 'Investment',
		description: 'Investment strategies',
		stories: [],
	};

	const mockStory: Story = {
		storyId: 'story-123',
		userId: 'user-123',
		title: 'Market Analysis 2024',
		body: 'Detailed market analysis content',
		createdAt: new Date('2024-01-01'),
		updatedAt: new Date('2024-01-01'),
		deletedAt: null,
		summary: 'AI generated summary',
		reliabilityScore: 82,
		predictionComparison: 'Market predictions were 90% accurate',
		summaryUpdatedAt: new Date('2024-01-01'),
		userByUserId: {} as User,
		categories: [mockCategory],
	};

	const mockStoryResponseDTO: StoryResponseDTO = {
		storyId: 'story-123',
		userId: 'user-123',
		title: 'Market Analysis 2024',
		body: 'Detailed market analysis content',
		createdAt: new Date('2024-01-01'),
		updatedAt: new Date('2024-01-01'),
		summary: 'AI generated summary',
		reliabilityScore: 82,
		predictionComparison: 'Market predictions were 90% accurate',
		summaryUpdatedAt: new Date('2024-01-01'),
		categories: [
			{
				categoryId: 'cat-123',
				name: 'Finance',
				description: 'Finance related stories',
			},
		],
	};

	const summarizerResponse = {
		summary: 'AI generated summary',
		reliabilityScore: 82,
		comparison: 'Market predictions were 90% accurate',
	};

	beforeEach(() => {
		jest.clearAllMocks();

		mockStoryRepository = {
			create: jest.fn(),
			findAll: jest.fn(),
			findById: jest.fn(),
			update: jest.fn(),
			softDelete: jest.fn(),
			save: jest.fn(),
		} as unknown as jest.Mocked<StoryRepository>;

		mockCategoryService = {
			getCategoriesByIds: jest.fn(),
		} as unknown as jest.Mocked<CategoryService>;

		storyService = new StoryService(mockStoryRepository, mockCategoryService);

		(conflictCreator.create as jest.Mock).mockImplementation((msg: string) => new Error(msg));
		(notFoundCreator.create as jest.Mock).mockImplementation((msg: string) => new Error(msg));

		(transformToDTO as jest.Mock).mockReturnValue(mockStoryResponseDTO);
	});

	describe('createStory', () => {
		it('should successfully create a story with categories and summary', async () => {
			const createStoryData: CreateStoryDTO = {
				title: 'Market Analysis 2024',
				body: 'Detailed market analysis content',
				categoryIds: ['cat-123'],
			};

			const storyEntity: Story = {
				...mockStory,
				summary: null,
				reliabilityScore: null,
				predictionComparison: null,
				summaryUpdatedAt: null,
			};

			(summarizerService.generateStorySummary as jest.Mock).mockResolvedValueOnce(
				summarizerResponse,
			);
			(mockStoryRepository.create as jest.Mock).mockResolvedValueOnce(storyEntity);
			(mockCategoryService.getCategoriesByIds as jest.Mock).mockResolvedValueOnce([
				mockCategory,
			]);
			(mockStoryRepository.save as jest.Mock).mockResolvedValueOnce(mockStory);
			(transformToDTO as jest.Mock).mockReturnValueOnce(mockStoryResponseDTO);

			const result: StoryResponseDTO = await storyService.createStory(createStoryData);

			expect(summarizerService.generateStorySummary).toHaveBeenCalledWith(
				'Detailed market analysis content',
			);
			expect(mockStoryRepository.create).toHaveBeenCalledWith(createStoryData);
			expect(mockCategoryService.getCategoriesByIds).toHaveBeenCalledWith(['cat-123']);
			expect(mockStoryRepository.save).toHaveBeenCalled();
			expect(transformToDTO).toHaveBeenCalledWith(
				StoryResponseDTO,
				expect.objectContaining({
					storyId: 'story-123',
					userId: 'user-123',
					title: 'Market Analysis 2024',
					body: 'Detailed market analysis content',
					summary: 'AI generated summary',
					reliabilityScore: 82,
					predictionComparison: 'Market predictions were 90% accurate',
				}),
			);
			expect(result).toEqual(mockStoryResponseDTO);
		});

		it('should create story without categories', async () => {
			const createStoryData: CreateStoryDTO = {
				title: 'Market Analysis 2024',
				body: 'Detailed market analysis content',
			};

			const storyEntity: Story = {
				...mockStory,
				summary: null,
				reliabilityScore: null,
				categories: [],
			};

			(summarizerService.generateStorySummary as jest.Mock).mockResolvedValueOnce(
				summarizerResponse,
			);
			(mockStoryRepository.create as jest.Mock).mockResolvedValueOnce(storyEntity);
			(mockStoryRepository.save as jest.Mock).mockResolvedValueOnce(mockStory);
			(transformToDTO as jest.Mock).mockReturnValueOnce(mockStoryResponseDTO);

			const result: StoryResponseDTO = await storyService.createStory(createStoryData);

			expect(mockCategoryService.getCategoriesByIds).not.toHaveBeenCalled();
			expect(result).toBeDefined();
			expect(result.storyId).toBe('story-123');
		});

		it('should throw ConflictError when invalid category ids are provided', async () => {
			const createStoryData: CreateStoryDTO = {
				title: 'New Story',
				body: 'Story body',
				categoryIds: ['cat-123', 'cat-invalid'],
			};

			const storyEntity: Story = {
				...mockStory,
				summary: null,
				reliabilityScore: null,
			};

			(summarizerService.generateStorySummary as jest.Mock).mockResolvedValueOnce(
				summarizerResponse,
			);
			(mockStoryRepository.create as jest.Mock).mockResolvedValueOnce(storyEntity);
			(mockCategoryService.getCategoriesByIds as jest.Mock).mockResolvedValueOnce([
				mockCategory,
			]);

			const mockError = new Error(HTTP_MESSAGES.INVALID_CATEGORIES);
			(conflictCreator.create as jest.Mock).mockReturnValueOnce(mockError);

			await expect(storyService.createStory(createStoryData)).rejects.toThrow(
				HTTP_MESSAGES.INVALID_CATEGORIES,
			);

			expect(conflictCreator.create).toHaveBeenCalledWith(HTTP_MESSAGES.INVALID_CATEGORIES);
		});

		it('should attach summary data correctly to story', async () => {
			const createStoryData: CreateStoryDTO = {
				title: 'Market Analysis 2024',
				body: 'Detailed market analysis content',
			};

			const storyEntity: Story = {
				...mockStory,
				summary: null,
				reliabilityScore: null,
				predictionComparison: null,
				summaryUpdatedAt: null,
			};

			(summarizerService.generateStorySummary as jest.Mock).mockResolvedValueOnce(
				summarizerResponse,
			);
			(mockStoryRepository.create as jest.Mock).mockResolvedValueOnce(storyEntity);

			const savedStory: Story = {
				...storyEntity,
				summary: summarizerResponse.summary,
				reliabilityScore: summarizerResponse.reliabilityScore,
				predictionComparison: summarizerResponse.comparison,
				summaryUpdatedAt: expect.any(Date),
			};

			(mockStoryRepository.save as jest.Mock).mockResolvedValueOnce(savedStory);
			(transformToDTO as jest.Mock).mockReturnValueOnce(mockStoryResponseDTO);

			await storyService.createStory(createStoryData);
			const saveCall = (mockStoryRepository.save as jest.Mock).mock.calls[0][0];
			expect(saveCall.summary).toBe(summarizerResponse.summary);
			expect(saveCall.reliabilityScore).toBe(summarizerResponse.reliabilityScore);
			expect(saveCall.predictionComparison).toBe(summarizerResponse.comparison);
		});

		it('should handle empty categoryIds array and return early from attachCategories', async () => {
			const createStoryData: CreateStoryDTO = {
				title: 'Market Analysis',
				body: 'Analysis content',
				categoryIds: [],
			};

			const storyEntity: Story = {
				...mockStory,
				summary: null,
				reliabilityScore: null,
				predictionComparison: null,
				summaryUpdatedAt: null,
				categories: [],
			};

			(summarizerService.generateStorySummary as jest.Mock).mockResolvedValueOnce(
				summarizerResponse,
			);
			(mockStoryRepository.create as jest.Mock).mockResolvedValueOnce(storyEntity);

			const savedStory: Story = {
				...storyEntity,
				summary: summarizerResponse.summary,
				reliabilityScore: summarizerResponse.reliabilityScore,
				predictionComparison: summarizerResponse.comparison,
				summaryUpdatedAt: expect.any(Date),
			};

			(mockStoryRepository.save as jest.Mock).mockResolvedValueOnce(savedStory);
			(transformToDTO as jest.Mock).mockReturnValueOnce(mockStoryResponseDTO);

			const result: StoryResponseDTO = await storyService.createStory(createStoryData);

			expect(mockCategoryService.getCategoriesByIds).not.toHaveBeenCalled();
			expect(mockStoryRepository.save).toHaveBeenCalledTimes(1);
			expect(result).toBeDefined();
		});
	});

	describe('findAllStories', () => {
		it('should retrieve paginated stories', async () => {
			const queryParams: StoryQueryDTO = {
				limit: 10,
				startAfter: null as any,
			};

			const paginatedResult = {
				list: [mockStoryResponseDTO],
				nextCursor: 'next-cursor-123',
			};

			(getPaginatedResults as jest.Mock).mockResolvedValueOnce(paginatedResult);

			const result = await storyService.findAllStories(queryParams);

			expect(getPaginatedResults).toHaveBeenCalledWith(
				queryParams,
				expect.any(Function),
				StoryResponseDTO,
				'storyId',
			);
			expect(result).toEqual(paginatedResult);
			expect(result.list).toHaveLength(1);
			expect(result.nextCursor).toBe('next-cursor-123');
		});

		it('should pass correct parameters to getPaginatedResults', async () => {
			const queryParams: StoryQueryDTO = {
				limit: 20,
				startAfter: 'cursor-456',
				search: 'finance',
			};

			const paginatedResult = {
				list: [],
				nextCursor: null,
			};

			(getPaginatedResults as jest.Mock).mockResolvedValueOnce(paginatedResult);

			await storyService.findAllStories(queryParams);

			expect(getPaginatedResults).toHaveBeenCalledWith(
				queryParams,
				expect.any(Function),
				StoryResponseDTO,
				'storyId',
			);
		});

		it('should handle empty result set', async () => {
			const queryParams: StoryQueryDTO = {
				limit: 10,
				startAfter: null as any,
			};

			const paginatedResult = {
				list: [],
				nextCursor: null,
			};

			(getPaginatedResults as jest.Mock).mockResolvedValueOnce(paginatedResult);

			const result = await storyService.findAllStories(queryParams);

			expect(result.list).toHaveLength(0);
			expect(result.nextCursor).toBeNull();
		});

		it('should execute callback function with correct parameters', async () => {
			const queryParams: StoryQueryDTO = {
				limit: 10,
				startAfter: null as any,
			};

			let callbackFunction: ((params: StoryQueryDTO) => Promise<Story[]>) | undefined;
			(getPaginatedResults as jest.Mock).mockImplementation((params, callback) => {
				callbackFunction = callback;
				return Promise.resolve({ list: [], nextCursor: null });
			});

			(mockStoryRepository.findAll as jest.Mock).mockResolvedValueOnce([mockStory]);

			await storyService.findAllStories(queryParams);

			expect(callbackFunction).toBeDefined();
			const result = await callbackFunction!(queryParams);
			expect(mockStoryRepository.findAll).toHaveBeenCalledWith(queryParams);
			expect(result).toEqual([mockStory]);
		});
	});

	describe('getStoryById', () => {
		it('should retrieve story by id successfully', async () => {
			(mockStoryRepository.findById as jest.Mock).mockResolvedValueOnce(mockStory);
			(transformToDTO as jest.Mock).mockReturnValueOnce(mockStoryResponseDTO);

			const result: StoryResponseDTO = await storyService.getStoryById('story-123');

			expect(mockStoryRepository.findById).toHaveBeenCalledWith('story-123');
			expect(transformToDTO).toHaveBeenCalledWith(StoryResponseDTO, mockStory);
			expect(result).toEqual(mockStoryResponseDTO);
		});

		it('should throw NotFoundError when story does not exist', async () => {
			(mockStoryRepository.findById as jest.Mock).mockResolvedValueOnce(null);

			const mockError = new Error(HTTP_MESSAGES.STORY_NOT_FOUND);
			(notFoundCreator.create as jest.Mock).mockReturnValueOnce(mockError);

			await expect(storyService.getStoryById('non-existent-id')).rejects.toThrow(
				HTTP_MESSAGES.STORY_NOT_FOUND,
			);

			expect(notFoundCreator.create).toHaveBeenCalledWith(HTTP_MESSAGES.STORY_NOT_FOUND);
		});

		it('should call repository with correct story id', async () => {
			(mockStoryRepository.findById as jest.Mock).mockResolvedValueOnce(mockStory);
			(transformToDTO as jest.Mock).mockReturnValueOnce(mockStoryResponseDTO);

			await storyService.getStoryById('story-456');

			expect(mockStoryRepository.findById).toHaveBeenCalledWith('story-456');
			expect(mockStoryRepository.findById).toHaveBeenCalledTimes(1);
		});
	});

	describe('updateStory', () => {
		it('should update story without body change', async () => {
			const updateData: UpdateStoryDTO = {
				title: 'Updated Title',
			};

			const updatedStory: Story = {
				...mockStory,
				title: 'Updated Title',
			};

			(mockStoryRepository.findById as jest.Mock)
				.mockResolvedValueOnce(mockStory)
				.mockResolvedValueOnce(updatedStory);

			(mockStoryRepository.update as jest.Mock).mockResolvedValueOnce(updatedStory);
			(transformToDTO as jest.Mock).mockReturnValueOnce(mockStoryResponseDTO);

			const result: StoryResponseDTO = await storyService.updateStory(
				'story-123',
				updateData,
			);

			expect(mockStoryRepository.update).toHaveBeenCalledWith('story-123', {
				title: 'Updated Title',
			});
			expect(summarizerService.generateStorySummary).not.toHaveBeenCalled();
			expect(result).toEqual(mockStoryResponseDTO);
		});

		it('should regenerate summary when body is updated', async () => {
			const updateData: UpdateStoryDTO = {
				body: 'New story body content updated',
			};

			const updatedStory: Story = {
				...mockStory,
				body: 'New story body content updated',
				summary: summarizerResponse.summary,
				reliabilityScore: summarizerResponse.reliabilityScore,
				predictionComparison: summarizerResponse.comparison,
			};

			(mockStoryRepository.findById as jest.Mock)
				.mockResolvedValueOnce(mockStory)
				.mockResolvedValueOnce(updatedStory);

			(mockStoryRepository.update as jest.Mock).mockResolvedValueOnce(updatedStory);
			(summarizerService.generateStorySummary as jest.Mock).mockResolvedValueOnce(
				summarizerResponse,
			);
			(mockStoryRepository.save as jest.Mock).mockResolvedValueOnce(updatedStory);
			(transformToDTO as jest.Mock).mockReturnValueOnce(mockStoryResponseDTO);

			const result: StoryResponseDTO = await storyService.updateStory(
				'story-123',
				updateData,
			);

			expect(summarizerService.generateStorySummary).toHaveBeenCalledWith(
				'New story body content updated',
			);
			expect(mockStoryRepository.save).toHaveBeenCalled();
			expect(result).toEqual(mockStoryResponseDTO);
		});

		it('should add categories during update', async () => {
			const updateData: UpdateStoryDTO = {
				categoryIds: ['cat-123', 'cat-456'],
			};

			const storyWithNewCategories: Story = {
				...mockStory,
				categories: [mockCategory, mockCategory2],
			};

			(mockStoryRepository.findById as jest.Mock)
				.mockResolvedValueOnce(mockStory)
				.mockResolvedValueOnce(mockStory)
				.mockResolvedValueOnce(storyWithNewCategories);

			(mockStoryRepository.update as jest.Mock).mockResolvedValueOnce(storyWithNewCategories);
			(mockCategoryService.getCategoriesByIds as jest.Mock).mockResolvedValueOnce([
				mockCategory,
				mockCategory2,
			]);
			(mockStoryRepository.save as jest.Mock).mockResolvedValueOnce(storyWithNewCategories);

			const result: StoryResponseDTO = await storyService.updateStory(
				'story-123',
				updateData,
			);

			expect(mockCategoryService.getCategoriesByIds).toHaveBeenCalledWith([
				'cat-123',
				'cat-456',
			]);
			expect(result).toEqual(mockStoryResponseDTO);
		});

		it('should throw NotFoundError when updating non-existent story', async () => {
			const updateData: UpdateStoryDTO = {
				title: 'Updated Title',
			};

			(mockStoryRepository.findById as jest.Mock).mockResolvedValueOnce(null);

			const mockError = new Error(HTTP_MESSAGES.STORY_NOT_FOUND);
			(notFoundCreator.create as jest.Mock).mockReturnValueOnce(mockError);

			await expect(storyService.updateStory('non-existent-id', updateData)).rejects.toThrow(
				HTTP_MESSAGES.STORY_NOT_FOUND,
			);
		});

		it('should throw ConflictError when updating with invalid categories', async () => {
			const updateData: UpdateStoryDTO = {
				categoryIds: ['cat-123', 'cat-invalid'],
			};

			(mockStoryRepository.findById as jest.Mock)
				.mockResolvedValueOnce(mockStory)
				.mockResolvedValueOnce(mockStory);

			(mockStoryRepository.update as jest.Mock).mockResolvedValueOnce(mockStory);
			(mockCategoryService.getCategoriesByIds as jest.Mock).mockResolvedValueOnce([
				mockCategory,
			]);

			const mockError = new Error(HTTP_MESSAGES.INVALID_CATEGORIES);
			(conflictCreator.create as jest.Mock).mockReturnValueOnce(mockError);

			await expect(storyService.updateStory('story-123', updateData)).rejects.toThrow(
				HTTP_MESSAGES.INVALID_CATEGORIES,
			);
		});

		it('should throw NotFoundError when final findById returns null', async () => {
			const updateData: UpdateStoryDTO = {
				title: 'Updated Title',
			};

			(mockStoryRepository.findById as jest.Mock)
				.mockResolvedValueOnce(mockStory)
				.mockResolvedValueOnce(null);

			(mockStoryRepository.update as jest.Mock).mockResolvedValueOnce(mockStory);

			const mockError = new Error(HTTP_MESSAGES.STORY_NOT_FOUND);
			(notFoundCreator.create as jest.Mock).mockReturnValueOnce(mockError);

			await expect(storyService.updateStory('story-123', updateData)).rejects.toThrow(
				HTTP_MESSAGES.STORY_NOT_FOUND,
			);

			expect(mockStoryRepository.update).toHaveBeenCalledWith('story-123', {
				title: 'Updated Title',
			});
		});
	});

	describe('deleteStory', () => {
		it('should soft delete a story successfully', async () => {
			(mockStoryRepository.findById as jest.Mock).mockResolvedValueOnce(mockStory);
			(mockStoryRepository.softDelete as jest.Mock).mockResolvedValueOnce(true);

			await storyService.deleteStory('story-123');

			expect(mockStoryRepository.findById).toHaveBeenCalledWith('story-123');
			expect(mockStoryRepository.softDelete).toHaveBeenCalledWith('story-123');
		});

		it('should throw NotFoundError when deleting non-existent story', async () => {
			(mockStoryRepository.findById as jest.Mock).mockResolvedValueOnce(null);

			const mockError = new Error(HTTP_MESSAGES.STORY_NOT_FOUND);
			(notFoundCreator.create as jest.Mock).mockReturnValueOnce(mockError);

			await expect(storyService.deleteStory('non-existent-id')).rejects.toThrow(
				HTTP_MESSAGES.STORY_NOT_FOUND,
			);

			expect(mockStoryRepository.softDelete).not.toHaveBeenCalled();
		});

		it('should verify story exists before deletion', async () => {
			(mockStoryRepository.findById as jest.Mock).mockResolvedValueOnce(mockStory);
			(mockStoryRepository.softDelete as jest.Mock).mockResolvedValueOnce(true);

			await storyService.deleteStory('story-123');

			expect(mockStoryRepository.findById).toHaveBeenCalledTimes(1);
			expect(mockStoryRepository.softDelete).toHaveBeenCalledTimes(1);
		});
	});

	describe('addCategoriesToStory', () => {
		it('should add categories to story successfully', async () => {
			const storyWithNewCategories: Story = {
				...mockStory,
				categories: [mockCategory, mockCategory2],
			};

			(mockStoryRepository.findById as jest.Mock).mockResolvedValueOnce(mockStory);
			(mockCategoryService.getCategoriesByIds as jest.Mock).mockResolvedValueOnce([
				mockCategory2,
			]);
			(mockStoryRepository.save as jest.Mock).mockResolvedValueOnce(storyWithNewCategories);
			(transformToDTO as jest.Mock).mockReturnValueOnce(mockStoryResponseDTO);

			const result: StoryResponseDTO = await storyService.addCategoriesToStory('story-123', [
				'cat-456',
			]);

			expect(mockCategoryService.getCategoriesByIds).toHaveBeenCalledWith(['cat-456']);
			expect(mockStoryRepository.save).toHaveBeenCalled();
			expect(result).toBeDefined();
		});

		it('should throw NotFoundError when story does not exist', async () => {
			(mockStoryRepository.findById as jest.Mock).mockResolvedValueOnce(null);

			const mockError = new Error(HTTP_MESSAGES.STORY_NOT_FOUND);
			(notFoundCreator.create as jest.Mock).mockReturnValueOnce(mockError);

			await expect(
				storyService.addCategoriesToStory('non-existent-id', ['cat-123']),
			).rejects.toThrow(HTTP_MESSAGES.STORY_NOT_FOUND);

			expect(mockCategoryService.getCategoriesByIds).not.toHaveBeenCalled();
		});

		it('should throw ConflictError when category ids are invalid', async () => {
			(mockStoryRepository.findById as jest.Mock).mockResolvedValueOnce(mockStory);
			(mockCategoryService.getCategoriesByIds as jest.Mock).mockResolvedValueOnce([]);

			const mockError = new Error(HTTP_MESSAGES.INVALID_CATEGORIES);
			(conflictCreator.create as jest.Mock).mockReturnValueOnce(mockError);

			await expect(
				storyService.addCategoriesToStory('story-123', ['cat-invalid']),
			).rejects.toThrow(HTTP_MESSAGES.INVALID_CATEGORIES);

			expect(mockStoryRepository.save).not.toHaveBeenCalled();
		});

		it('should merge categories instead of replacing', async () => {
			const storyWithExistingCategory: Story = {
				...mockStory,
				categories: [mockCategory],
			};

			const storyWithBothCategories: Story = {
				...mockStory,
				categories: [mockCategory, mockCategory2],
			};

			(mockStoryRepository.findById as jest.Mock).mockResolvedValueOnce(
				storyWithExistingCategory,
			);
			(mockCategoryService.getCategoriesByIds as jest.Mock).mockResolvedValueOnce([
				mockCategory2,
			]);
			(mockStoryRepository.save as jest.Mock).mockResolvedValueOnce(storyWithBothCategories);
			(transformToDTO as jest.Mock).mockReturnValueOnce(mockStoryResponseDTO);

			await storyService.addCategoriesToStory('story-123', ['cat-456']);

			const savedStory: Story = (mockStoryRepository.save as jest.Mock).mock.calls[0][0];
			expect(savedStory.categories).toHaveLength(2);
			expect(savedStory.categories[0].categoryId).toBe('cat-123');
			expect(savedStory.categories[1].categoryId).toBe('cat-456');
		});

		it('should handle null categories with || operator when adding categories', async () => {
			const storyWithNullCategories: Story = {
				...mockStory,
				categories: null as any,
			};

			const storyWithNewCategories: Story = {
				...mockStory,
				categories: [mockCategory2],
			};

			(mockStoryRepository.findById as jest.Mock).mockResolvedValueOnce(
				storyWithNullCategories,
			);
			(mockCategoryService.getCategoriesByIds as jest.Mock).mockResolvedValueOnce([
				mockCategory2,
			]);
			(mockStoryRepository.save as jest.Mock).mockResolvedValueOnce(storyWithNewCategories);
			(transformToDTO as jest.Mock).mockReturnValueOnce(mockStoryResponseDTO);

			const result: StoryResponseDTO = await storyService.addCategoriesToStory('story-123', [
				'cat-456',
			]);

			const savedStory: Story = (mockStoryRepository.save as jest.Mock).mock.calls[0][0];
			expect(savedStory.categories).toHaveLength(1);
			expect(savedStory.categories[0].categoryId).toBe('cat-456');
			expect(result).toBeDefined();
		});
	});

	describe('removeCategoryFromStory', () => {
		it('should remove category from story successfully', async () => {
			const storyWithoutCategory: Story = {
				...mockStory,
				categories: [],
			};

			(mockStoryRepository.findById as jest.Mock).mockResolvedValueOnce(mockStory);
			(mockStoryRepository.save as jest.Mock).mockResolvedValueOnce(storyWithoutCategory);
			(transformToDTO as jest.Mock).mockReturnValueOnce(mockStoryResponseDTO);

			const result: StoryResponseDTO = await storyService.removeCategoryFromStory(
				'story-123',
				'cat-123',
			);

			expect(mockStoryRepository.save).toHaveBeenCalled();
			expect(result).toBeDefined();
		});

		it('should throw NotFoundError when story does not exist', async () => {
			(mockStoryRepository.findById as jest.Mock).mockResolvedValueOnce(null);

			const mockError = new Error(HTTP_MESSAGES.STORY_NOT_FOUND);
			(notFoundCreator.create as jest.Mock).mockReturnValueOnce(mockError);

			await expect(
				storyService.removeCategoryFromStory('non-existent-id', 'cat-123'),
			).rejects.toThrow(HTTP_MESSAGES.STORY_NOT_FOUND);

			expect(mockStoryRepository.save).not.toHaveBeenCalled();
		});

		it('should only remove specified category', async () => {
			const storyWithMultipleCategories: Story = {
				...mockStory,
				categories: [mockCategory, mockCategory2],
			};

			const storyAfterRemoval: Story = {
				...mockStory,
				categories: [mockCategory2],
			};

			(mockStoryRepository.findById as jest.Mock).mockResolvedValueOnce(
				storyWithMultipleCategories,
			);
			(mockStoryRepository.save as jest.Mock).mockResolvedValueOnce(storyAfterRemoval);
			(transformToDTO as jest.Mock).mockReturnValueOnce(mockStoryResponseDTO);

			await storyService.removeCategoryFromStory('story-123', 'cat-123');

			const savedStory: Story = (mockStoryRepository.save as jest.Mock).mock.calls[0][0];
			expect(savedStory.categories).toHaveLength(1);
			expect(savedStory.categories[0].categoryId).toBe('cat-456');
		});

		it('should handle removing category when story has no categories', async () => {
			const storyWithoutCategories: Story = {
				...mockStory,
				categories: [],
			};

			(mockStoryRepository.findById as jest.Mock).mockResolvedValueOnce(
				storyWithoutCategories,
			);
			(mockStoryRepository.save as jest.Mock).mockResolvedValueOnce(storyWithoutCategories);
			(transformToDTO as jest.Mock).mockReturnValueOnce(mockStoryResponseDTO);

			const result: StoryResponseDTO = await storyService.removeCategoryFromStory(
				'story-123',
				'cat-nonexistent',
			);

			expect(mockStoryRepository.save).toHaveBeenCalled();
			expect(result).toBeDefined();
		});

		it('should not affect other categories when removing one', async () => {
			const storyWithMultipleCategories: Story = {
				...mockStory,
				categories: [mockCategory, mockCategory2],
			};

			(mockStoryRepository.findById as jest.Mock).mockResolvedValueOnce(
				storyWithMultipleCategories,
			);
			(mockStoryRepository.save as jest.Mock).mockResolvedValueOnce(
				storyWithMultipleCategories,
			);
			(transformToDTO as jest.Mock).mockReturnValueOnce(mockStoryResponseDTO);

			await storyService.removeCategoryFromStory('story-123', 'cat-123');

			const savedStory: Story = (mockStoryRepository.save as jest.Mock).mock.calls[0][0];
			const remainingCategory = savedStory.categories[0];
			expect(remainingCategory.name).toBe('Investment');
			expect(remainingCategory.description).toBe('Investment strategies');
		});

		it('should handle null categories with || operator when removing category', async () => {
			const storyWithNullCategories: Story = {
				...mockStory,
				categories: null as any,
			};

			(mockStoryRepository.findById as jest.Mock).mockResolvedValueOnce(
				storyWithNullCategories,
			);
			(mockStoryRepository.save as jest.Mock).mockResolvedValueOnce(storyWithNullCategories);
			(transformToDTO as jest.Mock).mockReturnValueOnce(mockStoryResponseDTO);

			const result: StoryResponseDTO = await storyService.removeCategoryFromStory(
				'story-123',
				'cat-123',
			);

			const savedStory: Story = (mockStoryRepository.save as jest.Mock).mock.calls[0][0];
			expect(savedStory.categories).toHaveLength(0);
			expect(result).toBeDefined();
		});
	});
});
