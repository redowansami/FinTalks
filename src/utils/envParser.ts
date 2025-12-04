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
	JWT_SECRET: process.env.JWT_SECRET || 'your_jwt_secret',
	// JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '30d',
	JWT_EXPIRES_IN: Number(process.env.JWT_EXPIRES_IN),
	BCRYPT_SALT_ROUNDS: Number(process.env.BCRYPT_SALT_ROUNDS) || 10,
};
