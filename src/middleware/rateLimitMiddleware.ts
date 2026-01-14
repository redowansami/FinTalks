import { rateLimit, ipKeyGenerator } from 'express-rate-limit';
import { Request, Response, NextFunction } from 'express';
import { RateLimitErrorCreator } from '../errors/concreteErrorCreator';
import { RATE_LIMIT_CONFIG } from '../constants/rateLimitConstants';

const rateLimitErrorCreator = new RateLimitErrorCreator();

const createRateLimitHandler =
	(message: string) => (_req: Request, _res: Response, _next: NextFunction) => {
		throw rateLimitErrorCreator.create(message);
	};

export const defaultLimiter = rateLimit({
	windowMs: RATE_LIMIT_CONFIG.DEFAULT.WINDOW_MS,
	max: RATE_LIMIT_CONFIG.DEFAULT.MAX,
	message: RATE_LIMIT_CONFIG.DEFAULT.MESSAGE,
	standardHeaders: true,
	legacyHeaders: false,
	handler: createRateLimitHandler(RATE_LIMIT_CONFIG.DEFAULT.MESSAGE),
});

export const loginLimiter = rateLimit({
	windowMs: RATE_LIMIT_CONFIG.LOGIN.WINDOW_MS,
	max: RATE_LIMIT_CONFIG.LOGIN.MAX,
	message: RATE_LIMIT_CONFIG.LOGIN.MESSAGE,
	standardHeaders: false,
	legacyHeaders: false,
	keyGenerator: (req) => ipKeyGenerator(req.ip || ''),
	handler: createRateLimitHandler(RATE_LIMIT_CONFIG.LOGIN.MESSAGE),
});

export const signupLimiter = rateLimit({
	windowMs: RATE_LIMIT_CONFIG.SIGNUP.WINDOW_MS,
	max: RATE_LIMIT_CONFIG.SIGNUP.MAX,
	message: RATE_LIMIT_CONFIG.SIGNUP.MESSAGE,
	standardHeaders: false,
	legacyHeaders: false,
	keyGenerator: (req) => ipKeyGenerator(req.ip || ''),
	handler: createRateLimitHandler(RATE_LIMIT_CONFIG.SIGNUP.MESSAGE),
});

export const resendEmailLimiter = rateLimit({
	windowMs: RATE_LIMIT_CONFIG.RESEND_EMAIL.WINDOW_MS,
	max: RATE_LIMIT_CONFIG.RESEND_EMAIL.MAX,
	message: RATE_LIMIT_CONFIG.RESEND_EMAIL.MESSAGE,
	standardHeaders: false,
	legacyHeaders: false,
	keyGenerator: (req) => {
		const email = (req.body as any)?.email;
		return email || ipKeyGenerator(req.ip || '');
	},
	handler: createRateLimitHandler(RATE_LIMIT_CONFIG.RESEND_EMAIL.MESSAGE),
});

export const createStoryLimiter = rateLimit({
	windowMs: RATE_LIMIT_CONFIG.CREATE_STORY.WINDOW_MS,
	max: RATE_LIMIT_CONFIG.CREATE_STORY.MAX,
	message: RATE_LIMIT_CONFIG.CREATE_STORY.MESSAGE,
	standardHeaders: false,
	legacyHeaders: false,
	keyGenerator: (req) => (req as any).userId || ipKeyGenerator(req.ip || ''),
	handler: createRateLimitHandler(RATE_LIMIT_CONFIG.CREATE_STORY.MESSAGE),
});

export const updateStoryLimiter = rateLimit({
	windowMs: RATE_LIMIT_CONFIG.UPDATE_STORY.WINDOW_MS,
	max: RATE_LIMIT_CONFIG.UPDATE_STORY.MAX,
	message: RATE_LIMIT_CONFIG.UPDATE_STORY.MESSAGE,
	standardHeaders: false,
	legacyHeaders: false,
	keyGenerator: (req) => (req as any).userId || ipKeyGenerator(req.ip || ''),
	handler: createRateLimitHandler(RATE_LIMIT_CONFIG.UPDATE_STORY.MESSAGE),
});
