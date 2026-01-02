import { Repository } from 'typeorm';
import { AppDataSource } from '../config/dataSource';
import { Story } from '../entities/storyEntity';
import { CreateStoryDTO, StoryQueryDTO } from '../dtos/storyDTO';
import { buildCursorPaginationQuery } from '../utils/cursorPaginationQuery';
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

	findAll = async (queryParams: StoryQueryDTO): Promise<Story[]> => {
		await new Promise((resolve) => setTimeout(resolve, 1000));

		const { search, orderBy, category, startAfter, limit } = queryParams;
		const queryBuilder = this.repository
			.createQueryBuilder('story')
			.leftJoinAndSelect('story.userByUserId', 'user')
			.leftJoinAndSelect('story.categories', 'categories');

		if (search && search.trim()) {
			applyFuzzySearch(queryBuilder, {
				'story.title': search,
				'user.name': search,
			});
		}

		if (category && category.trim()) {
			queryBuilder.innerJoin(
				'story.categories',
				'filterCategories',
				'LOWER(filterCategories.name) LIKE LOWER(:category)',
				{
					category: `%${category}%`,
				},
			);
		}

		const orderByField = orderBy ? `story.${orderBy}` : 'story.createdAt';
		buildCursorPaginationQuery(queryBuilder, 'story.storyId', startAfter, limit, orderByField);

		return queryBuilder.getMany();
	};

	findById = async (id: string): Promise<Story | null> => {
		return this.repository.findOne({
			where: { storyId: id },
			relations: ['categories'],
		});
	};

	update = async (id: string, story: Partial<Story>): Promise<Story | null | undefined> => {
		const result = await this.repository.update(id, story);
		if (result.affected === 1) return this.findById(id);
		else return null;
	};

	softDelete = async (id: string): Promise<boolean> => {
		const result = await this.repository.softDelete(id);
		return result.affected === 1;
	};

	save = async (story: Story): Promise<Story> => {
		return this.repository.save(story);
	};
}
