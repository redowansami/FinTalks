import z from 'zod';
import { loginSchema, signupSchema } from '../schemas/authSchema';

export type SignupDTO = z.infer<typeof signupSchema>;
export type LoginDTO = z.infer<typeof loginSchema>;
