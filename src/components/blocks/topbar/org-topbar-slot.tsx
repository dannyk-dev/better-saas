"use client";

import React from 'react';
import OrgSwitcher from '@/components/org/org-switcher';

/**
 * OrgTopbarSlot is a small wrapper around OrgSwitcher intended to be
 * inserted into the right side of the dashboard topbar.  It forwards
 * through to OrgSwitcher and could be extended with additional styling
 * or icons if desired.
 */
export default function OrgTopbarSlot() {
  return (
    <div className="flex items-center gap-2">
      <OrgSwitcher />
    </div>
  );
}