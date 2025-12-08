import { AppDataSource } from '../config/dataSource';
import { Category } from '../entities/categoryEntity';

const INITIAL_CATEGORIES = [
	{ name: 'Saving', description: 'Tips and strategies for saving money' },
	{ name: 'Stocks', description: 'Investment in stocks and equity markets' },
	{ name: 'Bonds', description: 'Fixed income securities and bonds' },
	{ name: 'Retirement Planning', description: 'Strategies for retirement savings and planning' },
	{ name: 'Debt Management', description: 'Managing and paying off debt' },
	{
		name: 'Real Estate & Mortgages',
		description: 'Real estate investment and mortgage insights',
	},
	{ name: 'Taxes', description: 'Tax planning and tax management strategies' },
	{ name: 'Others', description: 'Miscellaneous financial topics' },
];

export const seedCategories = async (): Promise<void> => {
	const categoryRepository = AppDataSource.getRepository(Category);

	for (const categoryData of INITIAL_CATEGORIES) {
		const existingCategory = await categoryRepository.findOne({
			where: { name: categoryData.name },
		});

		if (!existingCategory) {
			const category = categoryRepository.create(categoryData);
			await categoryRepository.save(category);
			console.log(`✅ Category "${categoryData.name}" seeded successfully`);
		} else {
			console.log(`⏭️  Category "${categoryData.name}" already exists, skipping...`);
		}
	}
};
