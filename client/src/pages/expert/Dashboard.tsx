import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, ChevronRight, ClipboardList, Flame, Loader2, Stethoscope } from 'lucide-react';
import { api } from '../../api/client';
import { useAuth } from '../../auth/AuthContext';
import { Badge, Card, EmptyState, Spinner, StatCard } from '../../components/ui';
import type { ExpertCase } from '../../types';
import { fmtDateTime } from '../../utils/clsx';

export default function ExpertDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [cases, setCases] = useState<ExpertCase[]>([]);

  useEffect(() => {
    api.get('/expert/stats').then((r) => setStats(r.data.stats));
    api.get('/expert/cases', { params: { status: 'pending' } }).then((r) => setCases(r.data.cases));
  }, []);

  if (!stats) return <Spinner label="Loading expert dashboard…" />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-stone-900">Expert Dashboard</h1>
        <p className="mt-1 text-sm text-stone-500">Welcome, {user?.name}. Review farmer cases and share your advice.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard icon={ClipboardList} label="Pending Cases" value={stats.pending} tone="amber" />
        <StatCard icon={Loader2} label="Under Review" value={stats.under_review} tone="sky" />
        <StatCard icon={Flame} label="Urgent" value={stats.urgent} tone={stats.urgent ? 'red' : 'brand'} />
        <StatCard icon={CheckCircle2} label="Resolved" value={stats.resolved} tone="brand" />
      </div>

      <Card>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-bold text-stone-900">Pending Farmer Cases</h2>
          <Link to="/expert/cases" className="flex items-center gap-1 text-sm font-semibold text-brand-700 hover:underline">
            All cases <ChevronRight size={15} />
          </Link>
        </div>
        {cases.length === 0 ? (
          <EmptyState icon={Stethoscope} title="No pending cases" hint="When farmers request an expert review, cases will appear here." />
        ) : (
          <div className="divide-y divide-stone-100">
            {cases.slice(0, 6).map((c) => (
              <Link key={c.id} to={`/expert/cases/${c.id}`} className="flex items-center gap-4 py-3 -mx-2 rounded-xl px-2 hover:bg-stone-50">
                <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-stone-100">
                  {c.image_url && <img src={c.image_url} alt="" className="h-full w-full object-cover" loading="lazy" />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-stone-800">
                    {c.crop_type} — {c.detected_condition}
                    {c.urgent && <span className="ml-2 rounded bg-red-100 px-1.5 py-0.5 text-[10px] font-bold text-red-700">URGENT</span>}
                  </p>
                  <p className="text-xs text-stone-500">
                    {c.farmer_name} · {c.farmer_location ?? c.location ?? 'Unknown location'} · {fmtDateTime(c.created_at)}
                  </p>
                </div>
                <Badge status={c.status ?? 'pending'} />
              </Link>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
