"use client";

import React from 'react';
import { Select, SelectItem } from '@heroui/react';
import { useOrg } from '@/components/providers/org-provider';

/**
 * OrgSwitcher renders a simple dropdown that allows the user to change the
 * active organization.  The list of organizations and the current active
 * organization come from the OrgProvider.  When a new organization is
 * selected, it calls setActive() which updates both local and server
 * state via the OrgProvider.  If there are no organizations, nothing is
 * rendered.
 */
export default function OrgSwitcher() {
  const { organizations, activeOrgId, setActive } = useOrg();
  if (!organizations || organizations.length === 0) return null;
  return (
    <Select
      selectedKeys={activeOrgId ? [activeOrgId] : []}
      onSelectionChange={(keys) => {
        const id = Array.from(keys)[0] as string;
        if (id) {
          setActive(id);
        }
      }}
      className="w-48"
    >
      {organizations.map((org: any) => (
        <SelectItem key={org.id} value={org.id} textValue={org.name}>
          {org.name}
        </SelectItem>
      ))}
    </Select>
  );
}