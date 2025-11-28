import { Repository } from 'typeorm';
import { AppDataSource } from '../config/dataSource';
import { Story } from '../entities/storyEntity';
import { CreateStoryDTO, StoryQueryDTO } from '../dtos/storyDTO';
import { buildCursorPaginationQuery } from '../utils/paginationQuery';
import { applyFuzzySearch } from '../utils/fuzzySearch';

export class StoryRepository {
	private repository: Repository<Story>;

	constructor() {
		this.repository = AppDataSource.getRepository(Story);
	}

	create = async (data: CreateStoryDTO): Promise<Story> => {
		const story = this.repository.create(data);
		return this.repository.save(story);
	};

	findPaginated = async (queryParams: StoryQueryDTO): Promise<Story[]> => {
		const { search, orderBy, startAfter, limit } = queryParams;
		const queryBuilder = this.repository
			.createQueryBuilder('story')
			.leftJoinAndSelect('story.userByUserId', 'user');

		if (search && search.trim()) {
			applyFuzzySearch(queryBuilder, {
				'story.title': search,
				'user.name': search,
			});
		}

		if (orderBy) {
			queryBuilder.orderBy(`story.${orderBy}`, 'ASC');
		}

		buildCursorPaginationQuery(queryBuilder, 'story.storyId', startAfter, limit);

		return queryBuilder.getMany();
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
