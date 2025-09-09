"use client";

import type React from 'react';
import { createContext, useContext, useEffect, useCallback, useState } from 'react';
import * as OrgActions from '@/server/actions/org-actions';

/**
 * OrgContext holds the list of organizations available to the current user as
 * well as the identifier of the active organization.  Consumers can call
 * refresh() to reload the organizations from the backend and setActive() to
 * change the active organization.  The actual server updates (via
 * setActiveOrganization) are handled inside setActive().
 */
interface OrgContextValue {
  organizations: any[];
  activeOrgId: string | null;
  refresh: () => Promise<void>;
  setActive: (id: string) => Promise<void>;
}

const OrgContext = createContext<OrgContextValue | undefined>(undefined);

export function OrgProvider({ children }: { children: React.ReactNode }) {
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [activeOrgId, setActiveOrgId] = useState<string | null>(null);

  /**
   * Reload the organizations from the server and update local state.  If the
   * server marks an organization as active (e.g. via user preferences), use
   * that as the initial activeOrgId.
   */
  const refresh = useCallback(async () => {
    const result = await OrgActions.getOrganizations();
    if (result.success) {
      setOrganizations(result.data);
      // Attempt to detect the server's active organization by looking for
      // a property "isActive" or similar on returned objects.  If not
      // present, preserve the current activeOrgId.
      const active = result.data.find((org: any) => org.isActive);
      if (active) {
        setActiveOrgId(active.id);
      }
    }
  }, []);

  /**
   * Set the active organization both locally and on the server.  If the
   * operation fails, the error is silently ignored and the local state is
   * reverted on the next refresh() call.
   */
  const setActive = useCallback(async (id: string) => {
    setActiveOrgId(id);
    await OrgActions.setActiveOrganization(id);
  }, []);

  useEffect(() => {
    // Load organizations on mount.  Ignore errors; the component will
    // render without organizations if the call fails.  Consumers may call
    // refresh() manually to retry.
    refresh();
  }, [refresh]);

  return (
    <OrgContext.Provider value={{ organizations, activeOrgId, refresh, setActive }}>
      {children}
    </OrgContext.Provider>
  );
}

/**
 * Hook to access the organization context.  Throws if used outside of
 * OrgProvider.
 */
export function useOrg() {
  const ctx = useContext(OrgContext);
  if (!ctx) {
    throw new Error('useOrg must be used within an OrgProvider');
  }
  return ctx;
}
