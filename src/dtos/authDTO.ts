import z from 'zod';
import {
	loginSchema,
	signupSchema,
	initiatePasswordChangeSchema,
	confirmPasswordChangeSchema,
	confirmationCodeSchema,
} from '../schemas/authSchema';

export type SignupDTO = z.infer<typeof signupSchema>;
export type LoginDTO = z.infer<typeof loginSchema>;
export type InitiatePasswordChangeDTO = z.infer<typeof initiatePasswordChangeSchema>;
export type ConfirmPasswordChangeDTO = z.infer<typeof confirmPasswordChangeSchema>;
export type ConfirmPasswordCodeDTO = z.infer<typeof confirmationCodeSchema>;
