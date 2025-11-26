import { Request, Response, NextFunction } from 'express';
import { ZodType } from 'zod';
import { ValidationError } from '../errors/customErrors';
import { formatZodError } from '../errors/errorUtils';

export const validateRequest = (schemas: { body?: ZodType; params?: ZodType }) => {
	return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
		if (schemas.body) {
			const result = schemas.body.safeParse(req.body);
			if (!result.success) {
				throw new ValidationError(formatZodError(result.error));
			}
			req.body = result.data;
		}

		if (schemas.params) {
			const result = schemas.params.safeParse(req.params);
			if (!result.success) {
				throw new ValidationError(formatZodError(result.error));
			}
			req.params = result.data as any;
		}

		next();
	};
};
