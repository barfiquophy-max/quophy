import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, CheckCheck, Trash2 } from 'lucide-react';
import { api } from '../../api/client';
import { useAuth } from '../../auth/AuthContext';
import { Button, Card, EmptyState, Spinner } from '../../components/ui';
import type { AppNotification } from '../../types';
import { clsx, fmtDateTime } from '../../utils/clsx';

export default function Notifications() {
  const [items, setItems] = useState<AppNotification[] | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();
  const base = user?.role === 'admin' ? '/admin' : user?.role === 'expert' ? '/expert' : '/app';

  const load = () => api.get('/notifications').then((r) => setItems(r.data.notifications));
  useEffect(() => { load(); }, []);

  if (!items) return <Spinner label="Loading notifications…" />;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-stone-900">Notifications</h1>
          <p className="mt-1 text-sm text-stone-500">Analysis results, expert replies and farm reminders.</p>
        </div>
        {items.some((n) => !n.read) && (
          <Button variant="secondary" size="sm" icon={CheckCheck} onClick={async () => { await api.post('/notifications/read-all'); load(); }}>
            Mark all read
          </Button>
        )}
      </div>

      {items.length === 0 ? (
        <EmptyState icon={Bell} title="All caught up" hint="Notifications about your crops and cases will appear here." />
      ) : (
        <div className="space-y-2.5">
          {items.map((n) => (
            <Card
              key={n.id}
              className={clsx('flex items-start gap-3 transition', !n.read && 'border-brand-200 bg-brand-50/40')}
            >
              <button
                className="min-w-0 flex-1 text-left"
                onClick={async () => {
                  if (!n.read) api.post(`/notifications/${n.id}/read`).catch(() => {});
                  if (n.link) navigate(n.link.replace(/^\/app/, base === '/app' ? '/app' : base));
                }}
              >
                <div className="flex items-center gap-2">
                  {!n.read && <span className="h-2 w-2 rounded-full bg-brand-600" />}
                  <p className="text-sm font-bold text-stone-800">{n.title}</p>
                </div>
                <p className="mt-0.5 text-sm text-stone-600">{n.message}</p>
                <p className="mt-1 text-xs text-stone-400">{fmtDateTime(n.created_at)}</p>
              </button>
              <button
                aria-label="Delete notification"
                onClick={async () => { await api.delete(`/notifications/${n.id}`); load(); }}
                className="rounded-lg p-1.5 text-stone-300 hover:bg-red-50 hover:text-red-600"
              >
                <Trash2 size={15} />
              </button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
