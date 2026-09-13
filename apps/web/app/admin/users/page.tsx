'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Users, Search, Ban, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { CreateUserDialog } from '@/components/admin/CreateUserDialog';
import { Badge, Button, Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui';

export default function AdminUsersPage() {
  const { allUsers, toggleUserStatus } = useAuth();
  const [query, setQuery] = useState('');

  const filtered = allUsers.filter((u) =>
    `${u.name} ${u.email}`.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Users</h1>
          <p className="text-sm text-muted-foreground">{allUsers.length} accounts in the workspace.</p>
        </div>
        <CreateUserDialog />
      </div>

      <div className="relative max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="search"
          placeholder="Search users…"
          className="h-9 w-full rounded-lg border border-input bg-card pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="py-10 text-center text-muted-foreground">
                <Users className="mx-auto h-6 w-6" />
                No users found.
              </TableCell>
            </TableRow>
          ) : (
            filtered.map((u) => (
              <TableRow key={u.userId}>
                <TableCell>
                  <Link href={`/admin/users/${u.userId}`} className="group">
                    <p className="font-medium text-foreground group-hover:text-info">{u.name}</p>
                    <p className="text-xs text-muted-foreground">{u.email}</p>
                  </Link>
                </TableCell>
                <TableCell>
                  <Badge variant={u.role === 'ADMIN' ? 'info' : 'secondary'}>{u.role}</Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={u.status === 'active' ? 'success' : 'secondary'}>{u.status}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  {u.userId !== 'usr_demo_001' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={u.userId === 'usr_admin_master_999'}
                      onClick={() => toggleUserStatus(u.userId)}
                    >
                      {u.status === 'active' ? <Ban className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
                      {u.status === 'active' ? 'Disable' : 'Enable'}
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}