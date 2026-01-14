import z from 'zod';
import { loginSchema, signupSchema, changePasswordSchema } from '../schemas/authSchema';

export type SignupDTO = z.infer<typeof signupSchema>;
export type LoginDTO = z.infer<typeof loginSchema>;
export type ChangePasswordDTO = z.infer<typeof changePasswordSchema>;
