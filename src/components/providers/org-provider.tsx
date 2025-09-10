'use client';

import type React from 'react';
import { createContext, useContext,  useMemo,} from 'react';
import { authClient } from '@/lib/auth/auth-client';


export type Org = { id: string; name: string; slug?: string };

interface OrgContextValue {

	activeOrg: Org | null;
	isLoadingActive: boolean;
	setActive: (id: string) => Promise<string | null>;
	refresh: () => void;
	refreshActive: () => void;
}

const OrgContext = createContext<OrgContextValue | null>(null);

export function OrgProvider({ children }: { children: React.ReactNode }) {
	const {
		data: activeOrg,
		refetch: refreshActive,
		isPending: isLoadingActiveOrgs,
		isRefetching: isRefetchingActiveOrg,
	} = authClient.useActiveOrganization();

	const setActive = async (id: string) => {
		const result = await authClient.organization.setActive({ organizationId: id });

		if (result.data) {
			return result.data.id;
		}

		return activeOrg?.id ?? null;
	};

	const refresh = () => {
		refreshActive();
	};


	return (
		<OrgContext.Provider
			value={{
				activeOrg: activeOrg,
				isLoadingActive: isLoadingActiveOrgs || isRefetchingActiveOrg,
				setActive,
				refresh,
				refreshActive,
			}}
		>
			{children}
		</OrgContext.Provider>
	);
}

export function useOrg(): OrgContextValue {
	const ctx = useContext(OrgContext);
	if (!ctx) {
		throw new Error('useOrg must be used within OrgProvider');
	}

	return ctx;
}
