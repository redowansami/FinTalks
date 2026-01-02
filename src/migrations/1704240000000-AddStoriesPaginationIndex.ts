import { MigrationInterface, QueryRunner, TableIndex } from 'typeorm';

export class AddStoriesPaginationIndex1704240000000 implements MigrationInterface {
	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.createIndex(
			'stories',
			new TableIndex({
				name: 'idx_stories_pagination',
				columnNames: ['createdAt', 'storyId'],
				isUnique: false,
			}),
		);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.dropIndex('stories', 'idx_stories_pagination');
	}
}
