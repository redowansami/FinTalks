import { Repository } from 'typeorm';
import { AppDataSource } from '../config/dataSource';
import { Story } from '../entities/storyEntity';
import { CreateStoryDTO } from '../dtos/storyDTO';

export class StoryRepository {
	private repository: Repository<Story>;

	constructor() {
		this.repository = AppDataSource.getRepository(Story);
	}

	create = async (data: CreateStoryDTO): Promise<Story> => {
		const story = this.repository.create(data);
		return this.repository.save(story);
	};

	findAll = async (): Promise<Story[]> => {
		return this.repository.find();
	};

	findById = async (id: string): Promise<Story | null> => {
		return this.repository.findOne({ where: { storyId: id } });
	};

	update = async (id: string, story: Partial<Story>): Promise<boolean> => {
		const result = await this.repository.update(id, story);
		return result.affected === 1;
	};

	softDelete = async (id: string): Promise<boolean> => {
		const result = await this.repository.softDelete(id);
		return result.affected === 1;
	};
}
