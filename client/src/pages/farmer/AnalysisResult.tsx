import { useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  AlertTriangle, ArrowLeft, Bug, CheckCircle2, Leaf, Lightbulb, ListChecks,
  Loader2, ScanLine, ShieldCheck, Stethoscope,
} from 'lucide-react';
import { api, apiError } from '../../api/client';
import { AlertBanner, Badge, Button, Card, ConfidenceMeter, Modal, Spinner, statusLabel, TextArea } from '../../components/ui';
import type { Analysis, ExpertCase, Indicator } from '../../types';
import { fmtDateTime } from '../../utils/clsx';

const STATUS_THEME: Record<string, { bg: string; icon: typeof Leaf; title: string }> = {
  healthy: { bg: 'from-emerald-600 to-emerald-800', icon: CheckCircle2, title: 'Healthy Crop' },
  possible_pest: { bg: 'from-orange-500 to-orange-700', icon: Bug, title: 'Possible Pest Attack' },
  possible_disease: { bg: 'from-red-600 to-red-800', icon: AlertTriangle, title: 'Possible Disease Detected' },
  possible_stress: { bg: 'from-amber-500 to-amber-700', icon: AlertTriangle, title: 'Possible Nutrient/Stress Problem' },
  undetermined: { bg: 'from-stone-500 to-stone-700', icon: ScanLine, title: 'Unable to Determine' },
};

export default function AnalysisResult() {
  const { id } = useParams();
  const location = useLocation() as any;
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [reviews, setReviews] = useState<ExpertCase[]>([]);
  const [indicators, setIndicators] = useState<Indicator[]>(location.state?.indicators ?? []);
  const [error, setError] = useState('');
  const [reviewOpen, setReviewOpen] = useState(false);
  const [comment, setComment] = useState('');
  const [urgent, setUrgent] = useState(false);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const load = () =>
    api
      .get(`/analyses/${id}`)
      .then((r) => {
        setAnalysis(r.data.analysis);
        setReviews(r.data.reviews ?? []);
      })
      .catch((e) => setError(apiError(e)));

  useEffect(() => {
    setAnalysis(null);
    load();
  }, [id]);

  if (error) {
    return (
      <div className="mx-auto max-w-2xl space-y-4">
        <AlertBanner>{error}</AlertBanner>
        <Link to="/app/analyze"><Button variant="outline" icon={ArrowLeft}>New analysis</Button></Link>
      </div>
    );
  }
  if (!analysis) return <Spinner label="Loading analysis…" />;

  const theme = STATUS_THEME[analysis.status] ?? STATUS_THEME.undetermined!;
  const conf = Math.round((analysis.confidence ?? 0) * 100);
  const lowConf = conf < 60;
  const openReview = reviews.find((r) => (r.status ?? r.review_status) !== 'resolved');

  async function requestReview() {
    setSending(true);
    try {
      await api.post(`/analyses/${id}/request-review`, { comment, urgent });
      setSent(true);
      setReviewOpen(false);
      load();
    } catch (e) {
      setError(apiError(e));
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link to="/app/history" className="inline-flex items-center gap-1.5 text-sm font-medium text-stone-500 hover:text-brand-700">
        <ArrowLeft size={16} /> Back to history
      </Link>

      {/* Hero result card */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${theme.bg} p-6 text-white sm:p-8`}
      >
        <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/10 blur-2xl" />
        <div className="flex flex-col items-start gap-6 sm:flex-row">
          {analysis.image_url && (
            <img
              src={analysis.image_url}
              alt="Analyzed crop"
              className="h-36 w-36 shrink-0 rounded-2xl border-2 border-white/30 object-cover shadow-lg"
            />
          )}
          <div className="flex-1">
            <div className="flex items-center gap-2 text-white/80">
              <theme.icon size={20} />
              <span className="text-sm font-semibold uppercase tracking-wider">Crop Health Status</span>
            </div>
            <h1 className="mt-2 text-3xl font-extrabold">{theme.title}</h1>
            <p className="mt-1 text-lg text-white/90">
              {analysis.crop_type ?? 'Crop'} — {analysis.detected_condition}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="rounded-full bg-white/20 px-3 py-1 text-sm font-semibold">AI Confidence: {conf}%</span>
              {analysis.severity && analysis.severity !== 'None' && (
                <span className="rounded-full bg-white/20 px-3 py-1 text-sm font-semibold">Severity: {analysis.severity}</span>
              )}
              {analysis.is_mock && (
                <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-medium">Simulated AI result</span>
              )}
            </div>
          </div>
          <div className="rounded-2xl bg-white p-4 text-stone-800">
            <ConfidenceMeter value={analysis.confidence ?? 0} />
          </div>
        </div>
      </motion.div>

      {lowConf && (
        <AlertBanner kind="info">
          The AI could not confidently identify the problem. Try uploading a clearer, close-up photo — or
          submit this case to an agricultural expert for review.
        </AlertBanner>
      )}
      {sent && (
        <AlertBanner kind="success">
          Your case has been sent to an agricultural expert. You'll get a notification when they respond.
        </AlertBanner>
      )}
      {error && <AlertBanner>{error}</AlertBanner>}

      <div className="grid gap-6 sm:grid-cols-2">
        <Card>
          <h2 className="flex items-center gap-2 font-bold text-stone-900"><Leaf size={18} className="text-brand-600" /> Symptoms Detected</h2>
          {analysis.symptoms_detected.length ? (
            <ul className="mt-3 space-y-2">
              {analysis.symptoms_detected.map((s) => (
                <li key={s} className="flex items-start gap-2 text-sm text-stone-600">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" /> {s}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-stone-500">No visible symptoms detected.</p>
          )}
          {analysis.symptoms && (
            <p className="mt-3 rounded-lg bg-stone-50 p-3 text-xs text-stone-500">
              You reported: “{analysis.symptoms}”
            </p>
          )}
        </Card>

        <Card>
          <h2 className="flex items-center gap-2 font-bold text-stone-900"><Bug size={18} className="text-brand-600" /> Possible Cause</h2>
          <p className="mt-3 text-sm leading-relaxed text-stone-600">{analysis.cause ?? '—'}</p>
          {indicators.length > 0 && (
            <div className="mt-4 space-y-2">
              {indicators.map((ind) => (
                <div key={ind.label}>
                  <div className="flex justify-between text-xs text-stone-500">
                    <span>{ind.label}</span><span>{ind.value}%</span>
                  </div>
                  <div className="mt-0.5 h-1.5 rounded-full bg-stone-100">
                    <div className="h-full rounded-full bg-brand-400" style={{ width: `${ind.value}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      <Card>
        <h2 className="flex items-center gap-2 font-bold text-stone-900"><ListChecks size={18} className="text-brand-600" /> Recommended Action</h2>
        <ol className="mt-3 space-y-2.5">
          {analysis.recommendations.map((r, i) => (
            <li key={i} className="flex items-start gap-3 text-sm text-stone-700">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-800">{i + 1}</span>
              {r}
            </li>
          ))}
        </ol>
      </Card>

      <Card>
        <h2 className="flex items-center gap-2 font-bold text-stone-900"><ShieldCheck size={18} className="text-brand-600" /> Prevention &amp; Monitoring</h2>
        <ul className="mt-3 space-y-2">
          {analysis.prevention.map((p) => (
            <li key={p} className="flex items-start gap-2.5 text-sm text-stone-600">
              <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-brand-600" /> {p}
            </li>
          ))}
          <li className="flex items-start gap-2.5 text-sm text-stone-600">
            <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-brand-600" />
            Re-check this crop with a new photo in 3–5 days to see if the problem is spreading.
          </li>
        </ul>
      </Card>

      {/* Expert reviews */}
      {reviews.length > 0 && (
        <Card>
          <h2 className="flex items-center gap-2 font-bold text-stone-900"><Stethoscope size={18} className="text-sky-600" /> Expert Review</h2>
          {reviews.map((r) => (
            <div key={r.id} className="mt-3 rounded-xl bg-sky-50 p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-sky-900">{r.expert_name ?? 'Assigned expert pending'}</p>
                <Badge status={r.status ?? r.review_status ?? 'pending'} />
              </div>
              {r.comments && <p className="mt-2 text-sm text-sky-800">{r.comments}</p>}
              {r.recommendation && (
                <p className="mt-2 rounded-lg bg-white/70 p-3 text-sm font-medium text-stone-700">
                  <Lightbulb size={14} className="mr-1 inline text-amber-500" /> {r.recommendation}
                </p>
              )}
            </div>
          ))}
        </Card>
      )}

      <div className="flex flex-wrap gap-3">
        <Link to="/app/analyze"><Button variant="outline" icon={ScanLine}>Analyze Another Crop</Button></Link>
        {!openReview && analysis.status !== 'healthy' && (
          <Button variant="secondary" icon={Stethoscope} onClick={() => setReviewOpen(true)}>
            Request Expert Review
          </Button>
        )}
      </div>

      <Modal open={reviewOpen} onClose={() => setReviewOpen(false)} title="Request Expert Review">
        <p className="text-sm text-stone-500">
          Send this analysis — image, AI result and symptoms — to an agricultural expert.
        </p>
        <div className="mt-4 space-y-4">
          <TextArea
            label="Message for the expert"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Anything else the expert should know? When did it start? What have you tried?"
          />
          <label className="flex items-center gap-2.5 text-sm text-stone-700">
            <input type="checkbox" checked={urgent} onChange={(e) => setUrgent(e.target.checked)} className="h-4 w-4 rounded border-stone-300 text-brand-700 focus:ring-brand-500" />
            Mark as urgent (spreading fast / many plants affected)
          </label>
          <Button onClick={requestReview} loading={sending} className="w-full">Send to Expert</Button>
        </div>
      </Modal>
    </div>
  );
}
