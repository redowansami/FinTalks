import { Request, Response } from 'express';
import { StoryService } from '../services/storyService';
import { StoryQueryDTO, UpdateStoryDTO } from '../dtos/storyDTO';
import { HTTP_STATUS, HTTP_MESSAGES } from '../constants/httpConstants';

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
		const queryParams = req.query as unknown as StoryQueryDTO;
		const result = await this.storyService.getAllStoriesPaginated(queryParams);
		res.status(HTTP_STATUS.OK).json({ success: true, ...result });
	};

	findOne = async (req: Request, res: Response): Promise<void> => {
		const { storyId } = req.params;
		const story = await this.storyService.getStoryById(storyId);

		res.status(HTTP_STATUS.OK).json({ success: true, story });
	};

	patchUpdate = async (req: Request, res: Response): Promise<void> => {
		const { storyId } = req.params;
		await this.storyService.updateStory(storyId, req.body as UpdateStoryDTO);

		res.status(HTTP_STATUS.OK).json({ success: true, message: HTTP_MESSAGES.STORY_UPDATED });
	};

	delete = async (req: Request, res: Response): Promise<void> => {
		const { storyId } = req.params;
		await this.storyService.deleteStory(storyId);
		res.sendStatus(HTTP_STATUS.NO_CONTENT);
	};
}
