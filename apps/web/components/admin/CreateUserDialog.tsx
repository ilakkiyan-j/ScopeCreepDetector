'use client';

import React, { useState } from 'react';
import { UserPlus } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Button, Dialog, Input, Label, Select, Textarea } from '@/components/ui';
import { Currency } from '@scope-creep-ledger/shared';

const CURRENCIES: { code: Currency; label: string }[] = [
  { code: 'INR', label: 'INR — Indian Rupee' },
  { code: 'USD', label: 'USD — US Dollar' },
  { code: 'EUR', label: 'EUR — Euro' },
  { code: 'GBP', label: 'GBP — British Pound' },
  { code: 'AUD', label: 'AUD — Australian Dollar' },
  { code: 'CAD', label: 'CAD — Canadian Dollar' },
  { code: 'SGD', label: 'SGD — Singapore Dollar' },
  { code: 'AED', label: 'AED — UAE Dirham' },
  { code: 'JPY', label: 'JPY — Japanese Yen' },
];

export function CreateUserDialog() {
  const { createUser } = useAuth();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [profession, setProfession] = useState('');
  const [role, setRole] = useState<'USER' | 'ADMIN'>('USER');
  const [currency, setCurrency] = useState<Currency>('INR');
  const [error, setError] = useState<string | null>(null);
  const [created, setCreated] = useState(false);

  const reset = () => {
    setEmail('');
    setName('');
    setProfession('');
    setRole('USER');
    setCurrency('INR');
    setError(null);
    setCreated(false);
  };

  const submit = async () => {
    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail || !name.trim()) {
      setError('Name and email are required.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setError('Enter a valid email address.');
      return;
    }
    await createUser({
      email: trimmedEmail,
      name: name.trim(),
      profession: profession.trim(),
      role,
      defaultCurrency: currency,
      status: 'active',
      lastLoginAt: undefined,
    });
    setCreated(true);
    setError(null);
  };

  return (
    <>
      <Button variant="primary" onClick={() => setOpen(true)}>
        <UserPlus className="h-4 w-4" /> Add user
      </Button>

      <Dialog open={open} onClose={() => setOpen(false)}>
        <div className="space-y-4 p-6">
          <h2 className="text-lg font-semibold text-foreground">Add user</h2>
          {created ? (
            <div className="space-y-4">
              <div role="status" className="rounded-lg border border-success/30 bg-success/10 p-4 text-sm text-success">
                Account created. The initial password is Welcome123! — the user should change it after their first sign-in.
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="ghost" onClick={() => setOpen(false)}>Done</Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    reset();
                  }}
                >
                  Add another
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div className="space-y-1.5">
                <Label htmlFor="cu-name">Full name</Label>
                <Input id="cu-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Riley Wong" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="cu-email">Email</Label>
                <Input id="cu-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="riley@agency.com" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="cu-profession">Profession</Label>
                <Input id="cu-profession" value={profession} onChange={(e) => setProfession(e.target.value)} placeholder="Freelance Designer" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="cu-role">Role</Label>
                  <Select id="cu-role" value={role} onChange={(e) => setRole(e.target.value as 'USER' | 'ADMIN')}>
                    <option value="USER">USER</option>
                    <option value="ADMIN">ADMIN</option>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="cu-currency">Default currency</Label>
                  <Select id="cu-currency" value={currency} onChange={(e) => setCurrency(e.target.value as Currency)}>
                    {CURRENCIES.map((c) => (
                      <option key={c.code} value={c.code}>{c.code}</option>
                    ))}
                  </Select>
                </div>
              </div>
              {error && <p role="alert" className="text-sm text-danger">{error}</p>}
              <Textarea
                readOnly
                value={'Password rules for MVP: minimum 8 characters with uppercase, lowercase, and a number. New accounts start with the initial password Welcome123!. Production will use Cognito.'}
                rows={2}
                className="text-xs text-muted-foreground"
              />
              <div className="flex justify-end gap-2">
                <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
                <Button onClick={submit}>Create account</Button>
              </div>
            </>
          )}
        </div>
      </Dialog>
    </>
  );
}