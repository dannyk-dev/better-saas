
/**
 * @jest-environment node
 */
import * as nextHeaders from 'next/headers';
import { auth } from '@/lib/auth/auth';
import { createOrganization, listOrganizations } from '@/server/actions/org-actions';

jest.mock('next/headers', () => ({
  headers: jest.fn(async () => ({}))
}));

jest.mock('@/lib/auth/auth', () => ({
  auth: {
    organization: {
      create: jest.fn(async ({ body }) => ({ id: 'org_1', name: body.name })),
      list: jest.fn(async () => ({ data: [{ id: 'org_1', name: 'Acme' }] })),
    }
  }
}));

describe('org-actions', () => {
  it('creates organization', async () => {
    const res = await createOrganization({ name: 'Acme' });
    expect(res).toEqual({ id: 'org_1', name: 'Acme' });
  });
  it('lists organizations', async () => {
    const res = await listOrganizations();
    expect(res).toEqual({ data: [{ id: 'org_1', name: 'Acme' }] });
  });
});
