'use client';

import type React from 'react';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { listOrganizations, setActiveOrganization as setActiveOrganizationAction } from '@/server/actions/org-actions';
import { authClient } from '@/lib/auth/auth-client';

/**
 * OrgProvider is a context provider that loads the current user's
 * organizations via the Better‑Auth organization plugin and exposes
 * helper functions for switching the active organization and
 * refreshing the organization list.  Components can call
 * `useOrg()` to access the list of orgs, the active org id, and
 * functions to set or refresh the active org.
 */

export type Org = { id: string; name: string; slug?: string };

interface OrgContextValue {
	orgs: Org[]|null;
	/**
	 * The id of the currently active organization.  May be null if the user
	 * belongs to no organizations.
	 */
	activeOrg: Org|null;
	/** True while loading the organization list or changing the active org. */
	loading: boolean;
	/**
	 * Set the active organization.  Updates internal state only after the
	 * server action succeeds.
	 */
	setActive: (id: string) => Promise<void>;
	/**
	 * Reload the list of organizations from the server.  When called,
	 * `loading` will be true until the request completes.
	 */
	refresh: () => void;
}

const OrgContext = createContext<OrgContextValue | null>(null);

export function OrgProvider({ children }: { children: React.ReactNode }) {
	const {
		data: activeOrg,
		refetch: refreshActive,
		isPending: isLoadingActiveOrgs,
	} = authClient.useActiveOrganization();
	const { data, refetch: refreshOrgs, isPending: isLoadingOrgs } = authClient.useListOrganizations();

	const setActive = async (id: string) => {
		const result = await setActiveOrganizationAction({ organizationId: id });

		if (result.success) {
			refreshActive();
		}
	};

  const refresh = () => {
    refreshOrgs();
    refreshActive();
  }

	const isLoading = useMemo(() => isLoadingActiveOrgs || isLoadingOrgs, [isLoadingActiveOrgs, isLoadingOrgs]);

	return (
		<OrgContext.Provider
			value={{
				orgs: data,
        activeOrg: activeOrg,
        loading: isLoading,
        setActive,
        refresh
			}}
		>
			{children}
		</OrgContext.Provider>
	);
}

/**
 * Custom hook to access the organization context.  Must be used
 * within an <OrgProvider>.
 */
export function useOrg(): OrgContextValue {
	const ctx = useContext(OrgContext);
	if (!ctx) {
		throw new Error('useOrg must be used within OrgProvider');
	}
	return ctx;
}
