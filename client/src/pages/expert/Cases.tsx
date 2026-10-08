import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ClipboardList } from 'lucide-react';
import { api } from '../../api/client';
import { Badge, Card, EmptyState, Spinner } from '../../components/ui';
import type { ExpertCase } from '../../types';
import { clsx, fmtDateTime } from '../../utils/clsx';

const TABS = [
  { key: '', label: 'All Cases' },
  { key: 'pending', label: 'Pending' },
  { key: 'under_review', label: 'Under Review' },
  { key: 'resolved', label: 'Resolved' },
];

export default function ExpertCases() {
  const [params, setParams] = useSearchParams();
  const status = params.get('status') ?? '';
  const [cases, setCases] = useState<ExpertCase[] | null>(null);

  useEffect(() => {
    setCases(null);
    api.get('/expert/cases', { params: status ? { status } : {} }).then((r) => setCases(r.data.cases));
  }, [status]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-stone-900">Farmer Cases</h1>
        <p className="mt-1 text-sm text-stone-500">Review AI analyses flagged by farmers and share advice.</p>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setParams(t.key ? { status: t.key } : {})}
            className={clsx(
              'whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition',
              status === t.key ? 'bg-brand-700 text-white' : 'bg-white text-stone-600 border border-stone-200 hover:border-brand-300',
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {!cases ? (
        <Spinner label="Loading cases…" />
      ) : cases.length === 0 ? (
        <EmptyState icon={ClipboardList} title="No cases here" hint="Cases matching this filter will appear here." />
      ) : (
        <Card className="p-0">
          <div className="divide-y divide-stone-100">
            {cases.map((c) => (
              <Link key={c.id} to={`/expert/cases/${c.id}`} className="flex items-center gap-4 px-5 py-4 hover:bg-stone-50">
                <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-stone-100">
                  {c.image_url && <img src={c.image_url} alt="" className="h-full w-full object-cover" loading="lazy" />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-stone-800">
                    {c.crop_type} — {c.detected_condition}
                    {c.urgent && <span className="ml-2 rounded bg-red-100 px-1.5 py-0.5 text-[10px] font-bold text-red-700">URGENT</span>}
                  </p>
                  <p className="text-xs text-stone-500">
                    {c.farmer_name} · {c.farmer_location ?? 'Unknown'} · AI {Math.round((c.confidence ?? 0) * 100)}% · {fmtDateTime(c.created_at)}
                  </p>
                </div>
                <Badge status={c.status ?? 'pending'} />
              </Link>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
