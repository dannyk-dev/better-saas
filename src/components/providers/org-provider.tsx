"use client";

import type React from 'react';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  listOrganizations,
  setActiveOrganization as setActiveOrganizationAction,
} from '@/server/actions/org-actions';

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
  orgs: Org[];
  /**
   * The id of the currently active organization.  May be null if the user
   * belongs to no organizations.
   */
  activeOrgId: string | null;
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
  refresh: () => Promise<void>;
}

const OrgContext = createContext<OrgContextValue | null>(null);

export function OrgProvider({ children }: { children: React.ReactNode }) {
  const [orgs, setOrgs] = useState<Org[]>([]);
  const [activeOrgId, setActiveOrgId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    setLoading(true);
    const result = await listOrganizations();
    if (result.success) {
      const list = Array.isArray(result.data) ? (result.data as Org[]) : [];
      setOrgs(list);
      if (!activeOrgId && list.length > 0) {
        setActiveOrgId(list[0].id);
      }
    }
    setLoading(false);
  };

  const setActive = async (id: string) => {
    setLoading(true);
    const result = await setActiveOrganizationAction(id);
    if (result.success) {
      setActiveOrgId(id);
    }
    setLoading(false);
  };

  useEffect(() => {
    // Initial load of organizations on mount
    void refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value = useMemo(
    () => ({ orgs, activeOrgId, loading, setActive, refresh }),
    [orgs, activeOrgId, loading]
  );

  return <OrgContext.Provider value={value}>{children}</OrgContext.Provider>;
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
