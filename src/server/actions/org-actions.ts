'use server';

import { headers } from 'next/headers';
import { auth } from '@/lib/auth/auth';
import type { ActionResult } from '@/payment/types';
import type { User } from 'better-auth';

export type OrgRole = 'member' | 'admin' | 'owner';
/**
 * Helper to run a callback requiring authentication and wrap the result
 * in an ActionResult.  If the user is not authenticated the error
 * "UNAUTHORIZED" is returned.  If the callback throws, its message
 * is returned as the error.
 */
async function withAuth<T>(fn: (user: User) => Promise<T>): Promise<ActionResult<T>> {
	const h = await headers();
  const session = await auth.api.getSession({ headers: h });

	try {
		if (!session?.user) {
			return { success: false, error: 'UNAUTHORIZED' } as const;
		}
	} catch {
		return { success: false, error: 'UNAUTHORIZED' } as const;
	}
	try {
		const data = await fn(session.user);
		return { success: true, data } as const;
	} catch (e: any) {
		return { success: false, error: e?.message ?? 'UNKNOWN_ERROR' } as const;
	}
}

// Internal utility to access the organization plugin.  Cast to any
// because the Better‑Auth plugin surface is not included in TypeScript
// definitions.
// const orgClient = () => auth.api;

/**
 * List all organizations that the current user belongs to.  Returns an
 * array of organizations with at least `id`, `name` and optional `slug`.
 */
export async function listOrganizations(): Promise<ActionResult<any[]>> {
	return withAuth(async () => {
		const list = await auth.api.listOrganizations();
    console.log(list)
		return list;
	});
}

/**
 * Alias for listOrganizations, retained for backwards compatibility.
 */
export async function getOrganizations(): Promise<ActionResult<any[]>> {
	return listOrganizations();
}

/**
 * Create a new organization.  Accepts an object with name and
 * optional slug.  Returns the created organization.  For
 * backwards compatibility a positional overload is exported below.
 */
export async function createOrganization(input: { name: string; slug?: string }): Promise<ActionResult<any>> {
	return withAuth(async (user) => {
		return await auth.api.createOrganization({
			body: {
				name: input.name,
				slug: input.slug ?? input.name,
        userId: user.id,
        keepCurrentActiveOrganization: false
			},
      headers: await headers()
		});
	});
}

// Backwards‑compatible overload for createOrganization(name, slug?)
export async function createOrganizationLegacy(name: string, slug?: string): Promise<ActionResult<any>> {
	return createOrganization({ name, slug });
}

/**
 * Update an organization.  Accepts an object with organizationId and
 * partial fields to update.  The plugin requires id and the update
 * payload properties.
 */
export async function updateOrganization(input: {
	organizationId: string;
	name?: string;
	slug?: string;
}): Promise<ActionResult<any>> {
	return withAuth(async () => {
		const { organizationId, name, slug } = input;
		return await auth.api.updateOrganization({ body: { organizationId, data: { name, slug } }, headers: {} });
	});
}

// Backwards‑compatible overload for updateOrganization(id, data)
export async function updateOrganizationLegacy(
	id: string,
	data: { name?: string; slug?: string }
): Promise<ActionResult<any>> {
	return updateOrganization({ organizationId: id, ...data });
}

/**
 * Delete an organization.  Accepts an object with organizationId.
 */
export async function deleteOrganization(input: {
	organizationId: string;
}): Promise<ActionResult<{ deleted: boolean }>> {
	return withAuth(async () => {
		await auth.api.deleteOrganization({ body: { organizationId: input.organizationId }, headers: {} });
		return { deleted: true };
	});
}

// Backwards‑compatible overload for deleteOrganization(id)
export async function deleteOrganizationLegacy(id: string): Promise<ActionResult<{ deleted: boolean }>> {
	return deleteOrganization({ organizationId: id });
}

/**
 * Set the active organization for the current user.
 */
export async function setActiveOrganization(input: {
	organizationId: string;
}): Promise<ActionResult<{ active: boolean }>> {
	return withAuth(async () => {
		await auth.api.setActiveOrganization({ body: { organizationId: input.organizationId }, headers: await headers() });
		return { active: true };
	});
}

// Backwards‑compatible overload for setActiveOrganization(id)
export async function setActiveOrganizationLegacy(id: string): Promise<ActionResult<{ active: boolean }>> {
	return setActiveOrganization({ organizationId: id });
}

/**
 * Invite a member to an organization.  Accepts an object with
 * organizationId, email and optional role.
 */
export async function inviteMember(input: {
	organizationId: string;
	email: string;
	role?: OrgRole;
}): Promise<ActionResult<any>> {
	return withAuth(async () => {
		return await auth.api.createInvitation({
			body: {
				organizationId: input.organizationId,
				email: input.email,
				role: input.role ?? 'member',
			},
		});
	});
}

// Backwards‑compatible overload for inviteMember(organizationId, email, role?)
export async function inviteMemberLegacy(
	organizationId: string,
	email: string,
	role?: string
): Promise<ActionResult<any>> {
	return inviteMember({ organizationId, email, role });
}

/**
 * List all members of an organization.  Accepts an object with
 * organizationId.
 */
export async function listMembers(input: { organizationId: string }): Promise<ActionResult<any[]>> {
	return withAuth(async () => {
		const members = await auth.api.listUsers({ query: {} });
		return members;
	});
}

// Backwards‑compatible overload for listMembers(organizationId)
export async function listMembersLegacy(organizationId: string): Promise<ActionResult<any[]>> {
	return listMembers({ organizationId });
}

/**
 * Update a member's role in an organization.  Accepts an object with
 * organizationId, userId and new role.
 */
export async function updateMemberRole(input: {
	organizationId: string;
	userId: string;
	role: OrgRole;
}): Promise<ActionResult<{ updated: boolean }>> {
	return withAuth(async () => {
		await auth.api.updateMemberRole({
			body: {
				organizationId: input.organizationId,
				memberId: input.userId,
				role: input.role,
			},
		});
		return { updated: true };
	});
}

// Backwards‑compatible overload for updateMemberRole(organizationId, userId, role)
export async function updateMemberRoleLegacy(
	organizationId: string,
	userId: string,
	role: OrgRole
): Promise<ActionResult<{ updated: boolean }>> {
	return updateMemberRole({ organizationId, userId, role });
}

/**
 * Remove a member from an organization.  Accepts an object with
 * organizationId and userId.
 */
export async function removeMember(input: {
	organizationId: string;
	userId: string;
}): Promise<ActionResult<{ removed: boolean }>> {
	return withAuth(async () => {
		await auth.api.removeMember({
			body: {
				organizationId: input.organizationId,
				memberIdOrEmail: input.userId,
			},
		});
		return { removed: true };
	});
}

// Backwards‑compatible overload for removeMember(organizationId, userId)
export async function removeMemberLegacy(
	organizationId: string,
	userId: string
): Promise<ActionResult<{ removed: boolean }>> {
	return removeMember({ organizationId, userId });
}

/**
 * Leave an organization.  Accepts an object with organizationId.
 */
export async function leaveOrganization(input: { organizationId: string }): Promise<ActionResult<{ left: boolean }>> {
	return withAuth(async () => {
		await auth.api.leaveOrganization({ body: { organizationId: input.organizationId } });
		return { left: true };
	});
}

// Backwards‑compatible overload for leaveOrganization(organizationId)
export async function leaveOrganizationLegacy(organizationId: string): Promise<ActionResult<{ left: boolean }>> {
	return leaveOrganization({ organizationId });
}
