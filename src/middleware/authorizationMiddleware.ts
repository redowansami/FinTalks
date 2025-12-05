import { Request, Response, NextFunction } from 'express';
import { container } from 'tsyringe';
import { ErrorFactory } from '../errors/errorFactory';
import { HTTP_MESSAGES } from '../constants/httpConstants';
import { User, UserRole } from '../entities/userEntity';
import { StoryService } from '../services/storyService';

const checkOwnershipOrRole = (
	ownershipId: string | undefined,
	user: User | undefined,
	allowedRoles: UserRole[] = [],
): void => {
	if (!user) {
		throw ErrorFactory.unauthorized(HTTP_MESSAGES.UNAUTHORIZED);
	}

	if (user.userId === ownershipId) {
		return;
	}

	if (allowedRoles.includes(user.role)) {
		return;
	}

	throw ErrorFactory.forbidden(HTTP_MESSAGES.FORBIDDEN);
};

export const requireAdmin = (
	req: Request & { user?: User },
	res: Response,
	next: NextFunction,
): void => {
	const user = req.user;
	if (!user) {
		throw ErrorFactory.unauthorized(HTTP_MESSAGES.UNAUTHORIZED);
	}

	if (user.role !== UserRole.ADMIN) {
		throw ErrorFactory.forbidden(HTTP_MESSAGES.FORBIDDEN);
	}

	next();
};

export const requireRolesUser = (allowedRoles: UserRole[] = []) => {
	return (req: Request & { user?: User }, res: Response, next: NextFunction): void => {
		const user = req.user;
		const userId = req.params.userId;

		checkOwnershipOrRole(userId, user, allowedRoles);
		next();
	};
};

export const requireRolesStory = (allowedRoles: UserRole[] = []) => {
	return async (
		req: Request & { user?: User },
		res: Response,
		next: NextFunction,
	): Promise<void> => {
		const user = req.user;
		const storyId = req.params.storyId;

		const storyService = container.resolve(StoryService);
		const story = await storyService.getStoryById(storyId);
		checkOwnershipOrRole(story.userId, user, allowedRoles);
		next();
	};
};
