import { useEffect, useState } from 'react';
import { Search, Trash2, Users } from 'lucide-react';
import { api, apiError } from '../../api/client';
import { AlertBanner, Badge, Button, Card, EmptyState, Modal, Select, Spinner } from '../../components/ui';
import type { Role } from '../../types';
import { clsx, fmtDate } from '../../utils/clsx';

interface Row {
  id: string; name: string; email: string; phone?: string; role: Role;
  location?: string; email_verified: boolean; created_at: string;
}

export default function AdminUsers() {
  const [users, setUsers] = useState<Row[] | null>(null);
  const [role, setRole] = useState('');
  const [q, setQ] = useState('');
  const [deleting, setDeleting] = useState<Row | null>(null);
  const [error, setError] = useState('');

  const load = () =>
    api.get('/admin/users', { params: role ? { role } : {} }).then((r) => setUsers(r.data.users));
  useEffect(() => { setUsers(null); load(); }, [role]);

  const filtered = (users ?? []).filter(
    (u) => !q || u.name.toLowerCase().includes(q.toLowerCase()) || u.email.includes(q.toLowerCase()),
  );

  async function setUserRole(u: Row, newRole: string) {
    try {
      await api.patch(`/admin/users/${u.id}`, { role: newRole });
      load();
    } catch (e) {
      setError(apiError(e));
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-stone-900">Users</h1>
        <p className="mt-1 text-sm text-stone-500">Manage farmers, experts and administrators.</p>
      </div>
      {error && <AlertBanner>{error}</AlertBanner>}

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-52">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search name or email…"
            className="w-full rounded-xl border border-stone-300 bg-white py-2.5 pl-10 pr-4 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
          />
        </div>
        <div className="flex gap-2">
          {['', 'farmer', 'expert', 'admin'].map((r) => (
            <button
              key={r}
              onClick={() => setRole(r)}
              className={clsx('rounded-full px-4 py-2 text-sm font-semibold capitalize transition',
                role === r ? 'bg-brand-700 text-white' : 'bg-white text-stone-600 border border-stone-200')}
            >
              {r || 'All'}
            </button>
          ))}
        </div>
      </div>

      {!users ? <Spinner label="Loading users…" /> : filtered.length === 0 ? (
        <EmptyState icon={Users} title="No users found" />
      ) : (
        <Card className="overflow-x-auto p-0">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-stone-100 text-xs uppercase tracking-wide text-stone-400">
                <th className="px-5 py-3.5 font-semibold">User</th>
                <th className="px-5 py-3.5 font-semibold">Contact</th>
                <th className="px-5 py-3.5 font-semibold">Role</th>
                <th className="px-5 py-3.5 font-semibold">Verified</th>
                <th className="px-5 py-3.5 font-semibold">Joined</th>
                <th className="px-5 py-3.5" />
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-50">
              {filtered.map((u) => (
                <tr key={u.id} className="hover:bg-stone-50">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-800">
                        {u.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold text-stone-800">{u.name}</p>
                        <p className="text-xs text-stone-400">{u.location || '—'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-stone-600">
                    <p>{u.email}</p>
                    <p className="text-xs text-stone-400">{u.phone || '—'}</p>
                  </td>
                  <td className="px-5 py-3">
                    <select
                      value={u.role}
                      onChange={(e) => setUserRole(u, e.target.value)}
                      className="rounded-lg border border-stone-200 bg-white px-2 py-1 text-xs font-semibold capitalize"
                      aria-label={`Role for ${u.name}`}
                    >
                      <option value="farmer">farmer</option>
                      <option value="expert">expert</option>
                      <option value="admin">admin</option>
                    </select>
                  </td>
                  <td className="px-5 py-3">{u.email_verified ? <Badge status="healthy" label="Verified" /> : <Badge status="pending" label="Unverified" />}</td>
                  <td className="px-5 py-3 text-stone-500">{fmtDate(u.created_at)}</td>
                  <td className="px-5 py-3 text-right">
                    <button onClick={() => setDeleting(u)} aria-label={`Delete ${u.name}`} className="rounded-lg p-1.5 text-stone-300 hover:bg-red-50 hover:text-red-600">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      <Modal open={!!deleting} onClose={() => setDeleting(null)} title="Delete User">
        <p className="text-sm text-stone-600">Delete <strong>{deleting?.name}</strong> ({deleting?.email})? Their farms, crops and analyses will be removed.</p>
        <div className="mt-5 flex gap-3">
          <Button variant="outline" className="flex-1" onClick={() => setDeleting(null)}>Cancel</Button>
          <Button variant="danger" className="flex-1" onClick={async () => {
            try { await api.delete(`/admin/users/${deleting!.id}`); setDeleting(null); load(); }
            catch (e) { setError(apiError(e)); setDeleting(null); }
          }}>Delete</Button>
        </div>
      </Modal>
    </div>
  );
}
