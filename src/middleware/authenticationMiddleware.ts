import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { ErrorFactory } from '../errors/errorFactory';
import { HTTP_MESSAGES } from '../constants/httpConstants';
import { env } from '../utils/envParser';

const JWT_SECRET = env.JWT_SECRET;

export interface JwtPayload {
	userId: string;
	username: string;
	role: string;
	iat?: number;
	exp?: number;
}

export const requireAuth = async (
	req: Request & { user?: any },
	res: Response,
	next: NextFunction,
): Promise<void> => {
	const authHeader = req.headers.authorization;

	if (!authHeader || !authHeader.startsWith('Bearer ')) {
		throw ErrorFactory.unauthorized(HTTP_MESSAGES.UNAUTHORIZED);
	}

	const token = authHeader.split(' ')[1];

	let payload: JwtPayload;
	try {
		payload = jwt.verify(token, JWT_SECRET) as JwtPayload;
	} catch {
		throw ErrorFactory.unauthorized(HTTP_MESSAGES.INVALID_TOKEN);
	}

	req.user = {
		userId: payload.userId,
		username: payload.username,
		role: payload.role,
	};

	next();
};
