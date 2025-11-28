import { DataSource } from 'typeorm';
import { User } from '../entities/userEntity';
import { Auth } from '../entities/authEntity';
import { Story } from '../entities/storyEntity';
import { env } from '../utils/envParser';

export const AppDataSource = new DataSource({
	type: 'postgres',
	host: env.DB_HOST,
	port: env.DB_PORT,
	username: env.DB_USER,
	password: env.DB_PASSWORD,
	database: env.DB_NAME,
	entities: [User, Auth, Story],
	migrations: ['src/migrations/*.ts'],
	synchronize: false,
});
