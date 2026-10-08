import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BellRing, Bug, CheckCircle2, ScanLine, Stethoscope, Users } from 'lucide-react';
import {
  Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer,
  Tooltip, XAxis, YAxis,
} from 'recharts';
import { api } from '../../api/client';
import { Card, Spinner, StatCard } from '../../components/ui';

const COLORS = ['#238049', '#84cc16', '#d97706', '#dc2626', '#0284c7', '#78716c', '#a855f7', '#0d9488'];

export default function AdminDashboard() {
  const [r, setR] = useState<any>(null);

  useEffect(() => {
    api.get('/admin/reports').then((res) => setR(res.data));
  }, []);

  if (!r) return <Spinner label="Loading reports…" />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-stone-900">Admin Dashboard</h1>
        <p className="mt-1 text-sm text-stone-500">Platform overview — users, analyses, cases and outbreaks.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard icon={Users} label="Registered Users" value={r.users.total} sub={`${r.users.farmers} farmers · ${r.users.experts} experts`} />
        <StatCard icon={ScanLine} label="AI Analyses" value={r.analyses.total} sub={`${Math.round((r.analyses.avg_confidence ?? 0) * 100)}% avg confidence`} />
        <StatCard icon={Bug} label="Detected Cases" value={r.analyses.detected} tone="amber" />
        <StatCard icon={Stethoscope} label="Expert Cases Open" value={r.reviews.pending + r.reviews.under_review} tone="sky" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h2 className="mb-4 font-bold text-stone-900">Most Common Conditions Detected</h2>
          {r.topConditions.length === 0 ? (
            <p className="py-8 text-center text-sm text-stone-400">No detections yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={r.topConditions} layout="vertical" margin={{ left: 10, right: 16 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" hide />
                <YAxis type="category" dataKey="name" width={130} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                  {r.topConditions.map((_: any, i: number) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>

        <Card>
          <h2 className="mb-4 font-bold text-stone-900">Analysis Outcomes</h2>
          {r.statusBreakdown.length === 0 ? (
            <p className="py-8 text-center text-sm text-stone-400">No analyses yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={r.statusBreakdown} dataKey="count" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={3}>
                  {r.statusBreakdown.map((_: any, i: number) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
          <div className="mt-2 flex flex-wrap justify-center gap-3">
            {r.statusBreakdown.map((s: any, i: number) => (
              <span key={s.name} className="flex items-center gap-1.5 text-xs text-stone-600">
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                {s.name.replace(/_/g, ' ')} ({s.count})
              </span>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { to: '/admin/users', label: 'Manage Users', icon: Users },
          { to: '/admin/conditions', label: 'Pests & Diseases', icon: Bug },
          { to: '/admin/alerts', label: 'Manage Alerts', icon: BellRing },
          { to: '/admin/reports', label: 'Full Reports', icon: CheckCircle2 },
        ].map((l) => (
          <Link key={l.to} to={l.to} className="card flex items-center gap-3 p-4 font-semibold text-stone-700 transition hover:shadow-lift">
            <l.icon size={20} className="text-brand-600" /> {l.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
