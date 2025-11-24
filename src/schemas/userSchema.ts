import { z } from 'zod';
import { UserRole } from '../entities/userEntity';

export const createUserSchema = z.object({
	username: z.string().min(1, 'Username is required').trim(),
	name: z.string().min(1, 'Name is required').trim(),
	email: z.string().email('Invalid email address'),
	role: z.enum(UserRole).optional().default(UserRole.USER),
});

export const updateUserSchema = z.object({
	username: z.string().min(1, 'Username is required').trim().optional(),
	name: z.string().min(1, 'Name is required').trim().optional(),
	email: z.string().email('Invalid email address').optional(),
	role: z.enum(UserRole).optional(),
});

export const userIdSchema = z.object({
	userId: z.string().uuid('Invalid user ID format'),
});

export type CreateUserSchemaType = z.infer<typeof createUserSchema>;
export type UpdateUserSchemaType = z.infer<typeof updateUserSchema>;
export type UserIdSchemaType = z.infer<typeof userIdSchema>;
