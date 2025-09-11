import { auth } from '@/lib/auth/auth';
import { pub } from '@/server/orpc';
import { AuthContract, type TAuthContractOutput } from '@/server/orpc/contracts/auth.contract';
import type { TUserSchema } from '@/types/schemas/auth.schema';
import { implement } from '@orpc/server';
import type { User } from 'better-auth/types';
import { headers } from 'next/headers';

const os = implement(AuthContract);

const authRouter = os.router({
	auth: {
		signUp: os.auth.signUp.handler(async ({ input }) => {
			const res = await auth.api.signUpEmail({ body: input, headers: await headers() });
			return { success: true, data: res.user as User };
		}),

		signIn: os.auth.signIn.handler(async ({ input }) => {
			const res = await auth.api.signInEmail({ body: input, headers: await headers() });
			return { success: true, data: res.user as User };
		}),

		signOut: os.auth.signOut.handler(async () => {
			await auth.api.signOut({ headers: await headers() });
			return { success: true, data: { ok: true } };
		}),

		getSession: os.auth.getSession.handler(async () => {
			const session = await auth.api.getSession({ headers: await headers() });

			return {
				success: true,
				data: session ? { session: session.session, user: session.user  } : undefined,
			};
		}),

		updateUser: os.auth.updateUser.handler(async ({ input }) => {
			await auth.api.updateUser({ body: input, headers: await headers() });
			return { success: true, data: { ok: true } };
		}),
	},
});

export default authRouter;
