import { Story } from '../entities/storyEntity';
import { StoryRepository } from '../repositories/storyRepository';
import { NotFoundError } from '../errors/customErrors';
import { CreateStoryDTO, UpdateStoryDTO, StoryResponseDTO } from '../dtos/storyDTO';
import { HTTP_MESSAGES } from '../constants/httpConstants';
import { transformToDTO } from '../utils/mapper';

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

	getStoryById = async (id: string): Promise<StoryResponseDTO> => {
		const story: Story | null = await this.storyRepository.findById(id);
		if (!story) {
			throw new NotFoundError(HTTP_MESSAGES.STORY_NOT_FOUND);
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
