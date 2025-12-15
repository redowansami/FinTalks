import { StoryController } from '../controllers/storyController';
import { StoryService } from '../services/storyService';
import { HTTP_STATUS, HTTP_MESSAGES } from '../constants/httpConstants';
import { Request, Response } from 'express';

jest.mock('../services/storyService');

describe('StoryController', () => {
	let storyController: StoryController;
	let mockStoryService: jest.Mocked<StoryService>;
	let mockReq: Partial<Request & { user?: any; validatedReq?: any }>;
	let mockRes: Partial<Response>;

	beforeEach(() => {
		jest.clearAllMocks();

		mockStoryService = {
			createStory: jest.fn(),
			findAllStories: jest.fn(),
			getStoryById: jest.fn(),
			updateStory: jest.fn(),
			deleteStory: jest.fn(),
			addCategoriesToStory: jest.fn(),
			removeCategoryFromStory: jest.fn(),
		} as unknown as jest.Mocked<StoryService>;

		storyController = new StoryController(mockStoryService);

		mockReq = {
			body: {},
			params: {},
			user: undefined,
			validatedReq: {},
		};

		mockRes = {
			status: jest.fn().mockReturnThis(),
			json: jest.fn().mockReturnThis(),
			sendStatus: jest.fn(),
		};
	});

	describe('create', () => {
		it('should create a story and return 201 status', async () => {
			const mockStoryData = {
				title: 'My First Story',
				body: 'This is the story content',
				categoryIds: ['cat-1', 'cat-2'],
			};

			const mockUser = {
				userId: 'user-123',
			};

			const mockStoryResponse = {
				storyId: 'story-123',
				userId: 'user-123',
				title: 'My First Story',
				body: 'This is the story content',
				createdAt: new Date(),
				updatedAt: new Date(),
				categories: [],
			};

			mockReq.body = mockStoryData;
			mockReq.user = mockUser;
			mockStoryService.createStory.mockResolvedValue(mockStoryResponse as any);

			await storyController.create(mockReq as any, mockRes as Response);

			expect(mockStoryService.createStory).toHaveBeenCalledWith({
				...mockStoryData,
				userId: 'user-123',
			});
			expect(mockRes.status).toHaveBeenCalledWith(HTTP_STATUS.CREATED);
			expect(mockRes.json).toHaveBeenCalledWith({
				success: true,
				message: HTTP_MESSAGES.STORY_CREATED,
				story: mockStoryResponse,
			});
		});
	});

	describe('findAll', () => {
		it('should return all stories with pagination', async () => {
			const mockQueryParams = {
				cursor: null,
				limit: 10,
			};

			const mockStories = [
				{
					storyId: 'story-1',
					userId: 'user-1',
					title: 'Story 1',
					body: 'Body 1',
					createdAt: new Date(),
					updatedAt: new Date(),
				},
				{
					storyId: 'story-2',
					userId: 'user-2',
					title: 'Story 2',
					body: 'Body 2',
					createdAt: new Date(),
					updatedAt: new Date(),
				},
			];

			const mockResponse = {
				list: mockStories,
				nextCursor: 'next-cursor-123',
			};

			mockReq.validatedReq = { query: mockQueryParams };
			mockStoryService.findAllStories.mockResolvedValue(mockResponse as any);

			await storyController.findAll(mockReq as Request, mockRes as Response);

			expect(mockStoryService.findAllStories).toHaveBeenCalledWith(mockQueryParams);
			expect(mockRes.status).toHaveBeenCalledWith(HTTP_STATUS.OK);
			expect(mockRes.json).toHaveBeenCalledWith({
				success: true,
				list: mockStories,
				nextCursor: 'next-cursor-123',
			});
		});

		it('should handle empty story list', async () => {
			const mockQueryParams = {
				cursor: null,
				limit: 10,
			};

			const mockResponse = {
				list: [],
				nextCursor: null,
			};

			mockReq.validatedReq = { query: mockQueryParams };
			mockStoryService.findAllStories.mockResolvedValue(mockResponse as any);

			await storyController.findAll(mockReq as Request, mockRes as Response);

			expect(mockRes.json).toHaveBeenCalledWith({
				success: true,
				list: [],
				nextCursor: null,
			});
		});
	});

	describe('findOne', () => {
		it('should return a story by id', async () => {
			const storyId = 'story-123';
			const mockStory = {
				storyId,
				userId: 'user-123',
				title: 'My Story',
				body: 'Story content',
				createdAt: new Date(),
				updatedAt: new Date(),
				summary: 'Summary of the story',
				categories: [],
			};

			mockReq.params = { storyId };
			mockStoryService.getStoryById.mockResolvedValue(mockStory as any);

			await storyController.findOne(mockReq as Request, mockRes as Response);

			expect(mockStoryService.getStoryById).toHaveBeenCalledWith(storyId);
			expect(mockRes.status).toHaveBeenCalledWith(HTTP_STATUS.OK);
			expect(mockRes.json).toHaveBeenCalledWith({
				success: true,
				story: mockStory,
			});
		});
	});

	describe('update', () => {
		it('should update a story and return updated data', async () => {
			const storyId = 'story-123';
			const updateData = {
				title: 'Updated Title',
				body: 'Updated body content',
			};

			const mockUpdatedStory = {
				storyId,
				userId: 'user-123',
				title: 'Updated Title',
				body: 'Updated body content',
				createdAt: new Date(),
				updatedAt: new Date(),
				categories: [],
			};

			mockReq.params = { storyId };
			mockReq.body = updateData;
			mockStoryService.updateStory.mockResolvedValue(mockUpdatedStory as any);

			await storyController.update(mockReq as Request, mockRes as Response);

			expect(mockStoryService.updateStory).toHaveBeenCalledWith(storyId, updateData);
			expect(mockRes.status).toHaveBeenCalledWith(HTTP_STATUS.OK);
			expect(mockRes.json).toHaveBeenCalledWith({
				success: true,
				message: HTTP_MESSAGES.STORY_UPDATED,
				story: mockUpdatedStory,
			});
		});
	});

	describe('delete', () => {
		it('should delete a story and return 204 status', async () => {
			const storyId = 'story-123';

			mockReq.params = { storyId };
			mockStoryService.deleteStory.mockResolvedValue(undefined);

			await storyController.delete(mockReq as Request, mockRes as Response);

			expect(mockStoryService.deleteStory).toHaveBeenCalledWith(storyId);
			expect(mockRes.sendStatus).toHaveBeenCalledWith(HTTP_STATUS.NO_CONTENT);
		});
	});

	describe('removeCategoryFromStory', () => {
		it('should remove a category from a story and return 204 status', async () => {
			const storyId = 'story-123';
			const categoryId = 'category-456';

			mockReq.params = { storyId, categoryId };
			mockStoryService.removeCategoryFromStory.mockResolvedValue(undefined as any);

			await storyController.removeCategoryFromStory(mockReq as Request, mockRes as Response);

			expect(mockStoryService.removeCategoryFromStory).toHaveBeenCalledWith(
				storyId,
				categoryId,
			);
			expect(mockRes.sendStatus).toHaveBeenCalledWith(HTTP_STATUS.NO_CONTENT);
		});
	});
});
