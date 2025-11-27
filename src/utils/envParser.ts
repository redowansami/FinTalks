import dotenv from 'dotenv';

dotenv.config();

export const env = {
	PORT: parseInt(process.env.PORT || '3000'),
	DB_HOST: process.env.DB_HOST,
	DB_PORT: parseInt(process.env.DB_PORT || '5432'),
	DB_USER: process.env.DB_USER,
	DB_PASSWORD: process.env.DB_PASSWORD,
	DB_NAME: process.env.DB_NAME,
	NODE_ENV: process.env.NODE_ENV || 'development',
};
