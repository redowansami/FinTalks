import {
	NotFoundError,
	ValidationError,
	UnauthorizedError,
	ForbiddenError,
	DatabaseError,
	ConflictError,
	ValidationErrorDetail,
} from './customErrors';

export class ErrorFactory {
	static notFound(message?: string): NotFoundError {
		return new NotFoundError(message);
	}

	static validation(details?: ValidationErrorDetail, message?: string): ValidationError {
		return new ValidationError(details, message);
	}

	static unauthorized(message?: string): UnauthorizedError {
		return new UnauthorizedError(message);
	}

	static forbidden(message?: string): ForbiddenError {
		return new ForbiddenError(message);
	}

	static database(message?: string): DatabaseError {
		return new DatabaseError(message);
	}

	static conflict(message?: string): ConflictError {
		return new ConflictError(message);
	}
}
