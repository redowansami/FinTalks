import { ValidationError, ValidationErrorDetail } from './customErrors';
import { DatabaseError } from './customErrors';
import { DATABASE_ERROR_CODES, DATABASE_ERROR_MESSAGES } from '../constants/databaseConstants';
import { ZodError } from 'zod';

export function handleZodError(error: ZodError): ValidationError {
	const details: ValidationErrorDetail = {};

	error.issues.forEach((err) => {
		const path = err.path.join('.');
		details[path] = err.message;
	});

	return new ValidationError('Validation failed', details);
}

export function handleDatabaseError(error: unknown): DatabaseError {
	if (error instanceof Error) {
		if ('code' in error && error.code === DATABASE_ERROR_CODES.UNIQUE_CONSTRAINT_VIOLATION) {
			return new DatabaseError(DATABASE_ERROR_MESSAGES.DUPLICATE_ENTRY);
		}
		if (
			'code' in error &&
			error.code === DATABASE_ERROR_CODES.FOREIGN_KEY_CONSTRAINT_VIOLATION
		) {
			return new DatabaseError(DATABASE_ERROR_MESSAGES.FOREIGN_KEY_VIOLATION);
		}
		return new DatabaseError(error.message || DATABASE_ERROR_MESSAGES.OPERATION_FAILED);
	}
	return new DatabaseError(DATABASE_ERROR_MESSAGES.UNKNOWN_ERROR);
}
