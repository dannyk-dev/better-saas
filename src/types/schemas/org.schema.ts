// src/types/schemas/org.schema.ts
import { z } from "zod";

export const OrgIdSchema = z.object({ organizationId: z.string().min(1) });
export const OrgSlugSchema = z.object({ slug: z.string().min(3).max(64).regex(/^[a-z0-9-]+$/) });

export const OrgMetadataSchema = z.object({
  size: z.enum(["1-10","11-50","51-200","201-1000","1000+"]).default("1-10"),
  industry: z.enum(["General","Real Estate","Finance","Healthcare","Education","Technology","Retail","Other"])
           .default("General"),
  timezone: z.string().optional(),
}).partial().default({});

export const CreateOrgSchema = z.object({
  name: z.string().min(2).max(120),
  slug: OrgSlugSchema.shape.slug,
  logo: z.string().url().optional(),
  metadata: OrgMetadataSchema.optional(),
  keepCurrentActiveOrganization: z.boolean().optional(),
  userId: z.string().optional(),
});

export const UpdateOrgSchema = z.object({
  organizationId: z.string().optional(),
  name: z.string().min(2).max(120).optional(),
  slug: OrgSlugSchema.shape.slug.optional(),
  logo: z.string().url().optional(),
  metadata: OrgMetadataSchema.optional(),
});

export const InviteSchema = z.object({
  email: z.string().email(),
  role: z.enum(["member","admin","owner"]).default("member"),
  organizationId: z.string().min(1),
  resend: z.boolean().optional(),
  teamId: z.string().optional(),
});

export type TCreateOrg = z.infer<typeof CreateOrgSchema>;
export type TUpdateOrg = z.infer<typeof UpdateOrgSchema>;
export type TInvite = z.infer<typeof InviteSchema>;
