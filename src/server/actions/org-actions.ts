"use server";

import { auth } from '@/lib/auth/auth';
import { headers } from 'next/headers';
import type { ActionResult } from '@/payment/types';

/**
 * This module provides server actions for managing organizations using the
 * Better‑Auth organization plugin. Each function wraps the underlying
 * plugin calls with authentication checks and consistent return values.
 *
 * All actions return an {@link ActionResult} where `success` indicates
 * whether the operation succeeded. When successful, the result contains
 * a `data` property with the returned payload. When unsuccessful, the
 * result contains an `error` message.
 */

/**
 * Retrieve all organizations that the current user belongs to.
 */
export async function getOrganizations(): Promise<ActionResult<any[]>> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session?.user) {
      return { success: false, error: 'Unauthorized' };
    }
    // List organizations for the authenticated user.  The organization
    // plugin exposes a `list` method via the `organization` namespace.
    const orgs = await (auth.api as any).organization.list();
    return { success: true, data: orgs };
  } catch (error) {
    console.error('Error fetching organizations:', error);
    return { success: false, error: 'Failed to fetch organizations' };
  }
}

/**
 * Create a new organization for the current user.
 *
 * @param name The human‑readable name of the organization
 * @param slug Optional unique slug for the organization. If omitted
 *   the backend will derive one from the name.
 */
export async function createOrganization(
  name: string,
  slug?: string
): Promise<ActionResult<any>> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session?.user) {
      return { success: false, error: 'Unauthorized' };
    }
    const organizationClient = (auth.api as any).organization;
    const created = await organizationClient.create({ name, slug });
    return { success: true, data: created };
  } catch (error) {
    console.error('Error creating organization:', error);
    return { success: false, error: 'Failed to create organization' };
  }
}

/**
 * Update an existing organization. Only the owner or administrators of
 * the organization are allowed to perform this operation.
 *
 * @param id The identifier of the organization to update
 * @param data A partial object containing the fields to update
 */
export async function updateOrganization(
  id: string,
  data: { name?: string; slug?: string }
): Promise<ActionResult<any>> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session?.user) {
      return { success: false, error: 'Unauthorized' };
    }
    const organizationClient = (auth.api as any).organization;
    const updated = await organizationClient.update({ id, ...data });
    return { success: true, data: updated };
  } catch (error) {
    console.error('Error updating organization:', error);
    return { success: false, error: 'Failed to update organization' };
  }
}

/**
 * Delete an organization. The current user must be the owner of the
 * organization to perform this operation.
 *
 * @param id The identifier of the organization to delete
 */
export async function deleteOrganization(
  id: string
): Promise<ActionResult<{ deleted: boolean }>> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session?.user) {
      return { success: false, error: 'Unauthorized' };
    }
    const organizationClient = (auth.api as any).organization;
    await organizationClient.delete({ id });
    return { success: true, data: { deleted: true } };
  } catch (error) {
    console.error('Error deleting organization:', error);
    return { success: false, error: 'Failed to delete organization' };
  }
}

/**
 * Set an organization as the active context for the current user.
 * This is useful for multi‑tenant applications where actions depend
 * on the active organization.
 *
 * @param id The identifier of the organization to set as active
 */
export async function setActiveOrganization(
  id: string
): Promise<ActionResult<{ active: boolean }>> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session?.user) {
      return { success: false, error: 'Unauthorized' };
    }
    const organizationClient = (auth.api as any).organization;
    await organizationClient.setActive({ id });
    return { success: true, data: { active: true } };
  } catch (error) {
    console.error('Error setting active organization:', error);
    return { success: false, error: 'Failed to set active organization' };
  }
}

/**
 * Invite a member to join an organization by email. Only owners or
 * administrators of the organization can send invites.
 *
 * @param organizationId The organization to which the member is invited
 * @param email The email address of the user to invite
 * @param role Optional role to assign upon acceptance (e.g. "member" or "admin")
 */
export async function inviteMember(
  organizationId: string,
  email: string,
  role?: string
): Promise<ActionResult<any>> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session?.user) {
      return { success: false, error: 'Unauthorized' };
    }
    const organizationClient = (auth.api as any).organization;
    const invite = await organizationClient.inviteMember({ organizationId, email, role });
    return { success: true, data: invite };
  } catch (error) {
    console.error('Error inviting member:', error);
    return { success: false, error: 'Failed to invite member' };
  }
}

/**
 * List all members of a given organization. Requires membership in the
 * organization.
 *
 * @param organizationId The organization whose members should be listed
 */
export async function listMembers(
  organizationId: string
): Promise<ActionResult<any[]>> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session?.user) {
      return { success: false, error: 'Unauthorized' };
    }
    const organizationClient = (auth.api as any).organization;
    const members = await organizationClient.listMembers({ organizationId });
    return { success: true, data: members };
  } catch (error) {
    console.error('Error listing members:', error);
    return { success: false, error: 'Failed to list members' };
  }
}

/**
 * Update the role of a member within an organization. Only owners or
 * administrators can change roles.
 *
 * @param organizationId The organization containing the member
 * @param userId The user identifier of the member
 * @param role The new role to assign
 */
export async function updateMemberRole(
  organizationId: string,
  userId: string,
  role: string
): Promise<ActionResult<{ updated: boolean }>> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session?.user) {
      return { success: false, error: 'Unauthorized' };
    }
    const organizationClient = (auth.api as any).organization;
    await organizationClient.updateMemberRole({ organizationId, userId, role });
    return { success: true, data: { updated: true } };
  } catch (error) {
    console.error('Error updating member role:', error);
    return { success: false, error: 'Failed to update member role' };
  }
}

/**
 * Remove a member from an organization. Only owners or administrators
 * can remove other members.
 *
 * @param organizationId The organization from which to remove the member
 * @param userId The user identifier of the member to remove
 */
export async function removeMember(
  organizationId: string,
  userId: string
): Promise<ActionResult<{ removed: boolean }>> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session?.user) {
      return { success: false, error: 'Unauthorized' };
    }
    const organizationClient = (auth.api as any).organization;
    await organizationClient.removeMember({ organizationId, userId });
    return { success: true, data: { removed: true } };
  } catch (error) {
    console.error('Error removing member:', error);
    return { success: false, error: 'Failed to remove member' };
  }
}

/**
 * Leave an organization. The current user can leave any organization they
 * belong to. If the user is the sole owner, the backend should prevent
 * leaving until the organization is transferred or deleted.
 *
 * @param organizationId The organization to leave
 */
export async function leaveOrganization(
  organizationId: string
): Promise<ActionResult<{ left: boolean }>> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session?.user) {
      return { success: false, error: 'Unauthorized' };
    }
    const organizationClient = (auth.api as any).organization;
    await organizationClient.leave({ organizationId });
    return { success: true, data: { left: true } };
  } catch (error) {
    console.error('Error leaving organization:', error);
    return { success: false, error: 'Failed to leave organization' };
  }
}
