import { ValidationErrorDetail } from './customErrors';
import { DatabaseError } from './customErrors';
import { DATABASE_ERROR_CODES, DATABASE_ERROR_MESSAGES } from '../constants/databaseConstants';
import { ZodError } from 'zod';

export function formatZodError(error: ZodError): ValidationErrorDetail {
	return error.issues.reduce((acc, err) => {
		const path = err.path.join('.');
		acc[path] = err.message;
		return acc;
	}, {} as ValidationErrorDetail);
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
