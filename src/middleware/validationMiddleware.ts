import { Request, Response, NextFunction } from 'express';
import { ZodType } from 'zod';
import { ErrorFactory } from '../errors/errorFactory';
import { formatZodError } from '../errors/errorUtils';

export const validateRequest = (schemas: { body?: ZodType; params?: ZodType; query?: ZodType }) => {
	return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
		if (schemas.body) {
			const result = schemas.body.safeParse(req.body);
			if (!result.success) {
				throw ErrorFactory.validation(formatZodError(result.error));
			}
			req.body = result.data;
		}

		if (schemas.params) {
			const result = schemas.params.safeParse(req.params);
			if (!result.success) {
				throw ErrorFactory.validation(formatZodError(result.error));
			}
			req.params = result.data as Record<string, string>;
		}

		if (schemas.query) {
			const result = schemas.query.safeParse(req.query);
			if (!result.success) {
				throw ErrorFactory.validation(formatZodError(result.error));
			}
			req.query = result.data as Record<string, any>;
		}

		next();
	};
};
