import { ValidationErrorDetail } from './customErrors';
import { AppError } from './appError';

export abstract class ErrorCreator {
	abstract create(message?: string, details?: ValidationErrorDetail): AppError;
}
