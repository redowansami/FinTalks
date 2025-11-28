import { MigrationInterface, QueryRunner } from 'typeorm';

export class EnablePgTrgm1732800000000 implements MigrationInterface {
	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS pg_trgm;`);

		await queryRunner.query(
			`CREATE INDEX IF NOT EXISTS idx_users_name_trgm ON users USING GIN (name gin_trgm_ops);`,
		);
		await queryRunner.query(
			`CREATE INDEX IF NOT EXISTS idx_users_email_trgm ON users USING GIN (email gin_trgm_ops);`,
		);
		await queryRunner.query(
			`CREATE INDEX IF NOT EXISTS idx_stories_title_trgm ON stories USING GIN (title gin_trgm_ops);`,
		);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`DROP INDEX IF EXISTS idx_stories_title_trgm;`);
		await queryRunner.query(`DROP INDEX IF EXISTS idx_users_email_trgm;`);
		await queryRunner.query(`DROP INDEX IF EXISTS idx_users_name_trgm;`);
	}
}
