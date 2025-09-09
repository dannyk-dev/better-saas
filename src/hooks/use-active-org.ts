"use client";

import { useOrg } from '@/components/providers/org-provider';

/**
 * useActiveOrg returns the full organization object corresponding to the
 * currently active organization id.  If no organizations are loaded or no
 * active id is set, it returns null.
 */
export function useActiveOrg() {
  const { orgs, activeOrgId } = useOrg();
  if (!activeOrgId) return null;

  return orgs.find((org: any) => org.id === activeOrgId) || null;
}
