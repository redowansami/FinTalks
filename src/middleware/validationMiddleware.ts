import { Request, Response, NextFunction } from 'express';
import { ZodType } from 'zod';
import { handleZodError } from '../errors/errorUtils';

export interface ValidatedRequest extends Request {
	validated?: {
		body?: unknown;
		params?: unknown;
	};
}

export const validateRequest = (schemas: {
	body?: ZodType;
	params?: ZodType;
}): ((req: ValidatedRequest, res: Response, next: NextFunction) => Promise<void>) => {
	return async (req: ValidatedRequest, res: Response, next: NextFunction): Promise<void> => {
		if (schemas.body) {
			const result = await schemas.body.safeParseAsync(req.body);
			if (!result.success) {
				throw handleZodError(result.error);
			}
			req.validated = { ...req.validated, body: result.data };
		}

		if (schemas.params) {
			const result = await schemas.params.safeParseAsync(req.params);
			if (!result.success) {
				throw handleZodError(result.error);
			}
			req.validated = { ...req.validated, params: result.data };
		}

		next();
	};
};
