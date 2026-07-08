import { z } from 'zod';

export const LoginSchema = z.object({
  identifier: z.string()
    .min(1, 'Username or Email is required')
    .min(3, 'Must be at least 3 characters'),
  password: z.string()
    .min(6, 'Password must be at least 6 characters')
});

export const ForgotPasswordSchema = z.object({
  email: z.string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address')
});

export const ResetPasswordSchema = z.object({
  password: z.string()
    .min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string()
    .min(1, 'Confirm password is required')
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});
