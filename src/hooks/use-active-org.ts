'use client';

import { useOrg, type Org } from '@/components/providers/org-provider';

/**
 * useActiveOrg returns the full organization object corresponding to the
 * currently active organization id.  If no organizations are loaded or no
 * active id is set, it returns null.
 */
export function useActiveOrg() {
	const { orgs, activeOrg } = useOrg();
	if (!activeOrg || !orgs) return null;

	return orgs.find((org: Org) => org.id === activeOrg.id) || null;
}
