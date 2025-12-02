import { Request, Response, NextFunction } from 'express';
import { ValidationError } from '../errors/customErrors';
import { AppError } from '../errors/appError';
import { handleDatabaseError } from '../utils/errorUtils';
import { HTTP_MESSAGES, HTTP_STATUS } from '../constants/httpConstants';
import { env } from '../utils/envParser';

interface ErrorResponsePayload {
	success: boolean;
	message: string;
	errors?: Record<string, unknown>;
	stack?: string;
}

export const errorHandler = (
	err: Error,
	_req: Request,
	res: Response,
	_next: NextFunction,
): Response => {
	const isDevelopment = env.NODE_ENV === 'development';
	console.error('Error:', {
		name: err.name,
		message: err.message,
		stack: err.stack,
		timestamp: new Date().toISOString(),
	});

	if (err instanceof AppError) {
		const response: ErrorResponsePayload = {
			success: false,
			message: err.message,
		};

		if (err instanceof ValidationError) {
			response.errors = err.details;
		}

		if (isDevelopment) {
			response.stack = err.stack;
		}

		return res.status(err.statusCode).json(response);
	}

	if (err instanceof Error && 'code' in err) {
		const dbError = handleDatabaseError(err);
		const response: ErrorResponsePayload = {
			success: false,
			message: dbError.message,
		};

		if (isDevelopment) {
			response.stack = err.stack;
		}

		console.error('Database Error:', err);
		return res.status(dbError.statusCode).json(response);
	}

	const response: ErrorResponsePayload = {
		success: false,
		message: HTTP_MESSAGES.INTERNAL_ERROR,
	};

	if (isDevelopment) {
		response.message = err.message || 'Unknown error';
		response.stack = err.stack;
	}

	return res.status(HTTP_STATUS.INTERNAL_ERROR).json(response);
};

export const routeNotFoundHandler = (_req: Request, res: Response): Response => {
	const response: ErrorResponsePayload = {
		success: false,
		message: HTTP_MESSAGES.ROUTE_NOT_FOUND,
	};

	return res.status(HTTP_STATUS.NOT_FOUND).json(response);
};
