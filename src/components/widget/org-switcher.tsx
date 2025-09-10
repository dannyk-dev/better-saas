"use client";

import type React from 'react';
import { useOrg } from '@/components/providers/org-provider';
import { Select, SelectItem, Skeleton, type SharedSelection } from '@heroui/react';

/**
 * OrgSidebarSwitcher renders a HeroUI <Select> for switching the active
 * organization in the dashboard sidebar.  It shows a loading skeleton
 * while the organization list is being fetched.
 */
export default function OrgSidebarSwitcher() {
  const { orgs, activeOrg, setActive } = useOrg();

  if (!orgs) {
    return <Skeleton className="h-9 w-full rounded-md" />;
  }

  const handleChange = async (keys: SharedSelection) => {
    const id = Array.from(keys)[0] as string | undefined;
    if (id) {
      await setActive(id);
    }
  };

  return (
    <Select
      aria-label="Active organization"
      size="sm"
      className="w-full"
      variant="flat"
      label="My Orgs"
      selectedKeys={activeOrg ? [activeOrg.id] : []}
      onSelectionChange={(e: SharedSelection) => handleChange(e)}
    >
      {orgs.map((org) => (
        <SelectItem key={org.id} >
          {org.name}
        </SelectItem>
      ))}
    </Select>
  );
}
