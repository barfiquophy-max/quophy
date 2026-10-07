import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Leaf, ScanLine } from 'lucide-react';
import { api } from '../../api/client';
import { Badge, Button, Card, EmptyState, Spinner } from '../../components/ui';
import type { Analysis } from '../../types';
import { fmtDateTime } from '../../utils/clsx';

export default function History() {
  const [analyses, setAnalyses] = useState<Analysis[] | null>(null);

  useEffect(() => {
    api.get('/analyses').then((r) => setAnalyses(r.data.analyses));
  }, []);

  if (!analyses) return <Spinner label="Loading history…" />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-stone-900">Crop History</h1>
        <p className="mt-1 text-sm text-stone-500">Every AI analysis you have run, newest first.</p>
      </div>
      {analyses.length === 0 ? (
        <EmptyState
          icon={ScanLine}
          title="No analyses yet"
          hint="Your crop analyses will appear here so you can track problems over time."
          action={<Link to="/app/analyze"><Button icon={ScanLine}>Analyze a Crop</Button></Link>}
        />
      ) : (
        <Card className="p-0">
          <div className="divide-y divide-stone-100">
            {analyses.map((a) => (
              <Link key={a.id} to={`/app/analyses/${a.id}`} className="flex items-center gap-4 px-5 py-4 transition hover:bg-stone-50">
                <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-stone-100">
                  {a.image_url ? <img src={a.image_url} alt="" className="h-full w-full object-cover" loading="lazy" /> : <div className="flex h-full items-center justify-center text-stone-300"><Leaf size={20} /></div>}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-stone-800">{a.crop_type ?? a.linked_crop_type ?? 'Crop'} — {a.detected_condition}</p>
                  <p className="text-xs text-stone-500">
                    {fmtDateTime(a.created_at)} · Confidence {Math.round((a.confidence ?? 0) * 100)}%
                    {a.severity && a.severity !== 'None' ? ` · ${a.severity}` : ''}
                    {a.is_mock ? ' · Simulated' : ''}
                  </p>
                </div>
                <Badge status={a.status} />
              </Link>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
