import { Request, Response, NextFunction } from 'express';
import { ZodType, z } from 'zod';
import { HTTP_STATUS, HTTP_MESSAGES } from '../constants/httpConstants';

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
		try {
			if (schemas.body) {
				const result = await schemas.body.safeParseAsync(req.body);
				if (!result.success) {
					res.status(HTTP_STATUS.BAD_REQUEST).json({
						message: HTTP_MESSAGES.VALIDATION_FAILED,
						errors: z.treeifyError(result.error),
					});
					return;
				}
				req.validated = { ...req.validated, body: result.data };
			}

			if (schemas.params) {
				const result = await schemas.params.safeParseAsync(req.params);
				if (!result.success) {
					res.status(HTTP_STATUS.BAD_REQUEST).json({
						message: HTTP_MESSAGES.VALIDATION_FAILED,
						errors: z.treeifyError(result.error),
					});
					return;
				}
				req.validated = { ...req.validated, params: result.data };
			}

			next();
		} catch (error: unknown) {
			res.status(HTTP_STATUS.BAD_REQUEST).json({
				message: HTTP_MESSAGES.VALIDATION_FAILED,
				error: String(error),
			});
		}
	};
};
