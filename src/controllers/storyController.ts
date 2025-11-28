import { Request, Response } from 'express';
import { StoryService } from '../services/storyService';
import { StoryQueryDTO, UpdateStoryDTO, storyQueryDTO } from '../dtos/storyDTO';
import { HTTP_STATUS, HTTP_MESSAGES } from '../constants/httpConstants';
import { parseWithSchema } from '../utils/mapper';

export class StoryController {
	constructor(private readonly storyService: StoryService) {}

	create = async (req: Request, res: Response): Promise<void> => {
		const result = await this.storyService.createStory(req.body);
		res.status(HTTP_STATUS.CREATED).json({
			success: true,
			message: HTTP_MESSAGES.STORY_CREATED,
			story: result,
		});
	};

	findAll = async (req: Request, res: Response): Promise<void> => {
		const queryParams = parseWithSchema<StoryQueryDTO>(storyQueryDTO, req.query);

		const result = await this.storyService.getAllStoriesPaginated(queryParams);
		res.json({ success: true, ...result });
	};

	findOne = async (req: Request, res: Response): Promise<void> => {
		const { storyId } = req.params;
		const story = await this.storyService.getStoryById(storyId);

		res.json({ success: true, story });
	};

	patchUpdate = async (req: Request, res: Response): Promise<void> => {
		const { storyId } = req.params;
		await this.storyService.updateStory(storyId, req.body as UpdateStoryDTO);

		res.json({ success: true, message: HTTP_MESSAGES.STORY_UPDATED });
	};

	delete = async (req: Request, res: Response): Promise<void> => {
		const { storyId } = req.params;
		await this.storyService.deleteStory(storyId);
		res.json({ success: true, message: HTTP_MESSAGES.STORY_DELETED });
	};
}
