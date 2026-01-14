import { Response, NextFunction, Request } from 'express';
import { ZodType } from 'zod';
import '../types/globals';
import { validationCreator } from '../errors/errorFactory';
import { formatZodError } from '../utils/errorUtils';

export const validateRequest = (schemas: { body?: ZodType; params?: ZodType; query?: ZodType }) => {
	return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
		req.validatedReq = {};

		if (schemas.body) {
			const result = schemas.body.safeParse(req.body);
			if (!result.success) {
				throw validationCreator.create(undefined, formatZodError(result.error));
			}
			req.body = result.data;
		}

		if (schemas.params) {
			const result = schemas.params.safeParse(req.params);
			if (!result.success) {
				throw validationCreator.create(undefined, formatZodError(result.error));
			}
			req.params = result.data as any;
		}

		if (schemas.query) {
			const result = schemas.query.safeParse(req.query);
			if (!result.success) {
				throw validationCreator.create(undefined, formatZodError(result.error));
			}
			req.validatedReq.query = result.data;
		}

		next();
	};
};
