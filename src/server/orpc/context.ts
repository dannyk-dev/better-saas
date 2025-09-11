import { headers, cookies } from 'next/headers';
import { auth } from '@/lib/auth/auth';

export async function createContext() {
	const h = await headers();
	const session = await auth.api.getSession({ headers: h }).catch(() => null);

	return {
		headers: h,
		cookies: await cookies(),
		session,
		user: session?.user ?? null,
	};
}
export type OrpcContext = Awaited<ReturnType<typeof createContext>>;
