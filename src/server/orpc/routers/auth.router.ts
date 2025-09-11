import { auth } from '@/lib/auth/auth';
import { creditService } from '@/lib/credits';
import { AuthContract, type TAuthContractOutput } from '@/server/orpc/contracts/auth.contract';
import { implement } from '@orpc/server';
import type { User } from 'better-auth/types';
import { headers } from 'next/headers';

const os = implement(AuthContract);

const authRouter = os.router({
	signUp: os.signUp
		.handler(async ({ input }) => {
			const res = await auth.api.signUpEmail({ body: input, headers: await headers() });
			await creditService.initializeCredits(res.user.id);

			return { success: true, data: res.user };
		})
		.callable()
		.actionable(),

	signIn: os.signIn
		.handler(async ({ input }) => {
			const res = await auth.api.signInEmail({ body: input, headers: await headers() });
			return { success: true, data: res.user as User };
		})
		.actionable(),

	signOut: os.signOut
		.handler(async () => {
			await auth.api.signOut({ headers: await headers() });
			return { success: true, data: { ok: true } };
		})
		.actionable(),

	getSession: os.getSession
		.handler(async () => {
			const session = await auth.api.getSession({ headers: await headers() });

			return {
				success: true,
				data: session ? { session: session.session, user: session.user } : undefined,
			};
		})
		.callable(),

	updateUser: os.updateUser.handler(async ({ input }) => {
		await auth.api.updateUser({ body: input, headers: await headers() });
		return { success: true, data: { ok: true } };
	}),
});

export default authRouter;
