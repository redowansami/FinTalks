import {
	NotFoundError,
	ValidationError,
	UnauthorizedError,
	ForbiddenError,
	DatabaseError,
	ConflictError,
	ValidationErrorDetail,
} from './customErrors';
import { ErrorCreator } from './baseErrorCreator';

export class NotFoundErrorCreator extends ErrorCreator {
	create(message?: string): NotFoundError {
		return new NotFoundError(message);
	}
}

export class ValidationErrorCreator extends ErrorCreator {
	create(message?: string, details?: ValidationErrorDetail): ValidationError {
		return new ValidationError(details, message);
	}
}

export class UnauthorizedErrorCreator extends ErrorCreator {
	create(message?: string): UnauthorizedError {
		return new UnauthorizedError(message);
	}
}

export class ForbiddenErrorCreator extends ErrorCreator {
	create(message?: string): ForbiddenError {
		return new ForbiddenError(message);
	}
}

export class DatabaseErrorCreator extends ErrorCreator {
	create(message?: string): DatabaseError {
		return new DatabaseError(message);
	}
}

export class ConflictErrorCreator extends ErrorCreator {
	create(message?: string): ConflictError {
		return new ConflictError(message);
	}
}
