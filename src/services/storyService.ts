import { Story } from '../entities/storyEntity';
import { StoryRepository } from '../repositories/storyRepository';
import { CategoryService } from './categoryService';
import { conflictCreator, notFoundCreator } from '../errors/errorFactory';
import { CreateStoryDTO, UpdateStoryDTO, StoryResponseDTO, StoryQueryDTO } from '../dtos/storyDTO';
import { HTTP_MESSAGES } from '../constants/httpConstants';
import { transformToDTO } from '../utils/mapper';
import { getPaginatedResults } from '../utils/cursorPaginationHelper';
import { injectable } from 'tsyringe';
import { Category } from 'entities/categoryEntity';
import summarizerService from './summarizerService';

@injectable()
export class StoryService {
	constructor(
		private readonly storyRepository: StoryRepository,
		private readonly categoryService: CategoryService,
	) {}

	private attachCategories = async (story: Story, categoryIds: string[]): Promise<void> => {
		if (categoryIds.length === 0) {
			return;
		}

		const categories = await this.categoryService.getCategoriesByIds(categoryIds);
		if (categories.length !== categoryIds.length) {
			throw conflictCreator.create(HTTP_MESSAGES.INVALID_CATEGORIES);
		}

		story.categories = categories as Category[];
		await this.storyRepository.save(story);
	};

	private saveSummary = async (story: Story, summarizerResponse: any): Promise<void> => {
		story.summary = summarizerResponse.summary;
		story.reliabilityScore = summarizerResponse.reliabilityScore;
		story.predictionComparison = summarizerResponse.comparison;
		story.summaryUpdatedAt = new Date();

		await this.storyRepository.save(story);
	};

	createStory = async (
		data: CreateStoryDTO & { userId: string; username?: string },
	): Promise<StoryResponseDTO> => {
		const summarizerResponse = await summarizerService.generateStorySummary(data.body);

		const story = await this.storyRepository.create(data);

		if (data.categoryIds) {
			await this.attachCategories(story, data.categoryIds);
		}

		await this.saveSummary(story, summarizerResponse);

		return transformToDTO(StoryResponseDTO, story);
	};

	findAllStories = async (
		queryParams: StoryQueryDTO,
	): Promise<{ list: StoryResponseDTO[]; nextCursor: string | null }> => {
		return getPaginatedResults(
			queryParams,
			(params) => this.storyRepository.findAll(params),
			StoryResponseDTO,
			'storyId',
		);
	};

	getStoryById = async (id: string): Promise<StoryResponseDTO> => {
		const story: Story | null = await this.storyRepository.findById(id);
		if (!story) {
			throw notFoundCreator.create(HTTP_MESSAGES.STORY_NOT_FOUND);
		}
		return transformToDTO(StoryResponseDTO, story);
	};

	updateStory = async (id: string, updatedData: UpdateStoryDTO): Promise<StoryResponseDTO> => {
		const existingStory = await this.getStoryById(id);

		const { categoryIds, ...storyData } = updatedData;

		const bodyChanged = storyData.body && storyData.body !== existingStory.body;

		let summarizerResponse = null;
		if (bodyChanged) {
			summarizerResponse = await summarizerService.generateStorySummary(storyData.body!);
		}

		await this.storyRepository.update(id, storyData);

		if (categoryIds) {
			await this.addCategoriesToStory(id, categoryIds);
		}

		const updatedStory = await this.storyRepository.findById(id);
		if (!updatedStory) {
			throw notFoundCreator.create(HTTP_MESSAGES.STORY_NOT_FOUND);
		}

		if (summarizerResponse && bodyChanged) {
			await this.saveSummary(updatedStory, summarizerResponse);
		}

		return transformToDTO(StoryResponseDTO, updatedStory);
	};

	deleteStory = async (id: string): Promise<void> => {
		await this.getStoryById(id);
		await this.storyRepository.softDelete(id);
	};

	addCategoriesToStory = async (
		storyId: string,
		categoryIds: string[],
	): Promise<StoryResponseDTO> => {
		const story = await this.storyRepository.findById(storyId);
		if (!story) {
			throw notFoundCreator.create(HTTP_MESSAGES.STORY_NOT_FOUND);
		}

		const newCategories = await this.categoryService.getCategoriesByIds(categoryIds);
		if (newCategories.length !== categoryIds.length) {
			throw conflictCreator.create(HTTP_MESSAGES.INVALID_CATEGORIES);
		}

		story.categories = [...(story.categories || []), ...(newCategories as Category[])];
		await this.storyRepository.save(story);

		return transformToDTO(StoryResponseDTO, story);
	};

	removeCategoryFromStory = async (
		storyId: string,
		categoryId: string,
	): Promise<StoryResponseDTO> => {
		const story = await this.storyRepository.findById(storyId);
		if (!story) {
			throw notFoundCreator.create(HTTP_MESSAGES.STORY_NOT_FOUND);
		}

		story.categories = (story.categories || []).filter((cat) => cat.categoryId !== categoryId);
		await this.storyRepository.save(story);

		return transformToDTO(StoryResponseDTO, story);
	};
}
