import { StoryRepository } from '../repositories/storyRepository';
import { StoryService } from '../services/storyService';
import { StoryController } from '../controllers/storyController';

const storyRepository = new StoryRepository();
const storyService = new StoryService(storyRepository);
export const storyController = new StoryController(storyService);
