import {
	NotFoundErrorCreator,
	ValidationErrorCreator,
	UnauthorizedErrorCreator,
	ForbiddenErrorCreator,
	DatabaseErrorCreator,
	ConflictErrorCreator,
} from './concreteErrorCreator';
import { ErrorCreator } from './baseErrorCreator';

export const notFoundCreator: ErrorCreator = new NotFoundErrorCreator();
export const validationCreator: ErrorCreator = new ValidationErrorCreator();
export const unauthorizedCreator: ErrorCreator = new UnauthorizedErrorCreator();
export const forbiddenCreator: ErrorCreator = new ForbiddenErrorCreator();
export const databaseCreator: ErrorCreator = new DatabaseErrorCreator();
export const conflictCreator: ErrorCreator = new ConflictErrorCreator();
