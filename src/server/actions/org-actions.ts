'use server';

import { headers } from 'next/headers';
import { auth } from '@/lib/auth/auth';

export async function createOrganization(input: { name: string }) {
  const hdrs = await headers();
  return auth.organization.create({ headers: hdrs, body: { name: input.name } });
}

export async function updateOrganization(input: { organizationId: string; name?: string; slug?: string }) {
  const hdrs = await headers();
  return auth.organization.update({ headers: hdrs, body: input });
}

export async function deleteOrganization(input: { organizationId: string }) {
  const hdrs = await headers();
  return auth.organization.delete({ headers: hdrs, body: input });
}

export async function listOrganizations() {
  const hdrs = await headers();
  return auth.organization.list({ headers: hdrs });
}

export async function setActiveOrganization(input: { organizationId: string }) {
  const hdrs = await headers();
  return auth.organization.setActive({ headers: hdrs, body: input });
}

export async function inviteMember(input: { organizationId: string; email: string; role: string }) {
  const hdrs = await headers();
  return auth.organization.inviteMember({ headers: hdrs, body: input });
}

export async function listMembers(input: { organizationId: string }) {
  const hdrs = await headers();
  return auth.organization.listMembers({ headers: hdrs, query: input });
}

export async function updateMemberRole(input: { organizationId: string; userId: string; role: string }) {
  const hdrs = await headers();
  return auth.organization.updateMember({ headers: hdrs, body: input });
}

export async function removeMember(input: { organizationId: string; userId: string }) {
  const hdrs = await headers();
  return auth.organization.removeMember({ headers: hdrs, body: input });
}

export async function leaveOrganization(input: { organizationId: string }) {
  const hdrs = await headers();
  return auth.organization.leave({ headers: hdrs, body: input });
}
