import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { LifeBuoy, ScanLine, Stethoscope } from 'lucide-react';
import { api } from '../../api/client';
import { Badge, Button, Card, EmptyState, Spinner } from '../../components/ui';
import type { Analysis } from '../../types';
import { fmtDateTime } from '../../utils/clsx';

export default function ExpertSupport() {
  const [analyses, setAnalyses] = useState<Analysis[] | null>(null);
  const [cases, setCases] = useState<any[]>([]);

  useEffect(() => {
    api.get('/analyses').then((r) => setAnalyses(r.data.analyses));
    // Farmer's own review requests come back through analysis detail; list shows eligible analyses.
  }, []);

  if (!analyses) return <Spinner label="Loading…" />;

  const eligible = analyses.filter((a) => a.status !== 'healthy');

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-stone-900">Expert Support</h1>
        <p className="mt-1 text-sm text-stone-500">
          Not sure about an AI result? Send it to a real agricultural expert for review.
        </p>
      </div>

      <Card className="bg-gradient-to-br from-sky-50 to-white">
        <div className="flex items-start gap-4">
          <div className="rounded-2xl bg-sky-100 p-3 text-sky-700"><Stethoscope size={24} /></div>
          <div>
            <h2 className="font-bold text-stone-900">How expert review works</h2>
            <ol className="mt-2 space-y-1.5 text-sm text-stone-600">
              <li>1. Open an analysis that worries you (or one the AI couldn't confidently identify).</li>
              <li>2. Tap <strong>Request Expert Review</strong> and add anything the expert should know.</li>
              <li>3. An expert reviews your photo and writes back with advice — you'll be notified.</li>
            </ol>
          </div>
        </div>
      </Card>

      <div>
        <h2 className="mb-3 font-bold text-stone-900">Analyses you can submit</h2>
        {eligible.length === 0 ? (
          <EmptyState
            icon={ScanLine}
            title="Nothing to review"
            hint="All your crops look healthy, or you haven't run an analysis yet."
            action={<Link to="/app/analyze"><Button icon={ScanLine}>Analyze a Crop</Button></Link>}
          />
        ) : (
          <div className="space-y-3">
            {eligible.map((a) => (
              <Link key={a.id} to={`/app/analyses/${a.id}`}>
                <Card className="flex items-center gap-4 transition hover:shadow-lift">
                  <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-stone-100">
                    {a.image_url && <img src={a.image_url} alt="" className="h-full w-full object-cover" loading="lazy" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-stone-800">{a.crop_type} — {a.detected_condition}</p>
                    <p className="text-xs text-stone-500">{fmtDateTime(a.created_at)} · AI confidence {Math.round((a.confidence ?? 0) * 100)}%</p>
                  </div>
                  <Badge status={a.status} />
                  <span className="text-xs font-semibold text-sky-700">Review →</span>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
