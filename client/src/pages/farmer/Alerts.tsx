import { useEffect, useState } from 'react';
import { BellRing, Bug, CloudRain, Leaf, Pill, Sprout, TriangleAlert } from 'lucide-react';
import { api } from '../../api/client';
import { Badge, Card, EmptyState, Spinner } from '../../components/ui';
import type { Alert } from '../../types';
import { fmtDateTime } from '../../utils/clsx';

const ICONS: Record<string, typeof Bug> = {
  pest: Bug,
  disease: TriangleAlert,
  crop: Sprout,
  weather: CloudRain,
  treatment: Pill,
  general: BellRing,
};

const TONES: Record<string, string> = {
  critical: 'border-red-200 bg-red-50',
  warning: 'border-amber-200 bg-amber-50',
  info: 'border-sky-200 bg-sky-50',
};

export default function Alerts() {
  const [alerts, setAlerts] = useState<Alert[] | null>(null);

  useEffect(() => {
    api.get('/alerts').then((r) => setAlerts(r.data.alerts));
  }, []);

  if (!alerts) return <Spinner label="Loading alerts…" />;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-stone-900">Alerts</h1>
        <p className="mt-1 text-sm text-stone-500">
          Pest, disease, weather and treatment alerts — including warnings for your region.
        </p>
      </div>
      {alerts.length === 0 ? (
        <EmptyState icon={BellRing} title="No alerts right now" hint="When pests or diseases are reported in your area, you'll see them here." />
      ) : (
        <div className="space-y-3">
          {alerts.map((a) => {
            const Icon = ICONS[a.alert_type] ?? BellRing;
            return (
              <Card key={a.id} className={`flex items-start gap-4 ${TONES[a.severity]}`}>
                <div className="rounded-xl bg-white/70 p-2.5 text-stone-700"><Icon size={20} /></div>
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-bold text-stone-900">{a.title}</p>
                    <Badge status={a.severity} />
                    {a.location && <span className="rounded-full bg-white/70 px-2 py-0.5 text-[11px] font-medium text-stone-600">{a.location}</span>}
                  </div>
                  <p className="mt-1 text-sm text-stone-600">{a.message}</p>
                  <p className="mt-1.5 text-xs text-stone-400">{fmtDateTime(a.created_at)}</p>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
