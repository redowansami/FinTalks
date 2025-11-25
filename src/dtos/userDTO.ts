import { z } from 'zod';
import { UserRole } from '../entities/userEntity';
import { LENTGH_CONSTRAINTS, VALIDATION_MESSAGES } from '../constants/validationConstants';

export const createUserDTO = z
	.object({
		username: z
			.string()
			.min(LENTGH_CONSTRAINTS.USERNAME_MIN, VALIDATION_MESSAGES.USERNAME_MIN)
			.max(LENTGH_CONSTRAINTS.USERNAME_MAX, VALIDATION_MESSAGES.USERNAME_MAX)
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

export interface UserResponseDTO {
	userId: string;
	username: string;
	name: string;
	email: string;
	joinDate: Date;
	role: UserRole;
}

export const userIdDTO = z.object({
	userId: z.uuid('Invalid user ID format'),
});

export type CreateUserDTO = z.infer<typeof createUserDTO>;
export type UpdateUserDTO = z.infer<typeof updateUserDTO>;
export type UserIdDTO = z.infer<typeof userIdDTO>;
