import { z } from "zod/v4";

export const signUpSchema = z.object({
  email: z.string().check(z.email()),
  password: z.string().check(z.minLength(8), z.maxLength(12)),
  name: z.string().check(z.minLength(4))
});

export const signInSchema = z.object({
  email: z.string().check(z.email()),
  password: z.string().check(z.minLength(8), z.maxLength(12))
});

export const userSchema = z.object({
  id: z.string(),
  name: z.string().check(z.email()),
  emailVerified: z.boolean(),
  image: z.string().nullable().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
  role: z.string().optional().nullable(),
  banned: z.boolean().nullable().optional(),
  banReason: z.string().nullable().optional(),
  hasOnboarded: z.boolean().optional()
});

export const UpdateUserSchema = z.object({
	name: z.string().min(1).max(100).optional(),
	image: z.string().url().optional(),
});

export const sessionSchema = z.object({
  id: z.string(),
  expiresAt: z.nullable(z.date()),
  token: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  ipAddress: z.string().optional().nullable(),
  userAgent: z.string().optional().nullable(),
  userId: z.string(),
  impersonatedBy: z.string().nullable().optional(),
  activeOrganizationId: z.string().nullable().optional(),
  user: z.object(userSchema).optional()
})

export type TSignupSchema = z.infer<typeof signUpSchema>;
export type TLoginSchema = z.infer<typeof signInSchema>;
export type TUserSchema = z.infer<typeof userSchema>;
export type TSessionSchema = z.infer<typeof sessionSchema>;
