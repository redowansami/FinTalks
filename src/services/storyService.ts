import { Story } from '../entities/storyEntity';
import { StoryRepository } from '../repositories/storyRepository';
import { ErrorFactory } from '../errors/errorFactory';
import { CreateStoryDTO, UpdateStoryDTO, StoryResponseDTO } from '../dtos/storyDTO';
import { HTTP_MESSAGES } from '../constants/httpConstants';
import { transformToDTO } from '../utils/mapper';
import { CursorEncoder } from '../utils/cursorEncoder';

export class StoryService {
	constructor(private readonly storyRepository: StoryRepository) {}

	createStory = async (data: CreateStoryDTO): Promise<StoryResponseDTO> => {
		const story = await this.storyRepository.create(data);
		return transformToDTO(StoryResponseDTO, story);
	};

	getAllStories = async (): Promise<StoryResponseDTO[]> => {
		const stories: Story[] = await this.storyRepository.findAll();
		return stories.map((story) => transformToDTO(StoryResponseDTO, story));
	};

	getAllStoriesPaginated = async (
		startAfter: string | undefined,
		limit: number,
	): Promise<{ items: StoryResponseDTO[]; nextCursor: string | null }> => {
		const decodedCursor = startAfter ? CursorEncoder.decode(startAfter) : undefined;
		const stories = await this.storyRepository.findPaginated(decodedCursor, limit + 1);
		const hasMore = stories.length > limit;
		const items = stories
			.slice(0, limit)
			.map((story) => transformToDTO(StoryResponseDTO, story));
		const nextCursor = hasMore ? CursorEncoder.encode(items[items.length - 1].storyId) : null;
		return { items, nextCursor };
	};

	getStoryById = async (id: string): Promise<StoryResponseDTO> => {
		const story: Story | null = await this.storyRepository.findById(id);
		if (!story) {
			throw ErrorFactory.notFound(HTTP_MESSAGES.STORY_NOT_FOUND);
		}
		return transformToDTO(StoryResponseDTO, story);
	};

	updateStory = async (id: string, updatedData: UpdateStoryDTO): Promise<void> => {
		await this.getStoryById(id);
		await this.storyRepository.update(id, updatedData);
	};

	deleteStory = async (id: string): Promise<void> => {
		await this.getStoryById(id);
		await this.storyRepository.softDelete(id);
	};
}
