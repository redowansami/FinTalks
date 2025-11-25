import { HTTP_MESSAGES, HTTP_STATUS } from '../constants/httpConstants';
import { AppError } from './appError';

export interface ValidationErrorDetail {
	[key: string]: string | string[] | ValidationErrorDetail;
}

export class NotFoundError extends AppError {
	public readonly statusCode = HTTP_STATUS.NOT_FOUND;

	constructor(message: string = HTTP_MESSAGES.RESOURCE_NOT_FOUND) {
		super(message);
	}
}

export class ValidationError extends AppError {
	public readonly statusCode = HTTP_STATUS.BAD_REQUEST;
	public readonly details: ValidationErrorDetail;

	constructor(
		message: string = HTTP_MESSAGES.VALIDATION_FAILED,
		details: ValidationErrorDetail = {},
	) {
		super(message);
		this.details = details;
	}
}

export class UnauthorizedError extends AppError {
	public readonly statusCode = HTTP_STATUS.UNAUTHORIZED;

	constructor(message: string = HTTP_MESSAGES.UNAUTHORIZED) {
		super(message);
	}
}

export class ForbiddenError extends AppError {
	public readonly statusCode = HTTP_STATUS.FORBIDDEN;

	constructor(message: string = HTTP_MESSAGES.FORBIDDEN) {
		super(message);
	}
}

export class DatabaseError extends AppError {
	public readonly statusCode = HTTP_STATUS.INTERNAL_ERROR;

	constructor(message: string = HTTP_MESSAGES.INTERNAL_DATABASE_ERROR) {
		super(message);
	}
}
