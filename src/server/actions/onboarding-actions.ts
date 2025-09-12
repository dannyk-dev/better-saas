'use server';

import { eq } from 'drizzle-orm';
import { onboardingSchema, type TOnboarding } from '@/types/schemas/onboarding.schema';
import db from '@/server/db';
import { user as userTbl, session as sessionTbl } from '@/server/db/schema';
import { auth } from '@/lib/auth/auth';
import { headers } from 'next/headers';
import { createOrganization } from '@/server/actions/org-actions';
import { authActionClient } from '@/server/action-client';

const slugify = (s: string) =>
	s
		.toLowerCase()
		.trim()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '');

export const completeOnboarding = authActionClient
	.metadata({ actionName: 'completeOnboarding' })
	.inputSchema(onboardingSchema)
	.action(async ({ parsedInput, ctx }) => {
		await ctx.db
			.update(userTbl)
			.set({
				hasOnboarded: true,
				name: parsedInput.fullName,
			})
			.where(eq(userTbl.id, ctx.user.id));

		const org = await createOrganization({
			name: parsedInput.orgName,
			slug: slugify(parsedInput.orgName),
			userId: ctx.user.id,
			metadata: {
				size: parsedInput.orgSize,
				industry: parsedInput.industry,
				timezone: parsedInput.timezone,
			},
		});

		if (!org.data) {
			throw new Error(org.serverError);
		}

		// await auth.api.setActiveOrganization({
		// 	body: { organizationId: org.data.id },
		// 	headers: ctx.headers,
		// });

		await db
			.update(sessionTbl)
			.set({ activeOrganizationId: org.data.id })
			.where(eq(sessionTbl.userId, ctx.session.userId));

		return { ok: true as const };
	});

export const skipOnboarding = authActionClient.metadata({ actionName: 'skipOnboarding' }).action(async ({ ctx }) => {
	const org = await createOrganization({
		name: 'Default Org',
		slug: 'default-org',
		userId: ctx.session.userId,
	});
	if (!org.data) throw new Error(org.serverError ?? 'ORG_CREATE_FAILED');

	await db.update(userTbl).set({ hasOnboarded: true }).where(eq(userTbl.id, ctx.session.userId));

	await auth.api.setActiveOrganization({
		body: { organizationId: org.data.id },
		headers: ctx.headers,
	});

	await db
		.update(sessionTbl)
		.set({ activeOrganizationId: org.data.id })
		.where(eq(sessionTbl.userId, ctx.session.userId));

	return { ok: true as const };
});
