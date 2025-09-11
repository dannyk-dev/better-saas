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
  hasOnboarded: z.boolean()
});


export type TSignupSchema = z.infer<typeof signUpSchema>;
export type TLoginSchema = z.infer<typeof signInSchema>;
export type TUserSchema = z.infer<typeof userSchema>;
