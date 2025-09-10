'use server';

import { headers } from 'next/headers';
import { auth } from '@/lib/auth/auth';
import type { ActionResult } from '@/payment/types';
import { APIError, type User } from 'better-auth';
import { authClient } from '@/lib/auth/auth-client';

/** Roles used in org operations */
export type OrgRole = 'member' | 'admin' | 'owner';

/** Utility: run an authenticated callback and wrap in ActionResult */
async function withAuth<T>(fn: (user: User) => Promise<T>): Promise<ActionResult<T>> {
	const h = await headers();
	const session = await auth.api.getSession({ headers: h }).catch(() => null);

	if (!session?.user) return { success: false, error: 'UNAUTHORIZED' } as const;

	try {
		const data = await fn(session.user);
		return { success: true, data } as const;
	} catch (e: any) {
		return { success: false, error: e?.message ?? 'UNKNOWN_ERROR' } as const;
	}
}

/* ──────────────── Organizations ──────────────── */

/** List organizations for current user */
export async function listOrganizations() {
	return withAuth(async () => auth.api.listOrganizations());
} // Docs: list() /organization/list :contentReference[oaicite:0]{index=0}

export async function getFullOrganization(input?: {
	organizationId?: string;
	organizationSlug?: string;
	membersLimit?: number;
}) {
	return withAuth(async () =>
		auth.api.getFullOrganization({
			headers: await headers(),
			query: {
				organizationId: input?.organizationId,
				organizationSlug: input?.organizationSlug,
			},
		})
	);
}

export async function checkOrganizationSlug(input: { slug: string }) {
	return withAuth(async () =>
		auth.api.checkOrganizationSlug({
			body: { slug: input.slug },
		})
	);
} // Docs: checkSlug /organization/check-slug :contentReference[oaicite:2]{index=2}

/** Create organization (server can optionally specify userId) */
export async function createOrganization(input: {
	name: string;
	slug: string;
	logo?: string;
	metadata?: Record<string, object>;
	keepCurrentActiveOrganization?: boolean;
	userId?: string;
}) {
	return withAuth(async (user) =>
		auth.api.createOrganization({
			headers: await headers(),
			body: {
				name: input.name,
				slug: input.slug,
				logo: input.logo,
				metadata: input.metadata,
				userId: input.userId ?? user.id,
				keepCurrentActiveOrganization: !!input.keepCurrentActiveOrganization,
			},
		})
	);
} // Docs: create /organization/create :contentReference[oaicite:3]{index=3}

/** Update organization */
export async function updateOrganization(input: {
	organizationId?: string;
	data: {
		name?: string | undefined;
		slug?: string | undefined;
		logo?: string | undefined;
		metadata?: Record<string, object> | undefined;
	};
}) {
	return withAuth(async () =>
		auth.api.updateOrganization({
			headers: await headers(),
			body: {
				organizationId: input.organizationId,
				data: input.data,
			},
		})
	);
} // Docs: update /organization/update :contentReference[oaicite:4]{index=4}

/** Delete organization */
export async function deleteOrganization(input: { organizationId: string }) {
	return withAuth(async () =>
		auth.api
			.deleteOrganization({
				headers: await headers(),
				body: { organizationId: input.organizationId },
			})
			.then(() => ({ deleted: true }))
	);
} // Docs: delete /organization/delete :contentReference[oaicite:5]{index=5}

/** Set or unset active organization (pass null to unset) */
export async function setActiveOrganization(input: { organizationId?: string | null; organizationSlug?: string }) {
	return withAuth(async () =>
		auth.api
			.setActiveOrganization({
				body: {
					organizationId: input.organizationId ?? null,
					organizationSlug: input.organizationSlug,
				},
			})
			.then(() => ({ active: true }))
	);
} // Docs: setActive /organization/set-active :contentReference[oaicite:6]{index=6}

/* ──────────────── Invitations ──────────────── */

/** Invite a user by email; optional resend and teamId */
export async function inviteMember(input: {
	email: string;
	role: OrgRole | OrgRole[];
	organizationId?: string;
	resend?: boolean;
	teamId?: string;
}) {
	return withAuth(async () =>
		auth.api.createInvitation({
			body: {
				email: input.email,
				role: input.role,
				organizationId: input.organizationId,
				resend: input.resend,
				// teamId: input.teamId,
			},
		})
	);
}

export async function acceptInvitation(input: { invitationId: string }) {
	return withAuth(async () => auth.api.acceptInvitation({ body: { invitationId: input.invitationId } }));
}

/** Reject invitation */
export async function rejectInvitation(input: { invitationId: string }) {
	return withAuth(async () => auth.api.rejectInvitation({ body: { invitationId: input.invitationId } }));
}

export async function cancelInvitation(input: { invitationId: string }) {
	return withAuth(async () => auth.api.cancelInvitation({ body: { invitationId: input.invitationId } }));
}

export async function getInvitation(input: { id: string }) {
	return withAuth(async () =>
		auth.api.getInvitation({
			headers: await headers(),
			query: { id: input.id },
		})
	);
}

export async function listInvitations(input?: { organizationId?: string }) {
	return withAuth(async () =>
		auth.api.listInvitations({
			query: { organizationId: input?.organizationId },
		})
	);
}

export async function listUserInvitations(input?: { organizationId?: string }) {
	return withAuth(async () =>
		auth.api.listInvitations({
			query: input?.organizationId ? { organizationId: input.organizationId } : undefined,
		})
	);
}


export interface ListMembersQuery {
	organizationId?: string;
	limit?: number;
	offset?: number;
	sortBy?: string;
	sortDirection?: 'asc' | 'desc';
	filterField?: string;
	filterOperator?: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'nin' | 'contains';
	filterValue?: string;
}

/** List members with pagination/sorting/filtering */
export async function listMembers(query?: ListMembersQuery) {
	return withAuth(async () => {
		if (!query?.organizationId) throw new APIError('BAD_REQUEST');

		const { data, success } = await getFullOrganization({
			organizationId: query.organizationId,
		});

		if (success && data) {
			return data.members;
		}

		throw new APIError('NOT_FOUND');
	});
}

/** Update a member's role (string or string[]) */
export async function updateMemberRole(input: { memberId: string; role: OrgRole | OrgRole[]; organizationId?: string }) {
	return withAuth(async () =>
		auth.api
			.updateMemberRole({
				body: {
					memberId: input.memberId,
					role: input.role,
					organizationId: input.organizationId,
				},
			})
			.then(() => ({ updated: true }))
	);
}

export async function removeMember(input: { memberIdOrEmail: string; organizationId?: string }) {
	return withAuth(async () =>
		auth.api
			.removeMember({
				body: {
					memberIdOrEmail: input.memberIdOrEmail,
					organizationId: input.organizationId,
				},
			})
			.then(() => ({ removed: true }))
	);
}

export async function addMember(input: {
	userId: string;
	role: OrgRole | OrgRole[];
	organizationId?: string;
	teamId?: string;
}) {
	return withAuth(async () =>
		auth.api.addMember({
			body: {
				userId: input.userId,
				role: input.role,
				organizationId: input.organizationId,
			},
		})
	);
}

export async function getActiveMember() {
	return withAuth(async () => auth.api.getActiveMember({ headers: await headers() }));
}

export async function leaveOrganization(input: { organizationId: string }) {
	return withAuth(async () =>
		auth.api
			.leaveOrganization({
				body: { organizationId: input.organizationId },
			})
			.then(() => ({ left: true }))
	);
}

export async function hasPermission(input: { permissions: Record<string, string[]> }) {
	return withAuth(async () =>
		auth.api.hasPermission({
			headers: await headers(),
			body: { permissions: input.permissions },
		})
	);
}

export async function createOrgRole(input: {
	role: string;
	permission?: Record<string, string[]>;
	organizationId?: string;
}) {
	return withAuth(async () =>
		auth.api.createOrgRole({
			headers: await headers(),
			body: {
				role: input.role,
				permission: input.permission,
				organizationId: input.organizationId,
			},
		})
	);
}

export async function updateOrgRole(input: {
	roleName?: string;
	roleId?: string;
	organizationId?: string;
	data: { permission?: Record<string, string[]>; roleName?: string };
}) {
	return withAuth(async () =>
		auth.api.updateOrgRole({
			headers: await headers(),
			body: {
				roleName: input.roleName,
				roleId: input.roleId,
				organizationId: input.organizationId,
				data: input.data,
			},
		})
	);
}

export async function deleteOrgRole(input: { roleName?: string; roleId?: string; organizationId?: string }) {
	return withAuth(async () =>
		auth.api.deleteOrgRole({
			headers: await headers(),
			body: {
				roleName: input.roleName,
				roleId: input.roleId,
				organizationId: input.organizationId,
			},
		})
	);
}

export async function listOrgRoles(input?: { organizationId?: string }) {
	return withAuth(async () =>
		auth.api.listOrgRoles({
			headers: await headers(),
			query: { organizationId: input?.organizationId },
		})
	);
}

export async function getOrgRole(input: { roleName?: string; roleId?: string; organizationId?: string }) {
	return withAuth(async () =>
		auth.api.getOrgRole({
			headers: await headers(),
			query: {
				roleName: input.roleName,
				roleId: input.roleId,
				organizationId: input.organizationId,
			},
		})
	);
}


export async function createTeam(input: { name: string; organizationId?: string }) {
	return withAuth(async () =>
		auth.api.createTeam({
			headers: await headers(),
			body: { name: input.name, organizationId: input.organizationId },
		})
	);
}

export async function listTeams(input?: { organizationId?: string }) {
	return withAuth(async () =>
		auth.api.listOrganizationTeams({
			headers: await headers(),
			query: { organizationId: input?.organizationId },
		})
	);
}

export async function updateTeam(input: {
	teamId: string;
	data: { name?: string; organizationId?: string; createdAt?: Date; updatedAt?: Date };
}) {
	return withAuth(async () =>
		auth.api.updateTeam({
			headers: await headers(),
			body: { teamId: input.teamId, data: input.data },
		})
	);
}

export async function removeTeam(input: { teamId: string; organizationId?: string }) {
	return withAuth(async () =>
		auth.api.removeTeam({
			headers: await headers(),
			body: { teamId: input.teamId, organizationId: input.organizationId },
		})
	);
}

export async function setActiveTeam(input: { teamId?: string }) {
	return withAuth(async () =>
		auth.api.setActiveTeam({
			headers: await headers(),
			body: { teamId: input.teamId },
		})
	);
}

export async function listUserTeams() {
	return withAuth(async () => auth.api.listUserTeams());
}

export async function listTeamMembers(input?: { teamId?: string }) {
	return withAuth(async () =>
		auth.api.listTeamMembers({
			headers: await headers(),
			body: { teamId: input?.teamId },
		})
	);
}

export async function addTeamMember(input: { teamId: string; userId: string }) {
	return withAuth(async () =>
		auth.api.addTeamMember({
			headers: await headers(),
			body: { teamId: input.teamId, userId: input.userId },
		})
	);
}

export async function removeTeamMember(input: { teamId: string; userId: string }) {
	return withAuth(async () =>
		auth.api.removeTeamMember({
			headers: await headers(),
			body: { teamId: input.teamId, userId: input.userId },
		})
	);
}
