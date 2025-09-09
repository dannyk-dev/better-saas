"use client";

import React, { useState } from 'react';
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Input,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from '@heroui/react';
import {
  createOrganization,
  updateOrganization,
  deleteOrganization,
} from '@/server/actions/org-actions';
import { useOrg } from '@/components/providers/org-provider';

/**
 * SettingsOrganizationsPage provides a CRUD interface for organizations.
 * Users can create new organizations, rename existing ones, and delete
 * organizations they belong to.  After each operation the list is
 * refreshed automatically via the `OrgProvider`.
 */
export default function SettingsOrganizationsPage() {
  const { orgs, refresh } = useOrg();
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState('');

  const handleCreate = async () => {
    if (!name.trim()) return;
    setCreating(true);
    const result = await createOrganization({ name });
    if (result.success) {
      setName('');
      await refresh();
    }
    setCreating(false);
  };

  const handleRename = async (id: string, newName: string) => {
    if (!newName.trim()) return;
    await updateOrganization({ organizationId: id, name: newName });
    await refresh();
  };

  const handleDelete = async (id: string) => {
    await deleteOrganization({ organizationId: id });
    await refresh();
  };

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>New organization</CardHeader>
        <CardBody className="flex gap-2">
          <Input
            size="sm"
            placeholder="Acme Inc."
            value={name}
            onValueChange={setName}
          />
          <Button isLoading={creating} onPress={handleCreate}>
            Create
          </Button>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>Organizations</CardHeader>
        <CardBody>
          <Table aria-label="Organizations">
            <TableHeader>
              <TableColumn>NAME</TableColumn>
              <TableColumn>ID</TableColumn>
              <TableColumn>ACTIONS</TableColumn>
            </TableHeader>
            <TableBody>
              {orgs.map((o) => (
                <TableRow key={o.id}>
                  <TableCell>
                    <Input
                      size="sm"
                      defaultValue={o.name}
                      onBlur={(e) => handleRename(o.id, (e.target as HTMLInputElement).value)}
                    />
                  </TableCell>
                  <TableCell className="font-mono text-xs">{o.id}</TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      color="danger"
                      variant="flat"
                      onPress={() => handleDelete(o.id)}
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardBody>
      </Card>
    </div>
  );
}