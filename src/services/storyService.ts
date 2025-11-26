import { Story } from '../entities/storyEntity';
import { StoryRepository } from '../repositories/storyRepository';
import { NotFoundError } from '../errors/customErrors';
import { CreateStoryDTO, UpdateStoryDTO, StoryResponseDTO } from '../dtos/storyDTO';
import { HTTP_MESSAGES } from '../constants/httpConstants';

export class StoryService {
	constructor(private readonly storyRepository: StoryRepository) {}

	async createStory(data: CreateStoryDTO): Promise<StoryResponseDTO> {
		const story = await this.storyRepository.create(data);
		return this.mapToResponseDTO(story);
	}

	async getAllStories(): Promise<StoryResponseDTO[]> {
		const stories: Story[] = await this.storyRepository.findAll();
		return stories.map((story) => this.mapToResponseDTO(story));
	}

	async getStoryById(id: string): Promise<StoryResponseDTO> {
		const story: Story | null = await this.storyRepository.findById(id);
		if (!story) {
			throw new NotFoundError(HTTP_MESSAGES.STORY_NOT_FOUND);
		}
		return this.mapToResponseDTO(story);
	}

	async updateStory(id: string, updatedData: UpdateStoryDTO): Promise<void> {
		await this.getStoryById(id);
		await this.storyRepository.update(id, updatedData);
	}

	async deleteStory(id: string): Promise<void> {
		await this.getStoryById(id);
		await this.storyRepository.softDelete(id);
	}

	private mapToResponseDTO(story: Story): StoryResponseDTO {
		return {
			storyId: story.storyId,
			userId: story.userId,
			title: story.title,
			body: story.body,
			createdAt: story.createdAt,
			updatedAt: story.updatedAt,
		};
	}
}
