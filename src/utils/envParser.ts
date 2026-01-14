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
	JWT_EXPIRES_IN: Number(process.env.JWT_EXPIRES_IN),
	BCRYPT_SALT_ROUNDS: Number(process.env.BCRYPT_SALT_ROUNDS) || 10,
	SMTP_HOST: process.env.SMTP_HOST || 'localhost',
	SMTP_PORT: parseInt(process.env.SMTP_PORT || '587'),
	SMTP_SECURE: process.env.SMTP_SECURE === 'true' || false,
	SMTP_USER: process.env.SMTP_USER || '',
	SMTP_PASS: process.env.SMTP_PASS || '',
	EMAIL_FROM: process.env.EMAIL_FROM || 'noreply@fintalks.com',
	BACKEND_URL: process.env.BACKEND_URL || 'http://localhost:3000',
	EMAIL_TOKEN_SECRET: process.env.EMAIL_TOKEN_SECRET || 'email_token_secret',
	EMAIL_TOKEN_EXPIRES_IN: process.env.EMAIL_TOKEN_EXPIRES_IN || '24h',
	OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY || '',
	OPENROUTER_MODEL: process.env.OPENROUTER_MODEL || 'openai/gpt-4o',
	OPENROUTER_FALLBACK_MODEL:
		process.env.OPENROUTER_FALLBACK_MODEL || 'meta-llama/llama-2-7b-chat',
	AI_SUMMARIZATION_TIMEOUT_MS: parseInt(process.env.AI_SUMMARIZATION_TIMEOUT_MS || '30000'),
	AI_SUMMARIZATION_MAX_RETRIES: parseInt(process.env.AI_SUMMARIZATION_MAX_RETRIES || '3'),
	PASSWORD_CHANGE_CODE_EXPIRY: Number(process.env.PASSWORD_CHANGE_CODE_EXPIRY || '900'),
};
