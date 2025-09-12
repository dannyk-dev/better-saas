// types/schemas/onboarding.ts
import { z } from "zod/v4";

export const profileSchema = z.object({
  fullName: z.string().optional(),
  title: z.string().max(100).optional(),
});

export const organizationSchema = z.object({
  orgName: z.string().min(1, "Organization name is required").max(120),
  orgSize: z.enum(["1-10", "11-50", "51-200", "201-1000", "1000+"], {
    error: "Select an organization size",
  }),
  industry: z
    .enum([
      "General",
      "Real Estate",
      "Finance",
      "Healthcare",
      "Education",
      "Technology",
      "Retail",
      "Other",
    ])
    .default("General"),
});

export const preferencesSchema = z.object({
  timezone: z.string().min(1, "Timezone is required"),
  locale: z.string().min(2, "Locale is required").default("en-US"),
  notifications: z.object({
    productUpdates: z.boolean().default(true),
    alerts: z.boolean().default(true),
  }),
});

export const onboardingSchema = profileSchema
  .merge(organizationSchema)
  .merge(preferencesSchema)
  .extend({ skip: z.boolean().optional() });

export type TProfile = z.infer<typeof profileSchema>;
export type TOrganization = z.infer<typeof organizationSchema>;
export type TPreferences = z.infer<typeof preferencesSchema>;
export type TOnboarding = z.infer<typeof onboardingSchema>;
