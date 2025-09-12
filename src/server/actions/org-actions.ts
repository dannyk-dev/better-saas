

import { auth } from '@/lib/auth/auth';
import { authActionClient, adminActionClient } from '@/server/action-client';
import { CreateOrgSchema, UpdateOrgSchema, OrgIdSchema, OrgSlugSchema, InviteSchema } from '@/types/schemas/org.schema';
import { z } from 'zod';

export type OrgRole = 'member' | 'admin' | 'owner';

export const listOrganizations = authActionClient
	.metadata({ actionName: 'listOrganizations' })
	.inputSchema(z.void())
	.action(async ({ ctx }) => auth.api.listOrganizations({ headers: ctx.headers }));

export const getFullOrganization = authActionClient
	.metadata({ actionName: 'getFullOrganization' })
	.inputSchema(z.object({ organizationId: z.string().optional(), organizationSlug: z.string().optional() }))
	.action(async ({ parsedInput, ctx }) => auth.api.getFullOrganization({ headers: ctx.headers, query: parsedInput }));

export const checkOrganizationSlug = authActionClient
	.metadata({ actionName: 'checkOrganizationSlug' })
	.inputSchema(OrgSlugSchema)
	.action(async ({ ctx, parsedInput }) => auth.api.checkOrganizationSlug({ body: parsedInput, headers: ctx.headers }));

export const createOrganization = authActionClient
	.metadata({ actionName: 'createOrganization' })
	.inputSchema(CreateOrgSchema)
	.action(async ({ ctx, parsedInput }) => auth.api.createOrganization({ headers: ctx.headers, body: parsedInput }));

export const updateOrganization = authActionClient
	.metadata({ actionName: 'updateOrganization' })
	.inputSchema(UpdateOrgSchema)
	.action(async ({ ctx, parsedInput }) =>
		auth.api.updateOrganization({
			headers: ctx.headers,
			body: { organizationId: parsedInput.organizationId, data: parsedInput },
		})
	);

export const deleteOrganization = adminActionClient
	.metadata({ actionName: 'deleteOrganization' })
	.inputSchema(OrgIdSchema)
	.action(async ({ ctx, parsedInput }) => auth.api.deleteOrganization({ headers: ctx.headers, body: parsedInput }));

export const setActiveOrganization = authActionClient
	.metadata({ actionName: 'setActiveOrganization' })
	.inputSchema(z.object({ organizationId: z.string().optional().nullable() }))
	.action(async ({ ctx, parsedInput }) => auth.api.setActiveOrganization({ headers: ctx.headers, body: parsedInput }));

export const listInvitations = authActionClient
	.metadata({ actionName: 'listInvitations' })
	.inputSchema(z.object({ organizationId: z.string().optional() }))
	.action(async ({ ctx, parsedInput }) => auth.api.listInvitations({ headers: ctx.headers, query: parsedInput }));

export const inviteMember = adminActionClient
	.metadata({ actionName: 'inviteMember' })
	.inputSchema(InviteSchema)
	.action(async ({ ctx, parsedInput }) => auth.api.createInvitation({ headers: ctx.headers, body: parsedInput }));

export const acceptInvitation = authActionClient
	.metadata({ actionName: 'acceptInvitation' })
	.inputSchema(z.object({ invitationId: z.string() }))
	.action(async ({ ctx, parsedInput }) => auth.api.acceptInvitation({ headers: ctx.headers, body: parsedInput }));

export const rejectInvitation = authActionClient
	.metadata({ actionName: 'rejectInvitation' })
	.inputSchema(z.object({ invitationId: z.string() }))
	.action(async ({ ctx, parsedInput }) => auth.api.rejectInvitation({ headers: ctx.headers, body: parsedInput }));
