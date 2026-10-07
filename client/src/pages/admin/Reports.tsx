import { useEffect, useState } from 'react';
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer,
  Tooltip, XAxis, YAxis,
} from 'recharts';
import { api } from '../../api/client';
import { Card, Spinner } from '../../components/ui';

const COLORS = ['#238049', '#84cc16', '#d97706', '#dc2626', '#0284c7', '#78716c', '#a855f7', '#0d9488'];

export default function AdminReports() {
  const [r, setR] = useState<any>(null);

  useEffect(() => {
    api.get('/admin/reports').then((res) => setR(res.data));
  }, []);

  if (!r) return <Spinner label="Building reports…" />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-stone-900">Reports &amp; Analytics</h1>
        <p className="mt-1 text-sm text-stone-500">Platform activity, detections and regional outbreaks.</p>
      </div>

      <Card>
        <h2 className="mb-4 font-bold text-stone-900">Analyses per Day (last 30 days)</h2>
        {r.dailyAnalyses.length === 0 ? (
          <p className="py-8 text-center text-sm text-stone-400">No activity yet.</p>
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={r.dailyAnalyses} margin={{ left: 0, right: 16 }}>
              <defs>
                <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#238049" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#238049" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 11 }} tickFormatter={(d) => d.slice(5)} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Area type="monotone" dataKey="count" stroke="#238049" strokeWidth={2} fill="url(#g1)" />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h2 className="mb-4 font-bold text-stone-900">Regional Outbreaks</h2>
          {r.regionalOutbreaks.length === 0 ? (
            <p className="py-8 text-center text-sm text-stone-400">No detected cases yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={r.regionalOutbreaks}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {r.regionalOutbreaks.map((_: any, i: number) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>

        <Card>
          <h2 className="mb-4 font-bold text-stone-900">Summary</h2>
          <dl className="grid grid-cols-2 gap-x-6 gap-y-4 text-sm">
            {[
              ['Registered farmers', r.users.farmers],
              ['Experts', r.users.experts],
              ['Total analyses', r.analyses.total],
              ['Healthy results', r.analyses.healthy],
              ['Detected cases', r.analyses.detected],
              ['Avg AI confidence', `${Math.round((r.analyses.avg_confidence ?? 0) * 100)}%`],
              ['Cases pending', r.reviews.pending],
              ['Cases resolved', r.reviews.resolved],
            ].map(([label, value]) => (
              <div key={label as string} className="flex items-center justify-between rounded-xl bg-stone-50 px-4 py-3">
                <dt className="text-stone-500">{label}</dt>
                <dd className="font-bold text-stone-900">{value}</dd>
              </div>
            ))}
          </dl>
        </Card>
      </div>
    </div>
  );
}
