import { z } from "zod/v4";


export const userIdSchema = z.object({
  userId: z.string()
});

export const userCreditAccountSchema = z.object({
  id: z.string(),
  userId: z.string(),
  balance: z.number(),
  totalEarned: z.number(),
  totalSpent: z.number(),
  frozenBalance: z.number(),
  createdAt: z.date(),
  updatedAt: z.date()
});

export const userInitializeCreditSchema = z.object({
  creditAccount: userCreditAccountSchema,
  signupCreditsGranted: z.number(),
  isNewAccount: z.boolean()
});


export type TUserIdSchema = z.infer<typeof userIdSchema>;
export type TUserCreditAccount = z.infer<typeof userCreditAccountSchema>;
export type TDefaultInitializedCreditSchema = z.infer<typeof userInitializeCreditSchema>
