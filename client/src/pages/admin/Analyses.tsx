import { useEffect, useState } from 'react';
import { Leaf, ScanLine } from 'lucide-react';
import { api } from '../../api/client';
import { Badge, Card, EmptyState, Spinner } from '../../components/ui';
import type { Analysis } from '../../types';
import { fmtDateTime } from '../../utils/clsx';

export default function AdminAnalyses() {
  const [items, setItems] = useState<(Analysis & { farmer_email?: string })[] | null>(null);

  useEffect(() => {
    api.get('/admin/analyses').then((r) => setItems(r.data.analyses));
  }, []);

  if (!items) return <Spinner label="Loading analyses…" />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-stone-900">AI Analyses</h1>
        <p className="mt-1 text-sm text-stone-500">Every analysis run on the platform, across all farmers.</p>
      </div>
      {items.length === 0 ? (
        <EmptyState icon={ScanLine} title="No analyses yet" />
      ) : (
        <Card className="overflow-x-auto p-0">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-stone-100 text-xs uppercase tracking-wide text-stone-400">
                <th className="px-5 py-3.5 font-semibold">Image</th>
                <th className="px-5 py-3.5 font-semibold">Farmer</th>
                <th className="px-5 py-3.5 font-semibold">Crop</th>
                <th className="px-5 py-3.5 font-semibold">Result</th>
                <th className="px-5 py-3.5 font-semibold">Confidence</th>
                <th className="px-5 py-3.5 font-semibold">Status</th>
                <th className="px-5 py-3.5 font-semibold">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-50">
              {items.map((a) => (
                <tr key={a.id} className="hover:bg-stone-50">
                  <td className="px-5 py-3">
                    <div className="h-10 w-10 overflow-hidden rounded-lg bg-stone-100">
                      {a.image_url ? <img src={a.image_url} alt="" className="h-full w-full object-cover" loading="lazy" /> : <div className="flex h-full items-center justify-center text-stone-300"><Leaf size={16} /></div>}
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <p className="font-semibold text-stone-800">{a.farmer_name}</p>
                    <p className="text-xs text-stone-400">{a.farmer_email}</p>
                  </td>
                  <td className="px-5 py-3 text-stone-600">{a.crop_type}</td>
                  <td className="px-5 py-3 text-stone-600">{a.detected_condition}</td>
                  <td className="px-5 py-3 font-semibold text-stone-700">{Math.round((a.confidence ?? 0) * 100)}%</td>
                  <td className="px-5 py-3"><Badge status={a.status} /></td>
                  <td className="px-5 py-3 text-stone-500">{fmtDateTime(a.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}
