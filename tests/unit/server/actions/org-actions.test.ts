import { describe, it, expect, jest, beforeEach } from '@jest/globals';

// Import the server actions to be tested.  Use alias to avoid treeshaking
// and ensure that the functions are loaded from our newly added module.
import * as OrgActions from '@/server/actions/org-actions';

// Create mocks for the auth API and headers.  The organization plugin
// exposes a namespace under `auth.api.organization`.  Each method is
// represented here as a jest mock so that we can verify calls and
// control return values during tests.
const mockOrganization = {
  list: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  setActive: jest.fn(),
  inviteMember: jest.fn(),
  listMembers: jest.fn(),
  updateMemberRole: jest.fn(),
  removeMember: jest.fn(),
  leave: jest.fn(),
};

const mockAuth = {
  api: {
    getSession: jest.fn(),
    organization: mockOrganization,
  },
};

jest.mock('@/lib/auth/auth', () => ({
  auth: mockAuth,
}));

const mockHeaders = jest.fn();
jest.mock('next/headers', () => ({
  headers: mockHeaders,
}));

// Define some reusable session objects for authenticated and unauthenticated cases
const authenticatedSession = {
  user: {
    id: 'user-123',
    email: 'test@example.com',
    name: 'Test User',
  },
};

describe('Organization Actions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockHeaders.mockResolvedValue(new Headers());
  });

  describe('getOrganizations', () => {
    it('should return unauthorized when there is no active session', async () => {
      mockAuth.api.getSession.mockResolvedValue(null);

      const result = await OrgActions.getOrganizations();
      expect(result).toEqual({ success: false, error: 'Unauthorized' });
      expect(mockAuth.api.getSession).toHaveBeenCalledWith({
        headers: expect.any(Headers),
      });
      expect(mockOrganization.list).not.toHaveBeenCalled();
    });

    it('should list organizations for authenticated users', async () => {
      const orgs = [
        { id: 'org1', name: 'Org 1' },
        { id: 'org2', name: 'Org 2' },
      ];
      mockAuth.api.getSession.mockResolvedValue(authenticatedSession);
      mockOrganization.list.mockResolvedValue(orgs);

      const result = await OrgActions.getOrganizations();

      expect(result.success).toBe(true);
      expect(result.data).toEqual(orgs);
      expect(mockOrganization.list).toHaveBeenCalled();
    });
  });

  describe('createOrganization', () => {
    it('should return unauthorized when user is not authenticated', async () => {
      mockAuth.api.getSession.mockResolvedValue(null);
      const result = await OrgActions.createOrganization('My Org', 'my-org');
      expect(result).toEqual({ success: false, error: 'Unauthorized' });
      expect(mockOrganization.create).not.toHaveBeenCalled();
    });

    it('should create an organization with name and slug', async () => {
      const created = { id: 'org123', name: 'My Org', slug: 'my-org' };
      mockAuth.api.getSession.mockResolvedValue(authenticatedSession);
      mockOrganization.create.mockResolvedValue(created);

      const result = await OrgActions.createOrganization('My Org', 'my-org');

      expect(result.success).toBe(true);
      expect(result.data).toEqual(created);
      expect(mockOrganization.create).toHaveBeenCalledWith({ name: 'My Org', slug: 'my-org' });
    });
  });

  describe('updateOrganization', () => {
    it('should return unauthorized when user is not authenticated', async () => {
      mockAuth.api.getSession.mockResolvedValue(null);
      const result = await OrgActions.updateOrganization('org1', { name: 'Updated Org' });
      expect(result).toEqual({ success: false, error: 'Unauthorized' });
      expect(mockOrganization.update).not.toHaveBeenCalled();
    });

    it('should update an organization', async () => {
      const updated = { id: 'org1', name: 'Updated Org', slug: 'updated-org' };
      mockAuth.api.getSession.mockResolvedValue(authenticatedSession);
      mockOrganization.update.mockResolvedValue(updated);

      const result = await OrgActions.updateOrganization('org1', { name: 'Updated Org', slug: 'updated-org' });

      expect(result.success).toBe(true);
      expect(result.data).toEqual(updated);
      expect(mockOrganization.update).toHaveBeenCalledWith({ id: 'org1', name: 'Updated Org', slug: 'updated-org' });
    });
  });

  describe('deleteOrganization', () => {
    it('should return unauthorized when user is not authenticated', async () => {
      mockAuth.api.getSession.mockResolvedValue(null);
      const result = await OrgActions.deleteOrganization('org1');
      expect(result).toEqual({ success: false, error: 'Unauthorized' });
      expect(mockOrganization.delete).not.toHaveBeenCalled();
    });

    it('should delete an organization for authenticated users', async () => {
      mockAuth.api.getSession.mockResolvedValue(authenticatedSession);
      mockOrganization.delete.mockResolvedValue(undefined);

      const result = await OrgActions.deleteOrganization('org1');

      expect(result.success).toBe(true);
      expect(result.data).toEqual({ deleted: true });
      expect(mockOrganization.delete).toHaveBeenCalledWith({ id: 'org1' });
    });
  });

  describe('setActiveOrganization', () => {
    it('should return unauthorized when user is not authenticated', async () => {
      mockAuth.api.getSession.mockResolvedValue(null);
      const result = await OrgActions.setActiveOrganization('org1');
      expect(result).toEqual({ success: false, error: 'Unauthorized' });
      expect(mockOrganization.setActive).not.toHaveBeenCalled();
    });

    it('should set an organization as active', async () => {
      mockAuth.api.getSession.mockResolvedValue(authenticatedSession);
      mockOrganization.setActive.mockResolvedValue(undefined);

      const result = await OrgActions.setActiveOrganization('org1');

      expect(result.success).toBe(true);
      expect(result.data).toEqual({ active: true });
      expect(mockOrganization.setActive).toHaveBeenCalledWith({ id: 'org1' });
    });
  });

  describe('inviteMember', () => {
    it('should return unauthorized when user is not authenticated', async () => {
      mockAuth.api.getSession.mockResolvedValue(null);
      const result = await OrgActions.inviteMember('org1', 'invitee@example.com', 'admin');
      expect(result).toEqual({ success: false, error: 'Unauthorized' });
      expect(mockOrganization.inviteMember).not.toHaveBeenCalled();
    });

    it('should invite a member to an organization', async () => {
      const invite = { id: 'inv123', email: 'invitee@example.com', role: 'admin' };
      mockAuth.api.getSession.mockResolvedValue(authenticatedSession);
      mockOrganization.inviteMember.mockResolvedValue(invite);

      const result = await OrgActions.inviteMember('org1', 'invitee@example.com', 'admin');

      expect(result.success).toBe(true);
      expect(result.data).toEqual(invite);
      expect(mockOrganization.inviteMember).toHaveBeenCalledWith({ organizationId: 'org1', email: 'invitee@example.com', role: 'admin' });
    });
  });

  describe('listMembers', () => {
    it('should return unauthorized when user is not authenticated', async () => {
      mockAuth.api.getSession.mockResolvedValue(null);
      const result = await OrgActions.listMembers('org1');
      expect(result).toEqual({ success: false, error: 'Unauthorized' });
      expect(mockOrganization.listMembers).not.toHaveBeenCalled();
    });

    it('should list members of an organization', async () => {
      const members = [
        { id: 'u1', email: 'member1@example.com', role: 'member' },
        { id: 'u2', email: 'member2@example.com', role: 'admin' },
      ];
      mockAuth.api.getSession.mockResolvedValue(authenticatedSession);
      mockOrganization.listMembers.mockResolvedValue(members);

      const result = await OrgActions.listMembers('org1');

      expect(result.success).toBe(true);
      expect(result.data).toEqual(members);
      expect(mockOrganization.listMembers).toHaveBeenCalledWith({ organizationId: 'org1' });
    });
  });

  describe('updateMemberRole', () => {
    it('should return unauthorized when user is not authenticated', async () => {
      mockAuth.api.getSession.mockResolvedValue(null);
      const result = await OrgActions.updateMemberRole('org1', 'u1', 'admin');
      expect(result).toEqual({ success: false, error: 'Unauthorized' });
      expect(mockOrganization.updateMemberRole).not.toHaveBeenCalled();
    });

    it('should update a member role', async () => {
      mockAuth.api.getSession.mockResolvedValue(authenticatedSession);
      mockOrganization.updateMemberRole.mockResolvedValue(undefined);

      const result = await OrgActions.updateMemberRole('org1', 'u1', 'admin');

      expect(result.success).toBe(true);
      expect(result.data).toEqual({ updated: true });
      expect(mockOrganization.updateMemberRole).toHaveBeenCalledWith({ organizationId: 'org1', userId: 'u1', role: 'admin' });
    });
  });

  describe('removeMember', () => {
    it('should return unauthorized when user is not authenticated', async () => {
      mockAuth.api.getSession.mockResolvedValue(null);
      const result = await OrgActions.removeMember('org1', 'u1');
      expect(result).toEqual({ success: false, error: 'Unauthorized' });
      expect(mockOrganization.removeMember).not.toHaveBeenCalled();
    });

    it('should remove a member from an organization', async () => {
      mockAuth.api.getSession.mockResolvedValue(authenticatedSession);
      mockOrganization.removeMember.mockResolvedValue(undefined);

      const result = await OrgActions.removeMember('org1', 'u1');

      expect(result.success).toBe(true);
      expect(result.data).toEqual({ removed: true });
      expect(mockOrganization.removeMember).toHaveBeenCalledWith({ organizationId: 'org1', userId: 'u1' });
    });
  });

  describe('leaveOrganization', () => {
    it('should return unauthorized when user is not authenticated', async () => {
      mockAuth.api.getSession.mockResolvedValue(null);
      const result = await OrgActions.leaveOrganization('org1');
      expect(result).toEqual({ success: false, error: 'Unauthorized' });
      expect(mockOrganization.leave).not.toHaveBeenCalled();
    });

    it('should allow a user to leave an organization', async () => {
      mockAuth.api.getSession.mockResolvedValue(authenticatedSession);
      mockOrganization.leave.mockResolvedValue(undefined);

      const result = await OrgActions.leaveOrganization('org1');

      expect(result.success).toBe(true);
      expect(result.data).toEqual({ left: true });
      expect(mockOrganization.leave).toHaveBeenCalledWith({ organizationId: 'org1' });
    });
  });
});