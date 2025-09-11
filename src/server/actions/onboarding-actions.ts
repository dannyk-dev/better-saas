'use server';

import { headers } from 'next/headers';
import { auth } from '@/lib/auth/auth';
import type { ActionResult } from '@/payment/types';
import db from '@/server/db';
import { user, session as sessionTable } from '@/server/db/schema';
import { eq } from 'drizzle-orm';
import { onboardingSchema, type TOnboardingSchema } from '@/types/schemas/onboarding';
import * as z from 'zod';
import { createOrganization } from '@/server/actions/org-actions';
import type { session } from 'better-auth/types';
// import { Session } from 'better-auth/types';

export async function completeOnboarding(
	data: TOnboardingSchema|null,
	skipped?: boolean
): Promise<ActionResult<{ ok: true }>> {
	const h = await headers();

	try {
		const session = await auth.api.getSession({ headers: h });
		if (!session?.user) {
			return { success: false, error: 'UNAUTHORIZED' };
		}

		if (skipped || !data) {
			return await defaultSetup(session.user.id);
		}

		const payload = onboardingSchema.safeParse(data);
		if (payload.error) {
			return {
				success: false,
				error: payload.error.message,
			};
		}

		await db.update(user).set({ hasOnboarded: true }).where(eq(user.id, session.user.id));
		const defaultOrg = await createOrganization({
			name: payload.data.orgName,
			userId: session.user.id,
			slug: payload.data.orgName,
		});

		if (!defaultOrg.data) {
			return { success: false, error: defaultOrg?.message ?? 'UNKNOWN_ERROR' };
		}

		await db.update(sessionTable).set({
			activeOrganizationId: defaultOrg.data?.id,
		});

		return { success: true, data: { ok: true } };
	} catch (e: any) {
		return { success: false, error: e?.message ?? 'UNKNOWN_ERROR' };
	}
}

export async function defaultSetup(userId: string): Promise<ActionResult<{ ok: true }>> {
	await db.update(user).set({ hasOnboarded: true }).where(eq(user.id, userId));
	const defaultOrg = await createOrganization({
		name: 'Default Org',
		userId: userId,
		slug: 'default-org',
	});

	if (!defaultOrg.data) {
    console.log(defaultOrg.error)
		return { success: false, error: defaultOrg?.message ?? 'UNKNOWN_ERROR' };
	}

	await db.update(sessionTable).set({
		activeOrganizationId: defaultOrg.data?.id,
	});

	return {
		success: true,
		data: { ok: true },
	};
}
