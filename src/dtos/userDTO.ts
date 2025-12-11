import { z } from 'zod';
import { Expose } from 'class-transformer';
import {
	createUserSchema,
	updateUserSchema,
	userIdSchema,
	userQuerySchema,
	updateProfileSchema,
} from '../schemas/userSchema';

export type CreateUserDTO = z.infer<typeof createUserSchema>;
export type UpdateUserDTO = z.infer<typeof updateUserSchema>;
export type UserIdDTO = z.infer<typeof userIdSchema>;
export type UserQueryDTO = z.infer<typeof userQuerySchema>;
export type UpdateProfileDTO = z.infer<typeof updateProfileSchema>;

export class UserResponseDTO {
	@Expose() userId: string;
	@Expose() username: string;
	@Expose() name: string;
	@Expose() email: string;
	@Expose() joinDate: Date;
	@Expose() role: string;
}

export class SignupResponseDTO extends UserResponseDTO {
	@Expose() isEmailConfirmed: boolean;
}

export class GetProfileDTO {
	@Expose() userId: string;
	@Expose() username: string;
	@Expose() name: string;
	@Expose() email: string;
	@Expose() bio: string | null;
	@Expose() profilePictureUrl: string | null;
	@Expose() joinDate: Date;
	@Expose() role: string;
}
