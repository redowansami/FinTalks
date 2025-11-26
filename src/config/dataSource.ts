import { DataSource } from 'typeorm';
import { User } from '../entities/userEntity';
import { Auth } from '../entities/authEntity';
import { Story } from '../entities/storyEntity';
import dotenv from 'dotenv';

dotenv.config();

export const AppDataSource = new DataSource({
	type: 'postgres',
	host: process.env.DB_HOST,
	port: Number(process.env.DB_PORT),
	username: process.env.DB_USER,
	password: process.env.DB_PASSWORD,
	database: process.env.DB_NAME,
	entities: [User, Auth, Story],
	synchronize: true,
});
