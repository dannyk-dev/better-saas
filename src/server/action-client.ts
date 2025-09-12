// import 'server-only';
// 'use server'

import { auth } from '@/lib/auth/auth';
import type { OrgRole } from '@/server/actions/org-actions';
import db from '@/server/db';
import { member } from '@/server/db/schema';
import { eq } from 'drizzle-orm';
import { createSafeActionClient, DEFAULT_SERVER_ERROR_MESSAGE } from 'next-safe-action';
// import { headers } from 'next/headers';
import z from 'zod';

class ActionError extends Error {}

export const actionClient = createSafeActionClient({
	defineMetadataSchema() {
		return z.object({
			actionName: z.string(),
		});
	},
	handleServerError(e) {
		console.error('Action error:', e.message);

		if (e instanceof ActionError) {
			return e.message;
		}

		return DEFAULT_SERVER_ERROR_MESSAGE;
	},
}).use(async ({ next, clientInput, metadata, ctx }) => {
	console.log('LOGGING MIDDLEWARE');

	const startTime = performance.now();

	const result = await next({
		ctx: {
			...ctx,
			db,
		},
	});

	const endTime = performance.now();

	console.log('Result ->', result);
	console.log('Client input ->', clientInput);
	console.log('Metadata ->', metadata);
	console.log('Action execution took', endTime - startTime, 'ms');

	return result;
});

export const authActionClient = actionClient.use(async ({ next, ctx }) => {
	const getHeaders = async () => (await import('next/headers')).headers();

	const res = await auth.api.getSession({
		headers: await getHeaders(),
		query: {
			disableCookieCache: true,
		},
	});

	if (!res?.session) {
		throw new ActionError('Invalid Session');
	}

	return next({
		ctx: {
			...ctx,
			headers: await getHeaders(),
			user: res.user,
			session: res.session,
		},
	});
});

export const adminActionClient = authActionClient.use(async ({ next, ctx }) => {
	const protectedRoles: OrgRole[] = ['admin', 'owner'];
	const [user] = await ctx.db.select().from(member).where(eq(member.userId, ctx.session.id)).limit(1);

	if (!user) {
		throw new ActionError('No user found for this organization');
	}

	const role: OrgRole = user.role as OrgRole;

	if (!protectedRoles.includes(role)) {
		throw new ActionError('Only admins or owners can do this action');
	}

	return next({
		ctx,
	});
});
