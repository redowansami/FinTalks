import { Repository } from 'typeorm';
import { AppDataSource } from '../config/dataSource';
import { Category } from '../entities/categoryEntity';
import { CreateCategoryDTO, UpdateCategoryDTO } from '../dtos/categoryDTO';
import { injectable } from 'tsyringe';

@injectable()
export class CategoryRepository {
	private repository: Repository<Category>;

	constructor() {
		this.repository = AppDataSource.getRepository(Category);
	}

	create = async (data: CreateCategoryDTO): Promise<Category> => {
		const category = this.repository.create(data);
		return this.repository.save(category);
	};

	findAll = async (): Promise<Category[]> => {
		return this.repository.find({ order: { name: 'ASC' } });
	};

	findById = async (categoryId: string): Promise<Category | null> => {
		return this.repository.findOne({
			where: { categoryId },
			relations: ['stories'],
		});
	};

	findByName = async (name: string): Promise<Category | null> => {
		return this.repository.findOne({
			where: { name },
		});
	};

	update = async (categoryId: string, data: UpdateCategoryDTO): Promise<Category | null> => {
		await this.repository.update({ categoryId }, data);
		return this.findById(categoryId);
	};

	delete = async (categoryId: string): Promise<boolean> => {
		const result = await this.repository.delete({ categoryId });
		return result.affected ? result.affected > 0 : false;
	};

	findByIds = async (categoryIds: string[]): Promise<Category[]> => {
		if (categoryIds.length === 0) return [];
		return this.repository.find({
			where: categoryIds.map((id) => ({ categoryId: id })),
		});
	};
}
