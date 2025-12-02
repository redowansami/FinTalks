import { z } from 'zod';
import { LENTGH_CONSTRAINTS, VALIDATION_MESSAGES } from '../constants/validationConstants';
import { UserOrderByFields } from '../constants/databaseConstants';
import { Expose } from 'class-transformer';

export const createUserSchema = z
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
		email: z
			.email(VALIDATION_MESSAGES.INVALID_EMAIL)
			.max(LENTGH_CONSTRAINTS.EMAIL_MAX, VALIDATION_MESSAGES.EMAIL_MAX)
			.trim(),
	})
	.strict();

export const updateUserSchema = createUserSchema.partial().omit({ username: true, email: true });

export const userIdSchema = z.object({
	userId: z.uuid('Invalid user ID format'),
});

export const userQuerySchema = z.object({
	search: z.string().optional(),
	orderBy: z.enum(UserOrderByFields).optional(),
	page: z.coerce.number().int().positive().default(1),
	limit: z.coerce
		.number()
		.int()
		.positive()
		.max(LENTGH_CONSTRAINTS.MAX_LIMIT, VALIDATION_MESSAGES.MAX_LIMIT)
		.default(LENTGH_CONSTRAINTS.DEFAULT_PAGINATION_LIMIT),
});

export type CreateUserDTO = z.infer<typeof createUserSchema>;
export type UpdateUserDTO = z.infer<typeof updateUserSchema>;
export type UserIdDTO = z.infer<typeof userIdSchema>;
export type UserQueryDTO = z.infer<typeof userQuerySchema>;

export class UserResponseDTO {
	@Expose() userId: string;
	@Expose() username: string;
	@Expose() name: string;
	@Expose() email: string;
	@Expose() joinDate: Date;
	@Expose() role: string;
}
