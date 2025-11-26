import { Response } from 'express';
import { StoryService } from '../services/storyService';
import { CreateStoryDTO, UpdateStoryDTO } from '../dtos/storyDTO';
import { HTTP_STATUS, HTTP_MESSAGES } from '../constants/httpConstants';
import { ValidatedRequest } from '../middleware/validationMiddleware';

export class StoryController {
	constructor(private readonly storyService: StoryService) {}

	async create(req: ValidatedRequest, res: Response): Promise<void> {
		const createStory: CreateStoryDTO = req.validated?.body as CreateStoryDTO;
		const result = await this.storyService.createStory(createStory);
		res.status(HTTP_STATUS.CREATED).json({
			success: true,
			message: HTTP_MESSAGES.STORY_CREATED,
			story: result,
		});
	}

	async findAll(req: ValidatedRequest, res: Response): Promise<void> {
		const stories = await this.storyService.getAllStories();
		res.json({ success: true, stories });
	}

	async findOne(req: ValidatedRequest, res: Response): Promise<void> {
		const id = (req.validated?.params as Record<string, string>).storyId;
		const story = await this.storyService.getStoryById(id);

		res.json({ success: true, story });
	}

	async patchUpdate(req: ValidatedRequest, res: Response): Promise<void> {
		const id = (req.validated?.params as Record<string, string>).storyId;
		const updateStory: UpdateStoryDTO = req.validated?.body as UpdateStoryDTO;
		await this.storyService.updateStory(id, updateStory);

		res.json({ success: true, message: HTTP_MESSAGES.STORY_UPDATED });
	}

	async delete(req: ValidatedRequest, res: Response): Promise<void> {
		const id = (req.validated?.params as Record<string, string>).storyId;
		await this.storyService.deleteStory(id);
		res.json({ success: true, message: HTTP_MESSAGES.STORY_DELETED });
	}
}
