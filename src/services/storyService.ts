import { Story } from '../entities/storyEntity';
import { StoryRepository } from '../repositories/storyRepository';
import { ErrorFactory } from '../errors/errorFactory';
import { CreateStoryDTO, UpdateStoryDTO, StoryResponseDTO, StoryQueryDTO } from '../dtos/storyDTO';
import { HTTP_MESSAGES } from '../constants/httpConstants';
import { transformToDTO } from '../utils/mapper';
import { getPaginatedResults } from '../utils/cursorPaginationHelper';

export class StoryService {
	constructor(private readonly storyRepository: StoryRepository) {}

	createStory = async (data: CreateStoryDTO): Promise<StoryResponseDTO> => {
		const story = await this.storyRepository.create(data);
		return transformToDTO(StoryResponseDTO, story);
	};

	getAllStoriesPaginated = async (
		queryParams: StoryQueryDTO,
	): Promise<{ items: StoryResponseDTO[]; nextCursor: string | null }> => {
		return getPaginatedResults(
			queryParams,
			(params) => this.storyRepository.findPaginated(params),
			StoryResponseDTO,
			'storyId',
		);
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
