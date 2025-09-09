import {
  listMembers,
  inviteMember,
  updateMemberRole,
  removeMember,
  leaveOrganization,
} from '@/server/actions/org-actions';
import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Button,
  Input,
  Select,
  SelectItem,
} from '@heroui/react';

export const metadata = {
  title: 'Organization Members',
};

// Server action to invite a new member.  Placed at module scope so that
// forms can reference it directly via the action attribute.
export async function inviteMemberAction(formData: FormData) {
  'use server';
  const organizationId = formData.get('organizationId') as string;
  const email = formData.get('email') as string;
  const role = formData.get('role') as string | undefined;
  if (!organizationId || !email) {
    return;
  }
  await inviteMember(organizationId, email, role);
}

// Server action to update a member's role.  Accepts organizationId and userId
// plus the new role.
export async function updateMemberRoleAction(formData: FormData) {
  'use server';
  const organizationId = formData.get('organizationId') as string;
  const userId = formData.get('userId') as string;
  const role = formData.get('role') as string;
  if (!organizationId || !userId || !role) return;
  await updateMemberRole(organizationId, userId, role);
}

// Server action to remove a member from an organization.
export async function removeMemberAction(formData: FormData) {
  'use server';
  const organizationId = formData.get('organizationId') as string;
  const userId = formData.get('userId') as string;
  if (!organizationId || !userId) return;
  await removeMember(organizationId, userId);
}

// Server action for the current user to leave the organization.
export async function leaveOrganizationAction(formData: FormData) {
  'use server';
  const organizationId = formData.get('organizationId') as string;
  if (!organizationId) return;
  await leaveOrganization(organizationId);
}

interface PageProps {
  params: { locale: string; orgId: string };
}

/**
 * MembersPage lists all members of the given organization and provides forms
 * for inviting new members, changing roles, removing members, and leaving the
 * organization.  This component runs on the server to fetch the member list
 * synchronously before rendering.
 */
export default async function MembersPage({ params }: PageProps) {
  const { orgId } = params;
  const result = await listMembers(orgId);
  const members = result.success ? result.data : [];
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <h2 className="text-lg font-medium">Invite Member</h2>
        </CardHeader>
        <CardBody>
          <form action={inviteMemberAction} className="flex flex-col gap-4">
            <input type="hidden" name="organizationId" value={orgId} />
            <Input name="email" placeholder="User email" required />
            <Select name="role" label="Role" defaultSelectedKey="member">
              <SelectItem key="member" value="member" textValue="member">
                Member
              </SelectItem>
              <SelectItem key="admin" value="admin" textValue="admin">
                Admin
              </SelectItem>
            </Select>
            <Button type="submit" color="primary">
              Send Invite
            </Button>
          </form>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-medium">Members</h2>
        </CardHeader>
        <CardBody>
          {members.length === 0 && (
            <p className="text-sm text-muted-foreground">No members found.</p>
          )}
          {members.length > 0 && (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Name</th>
                  <th className="text-left py-2">Email</th>
                  <th className="text-left py-2">Role</th>
                  <th className="py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {members.map((member: any) => (
                  <tr key={member.userId} className="border-b">
                    <td className="py-2">{member.name || member.email}</td>
                    <td className="py-2">{member.email}</td>
                    <td className="py-2">
                      <form action={updateMemberRoleAction} className="inline-flex items-center gap-2">
                        <input type="hidden" name="organizationId" value={orgId} />
                        <input type="hidden" name="userId" value={member.userId} />
                        <Select name="role" defaultSelectedKey={member.role} size="sm">
                          <SelectItem key="member" value="member" textValue="member">
                            Member
                          </SelectItem>
                          <SelectItem key="admin" value="admin" textValue="admin">
                            Admin
                          </SelectItem>
                        </Select>
                        <Button type="submit" variant="outline" size="sm">
                          Update
                        </Button>
                      </form>
                    </td>
                    <td className="py-2 text-right">
                      <form action={removeMemberAction} className="inline-flex">
                        <input type="hidden" name="organizationId" value={orgId} />
                        <input type="hidden" name="userId" value={member.userId} />
                        <Button type="submit" variant="destructive" size="sm">
                          Remove
                        </Button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardBody>
        <CardFooter>
          {/* Leave organization form.  Only visible to current user; the backend will enforce permissions. */}
          <form action={leaveOrganizationAction} className="inline-flex">
            <input type="hidden" name="organizationId" value={orgId} />
            <Button type="submit" variant="outline" size="sm">
              Leave Organization
            </Button>
          </form>
        </CardFooter>
      </Card>
    </div>
  );
}