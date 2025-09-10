"use client";

import type React from 'react';
import { useOrg } from '@/components/providers/org-provider';
import { Select, SelectItem, Skeleton, type SharedSelection } from '@heroui/react';
import { useState } from 'react';


export default function OrgSidebarSwitcher() {
  const { orgs, activeOrg, setActive, refresh, isLoadingActive } = useOrg();
  const [activeOrgId, setActiveOrgId] = useState(activeOrg?.id); // optimistic

  if (!orgs) {
    return <Skeleton className="h-9 w-full rounded-md" />;
  }

  const handleChange = async (keys: SharedSelection) => {
    const id = Array.from(keys)[0] as string | undefined;
    if (id) {
      const newId = await setActive(id);
      if (newId) {
        setActiveOrgId(newId);
        refresh();
      }
    }
  };

  return (
    <Select
      aria-label="Active organization"
      size="sm"
      className="w-full"
      variant="flat"
      label="My Orgs"
      isLoading={isLoadingActive}
      selectedKeys={activeOrgId ? [activeOrgId] : []}
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
