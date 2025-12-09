import { Request, Response } from 'express';
import { StoryService } from '../services/storyService';
import { StoryQueryDTO, UpdateStoryDTO } from '../dtos/storyDTO';
import { HTTP_STATUS, HTTP_MESSAGES } from '../constants/httpConstants';
import { User } from '../entities/userEntity';
import { injectable } from 'tsyringe';

@injectable()
export class StoryController {
	constructor(private readonly storyService: StoryService) {}

	create = async (req: Request & { user?: User }, res: Response): Promise<void> => {
		const userId = req.user?.userId;
		const result = await this.storyService.createStory({ ...req.body, userId });
		res.status(HTTP_STATUS.CREATED).json({
			success: true,
			message: HTTP_MESSAGES.STORY_CREATED,
			story: result,
		});
	};

	findAll = async (req: Request, res: Response): Promise<void> => {
		const result = await this.storyService.findAllStories(
			req.validatedReq.query as StoryQueryDTO,
		);
		res.status(HTTP_STATUS.OK).json({ success: true, ...result });
	};

	findOne = async (req: Request, res: Response): Promise<void> => {
		const storyId = req.params.storyId;
		const story = await this.storyService.getStoryById(storyId);

		res.status(HTTP_STATUS.OK).json({ success: true, story });
	};

	update = async (req: Request, res: Response): Promise<void> => {
		const storyId = req.params.storyId;
		const story = await this.storyService.updateStory(storyId, req.body as UpdateStoryDTO);

		res.status(HTTP_STATUS.OK).json({
			success: true,
			message: HTTP_MESSAGES.STORY_UPDATED,
			story,
		});
	};

	delete = async (req: Request, res: Response): Promise<void> => {
		const storyId = req.params.storyId;
		await this.storyService.deleteStory(storyId);
		res.sendStatus(HTTP_STATUS.NO_CONTENT);
	};

	removeCategoryFromStory = async (req: Request, res: Response): Promise<void> => {
		const storyId = req.params.storyId;
		const categoryId = req.params.categoryId;
		await this.storyService.removeCategoryFromStory(storyId, categoryId);

		res.sendStatus(HTTP_STATUS.NO_CONTENT);
	};
}
