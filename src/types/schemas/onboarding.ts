import { z } from "zod";

export const onboardingSchema = z.object({
  fullName: z.string(),
  title: z.string(),
  orgName: z.string(),
  orgSize: z.string(),
});

export type TOnboardingSchema = z.infer<typeof onboardingSchema>;
