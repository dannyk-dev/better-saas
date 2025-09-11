'use client';

import { authClient } from '@/lib/auth/auth-client';
import type { User } from 'better-auth/types';

interface IUseSession {
	user?: User | null;
	isAuthenticated: boolean;
	isLoading: boolean;
	isInitialized: boolean;
	refetch: () => void;
}

export function useSession(): IUseSession {
	const { data, isPending, refetch } = authClient.useSession();

	return {
		user: data?.user,
		isAuthenticated: !!data?.session,
		isLoading: isPending,
		isInitialized: !isPending,
		refetch,
	};
}
