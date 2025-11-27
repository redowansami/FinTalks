import { z } from 'zod';
import { UserRole } from '../entities/userEntity';
import { LENTGH_CONSTRAINTS, VALIDATION_MESSAGES } from '../constants/validationConstants';
import { Expose } from 'class-transformer';

export const createUserDTO = z
	.object({
		username: z
			.string()
			.min(LENTGH_CONSTRAINTS.USERNAME_MIN, VALIDATION_MESSAGES.USERNAME_MIN)
			.max(LENTGH_CONSTRAINTS.USERNAME_MAX, VALIDATION_MESSAGES.USERNAME_MAX)
			.regex(/^[a-zA-Z0-9_]+$/, VALIDATION_MESSAGES.USERNAME_INVALID)
			.trim(),
		name: z
			.string()
			.min(LENTGH_CONSTRAINTS.NAME_MIN, VALIDATION_MESSAGES.NAME_MIN)
			.max(LENTGH_CONSTRAINTS.NAME_MAX, VALIDATION_MESSAGES.NAME_MAX)
			.trim(),
		email: z.email(VALIDATION_MESSAGES.INVALID_EMAIL),
		role: z.enum(UserRole).optional().default(UserRole.USER),
	})
	.strict();

export const updateUserDTO = createUserDTO.partial();

export class UserResponseDTO {
	@Expose() userId: string;
	@Expose() username: string;
	@Expose() name: string;
	@Expose() email: string;
	@Expose() joinDate: Date;
	@Expose() role: string;
}

export const userIdDTO = z.object({
	userId: z.uuid('Invalid user ID format'),
});

export const paginationQueryDTO = z.object({
	startAfter: z.string().min(1, 'Invalid cursor format').optional(),
	limit: z.coerce.number().int().positive().max(100).default(5),
});

export type CreateUserDTO = z.infer<typeof createUserDTO>;
export type UpdateUserDTO = z.infer<typeof updateUserDTO>;
export type UserIdDTO = z.infer<typeof userIdDTO>;
export type PaginationQueryDTO = z.infer<typeof paginationQueryDTO>;
