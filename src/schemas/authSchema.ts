import { z } from 'zod';
import { LENTGH_CONSTRAINTS, VALIDATION_MESSAGES } from '../constants/validationConstants';

export const signupSchema = z
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
		password: z
			.string()
			.min(LENTGH_CONSTRAINTS.PASSWORD_MIN, VALIDATION_MESSAGES.PASSWORD_MIN)
			.max(LENTGH_CONSTRAINTS.PASSWORD_MAX, VALIDATION_MESSAGES.PASSWORD_MAX)
			.regex(/[a-z]/, VALIDATION_MESSAGES.LOWERCASE_LETTER)
			.regex(/[A-Z]/, VALIDATION_MESSAGES.UPPERCASE_LETTER)
			.regex(/\d/, VALIDATION_MESSAGES.DIGIT)
			.regex(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/, VALIDATION_MESSAGES.SPECIAL_CHARACTER),
	})
	.strict();

export const loginSchema = signupSchema
	.partial()
	.omit({ username: true, name: true })
	.required()
	.strict();
