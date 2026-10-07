import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, BellRing, Leaf, ScanLine, Sprout } from 'lucide-react';
import { api, apiError } from '../../api/client';
import { AlertBanner, Badge, Card, HealthBar, Spinner } from '../../components/ui';
import type { Alert, Analysis, Crop } from '../../types';
import { fmtDate, fmtDateTime } from '../../utils/clsx';

export default function CropDetail() {
  const { id } = useParams();
  const [crop, setCrop] = useState<Crop | null>(null);
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get(`/crops/${id}`)
      .then((r) => { setCrop(r.data.crop); setAnalyses(r.data.analyses); setAlerts(r.data.alerts); })
      .catch((e) => setError(apiError(e)));
  }, [id]);

  if (error) return <AlertBanner>{error}</AlertBanner>;
  if (!crop) return <Spinner label="Loading crop…" />;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link to="/app/crops" className="inline-flex items-center gap-1.5 text-sm font-medium text-stone-500 hover:text-brand-700">
        <ArrowLeft size={16} /> All crops
      </Link>

      <Card>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="rounded-2xl bg-brand-50 p-4 text-brand-700"><Sprout size={28} /></div>
            <div>
              <h1 className="text-xl font-extrabold text-stone-900">{crop.crop_type}{crop.variety ? ` — ${crop.variety}` : ''}</h1>
              <p className="text-sm text-stone-500">
                Planted {fmtDate(crop.planting_date)} · Expected harvest {fmtDate(crop.expected_harvest_date)}
              </p>
            </div>
          </div>
          <Badge status={crop.status} />
        </div>
        <div className="mt-5"><HealthBar score={crop.health_score} /></div>
        {crop.notes && <p className="mt-4 rounded-xl bg-stone-50 p-3 text-sm text-stone-600">{crop.notes}</p>}
        <Link to="/app/analyze" className="mt-5 inline-flex">
          <span className="inline-flex items-center gap-2 rounded-xl bg-brand-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-800">
            <ScanLine size={16} /> Run a new AI check
          </span>
        </Link>
      </Card>

      <Card>
        <h2 className="font-bold text-stone-900">Health &amp; Treatment History</h2>
        {analyses.length === 0 ? (
          <p className="mt-3 text-sm text-stone-500">No analyses for this crop yet. Upload a photo to start monitoring.</p>
        ) : (
          <div className="mt-3 divide-y divide-stone-100">
            {analyses.map((a) => (
              <Link key={a.id} to={`/app/analyses/${a.id}`} className="flex items-center gap-4 py-3 hover:bg-stone-50 -mx-2 rounded-xl px-2">
                <div className="h-11 w-11 overflow-hidden rounded-xl bg-stone-100">
                  {a.image_url ? <img src={a.image_url} alt="" className="h-full w-full object-cover" loading="lazy" /> : <div className="flex h-full items-center justify-center text-stone-300"><Leaf size={18} /></div>}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-stone-800">{a.detected_condition}</p>
                  <p className="text-xs text-stone-500">{fmtDateTime(a.created_at)} · {Math.round((a.confidence ?? 0) * 100)}% confidence</p>
                </div>
                <Badge status={a.status} />
              </Link>
            ))}
          </div>
        )}
      </Card>

      {alerts.length > 0 && (
        <Card>
          <h2 className="flex items-center gap-2 font-bold text-stone-900"><BellRing size={18} className="text-amber-600" /> Relevant Alerts &amp; Reminders</h2>
          <div className="mt-3 space-y-2">
            {alerts.slice(0, 4).map((a) => (
              <div key={a.id} className="flex items-start gap-3 rounded-xl border border-stone-100 p-3">
                <Badge status={a.severity} className="mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-stone-800">{a.title}</p>
                  <p className="text-xs text-stone-500">{a.message}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
