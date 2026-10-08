import { useEffect, useState, type FormEvent } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, MapPin, Send, Stethoscope, User } from 'lucide-react';
import { api, apiError } from '../../api/client';
import { AlertBanner, Badge, Button, Card, ConfidenceMeter, Spinner, TextArea, Field } from '../../components/ui';
import type { ExpertCase } from '../../types';
import { fmtDateTime } from '../../utils/clsx';

export default function ExpertCaseDetail() {
  const { id } = useParams();
  const [c, setC] = useState<ExpertCase | null>(null);
  const [error, setError] = useState('');
  const [comments, setComments] = useState('');
  const [recommendation, setRecommendation] = useState('');
  const [corrected, setCorrected] = useState('');
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  const load = () =>
    api.get(`/expert/cases/${id}`).then((r) => {
      const kase = r.data.case;
      setC(kase);
      setComments(kase.comments ?? '');
      setRecommendation(kase.recommendation ?? '');
    }).catch((e) => setError(apiError(e)));

  useEffect(() => { setC(null); load(); }, [id]);

  async function update(e: FormEvent, status: string) {
    e.preventDefault();
    setSaving(true); setMsg('');
    try {
      await api.patch(`/expert/cases/${id}`, {
        status,
        comments,
        recommendation,
        correctedCondition: corrected || undefined,
      });
      setMsg(status === 'resolved' ? 'Case resolved — the farmer has been notified.' : 'Case saved.');
      load();
    } catch (err) {
      setMsg(apiError(err));
    } finally {
      setSaving(false);
    }
  }

  if (error) return <AlertBanner>{error}</AlertBanner>;
  if (!c) return <Spinner label="Loading case…" />;

  const reviewStatus = c.review_status ?? c.status ?? 'pending';

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link to="/expert/cases" className="inline-flex items-center gap-1.5 text-sm font-medium text-stone-500 hover:text-brand-700">
        <ArrowLeft size={16} /> All cases
      </Link>

      <Card>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-xl font-extrabold text-stone-900">Farmer Case</h1>
            <p className="text-sm text-stone-500">Submitted {fmtDateTime(c.created_at)}</p>
          </div>
          <div className="flex gap-2">
            {c.urgent && <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-700">URGENT</span>}
            <Badge status={reviewStatus} />
          </div>
        </div>
        <div className="mt-5 flex flex-col gap-6 sm:flex-row">
          {c.image_url && (
            <img src={c.image_url} alt="Farmer's crop" className="h-48 w-full rounded-2xl object-cover sm:w-56" />
          )}
          <div className="flex-1 space-y-3 text-sm">
            <div className="flex items-center gap-2 text-stone-700">
              <User size={15} className="text-stone-400" /> <strong>{c.farmer_name}</strong>
              {c.farmer_phone && <span className="text-stone-500">· {c.farmer_phone}</span>}
            </div>
            <div className="flex items-center gap-2 text-stone-700">
              <MapPin size={15} className="text-stone-400" /> {c.farmer_location ?? c.location ?? 'Unknown location'}
            </div>
            <div>
              <p className="font-semibold text-stone-800">Crop: {c.crop_type}</p>
              <p className="text-stone-600">AI said: <em>{c.detected_condition}</em> ({Math.round((c.confidence ?? 0) * 100)}% confidence, {c.severity ?? 'unknown'} severity)</p>
            </div>
            {c.symptoms && <p className="rounded-lg bg-stone-50 p-3 text-stone-600">Farmer reported: “{c.symptoms}”</p>}
            {c.request_comment && <p className="rounded-lg bg-amber-50 p-3 text-amber-800">Farmer's note: “{c.request_comment}”</p>}
          </div>
        </div>
      </Card>

      <Card>
        <h2 className="flex items-center gap-2 font-bold text-stone-900"><Stethoscope size={18} className="text-sky-600" /> Your Review</h2>
        {msg && <div className="mt-3"><AlertBanner kind={msg.includes('notified') || msg.includes('saved') ? 'success' : 'error'}>{msg}</AlertBanner></div>}
        <form className="mt-4 space-y-4">
          <Field
            label="Correct diagnosis (optional — overrides AI result)"
            value={corrected}
            onChange={(e) => setCorrected(e.target.value)}
            placeholder={c.detected_condition ?? 'e.g. Confirmed Early Blight'}
          />
          <TextArea label="Comments" value={comments} onChange={(e) => setComments(e.target.value)} placeholder="What you see in the image, how confident you are…" />
          <TextArea label="Recommended action for the farmer" value={recommendation} onChange={(e) => setRecommendation(e.target.value)} placeholder="Clear, practical steps in simple language…" />
          <div className="flex flex-wrap gap-3">
            {reviewStatus === 'pending' && (
              <Button type="button" variant="secondary" loading={saving} onClick={(e) => update(e, 'under_review')}>
                Mark Under Review
              </Button>
            )}
            <Button type="button" variant="success" icon={Send} loading={saving} onClick={(e) => update(e, 'resolved')}>
              Send Advice &amp; Resolve
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
