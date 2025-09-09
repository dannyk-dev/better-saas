'use server';

import { headers } from 'next/headers';
import { auth } from '@/lib/auth/auth';
import type { ActionResult } from '@/payment/types';
import db from '@/server/db';
import { user } from '@/server/db/schema';
import { eq } from 'drizzle-orm';

export async function completeOnboarding(data: Record<string, unknown>): Promise<ActionResult<{ ok: true }>> {
	const h = await headers();
	try {
		const session = await auth.api.getSession({ headers: h });
		if (!session?.user) {
			return { success: false, error: 'UNAUTHORIZED' };
		}
		// Persist onboarding state.  Adjust the payload keys to match
		// your user schema (e.g. has_onboarded vs hasOnboarded).

		await db.update(user).set({ hasOnboarded: true }).where(eq(user.id, session.user.id));

		return { success: true, data: { ok: true } };
	} catch (e: any) {
		return { success: false, error: e?.message ?? 'UNKNOWN_ERROR' };
	}
}
