import { useEffect, useRef, useState, type DragEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, CheckCircle2, CloudUpload, ImageIcon, Loader2, ScanLine, X } from 'lucide-react';
import { api, apiError } from '../../api/client';
import { AlertBanner, Button, Field, Select, TextArea, Card } from '../../components/ui';
import { compressImage } from '../../utils/clsx';
import type { Crop, Farm, Indicator } from '../../types';

const STAGES = [
  'Image uploaded',
  'Image quality checked',
  'Crop condition analyzed',
  'Possible problems identified',
  'Severity assessed',
  'Recommendations generated',
];

const CROP_TYPES = ['Maize', 'Tomato', 'Pepper', 'Cassava', 'Plantain', 'Cocoa', 'Rice', 'Other'];

export default function Analyze() {
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState('');
  const [cropType, setCropType] = useState('');
  const [cropId, setCropId] = useState('');
  const [farmId, setFarmId] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [farms, setFarms] = useState<Farm[]>([]);
  const [crops, setCrops] = useState<Crop[]>([]);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState('');
  const [phase, setPhase] = useState<'form' | 'scanning' | 'done'>('form');
  const [stage, setStage] = useState(0);
  const [progress, setProgress] = useState(0);
  const [indicators, setIndicators] = useState<Indicator[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.get('/farms').then((r) => setFarms(r.data.farms)).catch(() => {});
    api.get('/crops').then((r) => setCrops(r.data.crops)).catch(() => {});
  }, []);

  function pick(f: File | undefined | null) {
    if (!f) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(f.type)) {
      setError('Please upload a JPG, JPEG or PNG image of your crop.');
      return;
    }
    if (f.size > 8 * 1024 * 1024) {
      setError('The image is too large. Please upload one under 8 MB.');
      return;
    }
    setError('');
    setFile(f);
    setPreview(URL.createObjectURL(f));
  }

  function onDrop(e: DragEvent) {
    e.preventDefault();
    setDragging(false);
    pick(e.dataTransfer.files?.[0]);
  }

  async function onAnalyze() {
    if (!file) {
      setError('Please upload a clear image of the crop or affected area.');
      return;
    }
    setError('');
    setPhase('scanning');
    setStage(0);
    setProgress(0);
    setSubmitting(true);

    // Drive the staged animation while the request runs.
    const stageTimer = setInterval(() => {
      setStage((s) => Math.min(s + 1, STAGES.length - 1));
    }, 900);
    const progressTimer = setInterval(() => {
      setProgress((p) => Math.min(p + Math.random() * 9, 92));
    }, 200);

    try {
      const compressed = await compressImage(file);
      const fd = new FormData();
      fd.append('image', compressed);
      if (cropType) fd.append('cropType', cropType);
      if (cropId) fd.append('cropId', cropId);
      if (farmId) fd.append('farmId', farmId);
      if (symptoms) fd.append('symptoms', symptoms);
      if (location) fd.append('location', location);
      if (notes) fd.append('notes', notes);
      const r = await api.post('/analyses', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setIndicators(r.data.indicators ?? []);
      setProgress(100);
      setStage(STAGES.length - 1);
      const id = r.data.analysis.id;
      setTimeout(() => navigate(`/app/analyses/${id}`, { state: { indicators: r.data.indicators } }), 700);
    } catch (err) {
      setPhase('form');
      setError(apiError(err));
    } finally {
      clearInterval(stageTimer);
      clearInterval(progressTimer);
      setSubmitting(false);
    }
  }

  const farmCrops = farmId ? crops.filter((c) => c.farm_id === farmId) : crops;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-stone-900">AI Crop Analysis</h1>
        <p className="mt-1 text-sm text-stone-500">
          Upload a clear photo of the crop, leaf or affected area. The AI will check for pests, diseases and stress signs.
        </p>
      </div>

      <AnimatePresence mode="wait">
        {phase === 'form' && (
          <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-5">
            {error && <AlertBanner>{error}</AlertBanner>}

            {/* Upload area */}
            <div
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={onDrop}
              onClick={() => inputRef.current?.click()}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
              aria-label="Upload a photo of your crop"
              className={`relative flex min-h-56 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 text-center transition-all
                ${dragging ? 'border-brand-500 bg-brand-50 scale-[1.01]' : 'border-stone-300 bg-white hover:border-brand-400 hover:bg-brand-50/40'}`}
            >
              <input
                ref={inputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                capture="environment"
                className="hidden"
                onChange={(e) => pick(e.target.files?.[0])}
              />
              {preview ? (
                <div className="relative w-full max-w-sm">
                  <motion.img
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    src={preview}
                    alt="Selected crop"
                    className="mx-auto max-h-64 rounded-xl object-cover shadow-card"
                  />
                  <button
                    onClick={(e) => { e.stopPropagation(); setFile(null); setPreview(''); }}
                    aria-label="Remove image"
                    className="absolute -right-2 -top-2 rounded-full bg-white p-1.5 text-stone-500 shadow-md hover:text-red-600"
                  >
                    <X size={16} />
                  </button>
                  <p className="mt-3 text-xs text-stone-400">Tap to change photo · compressed automatically before upload</p>
                </div>
              ) : (
                <>
                  <motion.div
                    animate={{ y: [0, -6, 0] }}
                    transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut' }}
                    className="rounded-2xl bg-brand-50 p-4 text-brand-600"
                  >
                    <CloudUpload size={32} />
                  </motion.div>
                  <p className="mt-4 font-semibold text-stone-800">Upload a photo of your crop</p>
                  <p className="mt-1 text-sm text-stone-500">Drag &amp; drop, or tap to browse / use camera</p>
                  <p className="mt-2 text-xs text-stone-400">JPG, JPEG or PNG · up to 8 MB</p>
                  <span className="mt-4 inline-flex items-center gap-2 rounded-xl border border-stone-200 bg-stone-50 px-4 py-2 text-sm font-medium text-stone-600">
                    <Camera size={16} /> Choose photo
                  </span>
                </>
              )}
            </div>

            {/* Details */}
            <Card>
              <h2 className="mb-4 font-bold text-stone-900">Crop details <span className="text-sm font-normal text-stone-400">(optional but improves accuracy)</span></h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <Select label="Crop type" value={cropType} onChange={(e) => setCropType(e.target.value)}>
                  <option value="">Select crop…</option>
                  {CROP_TYPES.map((c) => <option key={c} value={c}>{c}</option>)}
                </Select>
                <Select label="Farm" value={farmId} onChange={(e) => { setFarmId(e.target.value); setCropId(''); }}>
                  <option value="">Not linked to a farm</option>
                  {farms.map((f) => <option key={f.id} value={f.id}>{f.farm_name}</option>)}
                </Select>
                <Select label="Link to monitored crop" value={cropId} onChange={(e) => setCropId(e.target.value)}>
                  <option value="">Just analyze this photo</option>
                  {farmCrops.map((c) => <option key={c.id} value={c.id}>{c.crop_type} ({c.farm_name})</option>)}
                </Select>
                <Field label="Location / farm area" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. Northern Region" />
              </div>
              <div className="mt-4 space-y-4">
                <TextArea
                  label="Symptoms you have noticed"
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                  placeholder="e.g. Yellow spots on leaves, curling leaves, small green insects, holes in leaves…"
                />
                <TextArea
                  label="Additional notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="When did it start? How many plants are affected? Any recent weather changes?"
                />
              </div>
            </Card>

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              onClick={onAnalyze}
              disabled={!file || submitting}
              className="flex w-full items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-brand-700 to-brand-600 px-6 py-4 text-lg font-bold text-white shadow-lift transition disabled:opacity-50"
            >
              <ScanLine size={22} /> Analyze Crop with AI
            </motion.button>
            <p className="text-center text-xs text-stone-400">
              AI results are advisory. A real diagnosis may still need an agricultural expert.
            </p>
          </motion.div>
        )}

        {phase === 'scanning' && (
          <motion.div
            key="scanning"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            <Card className="overflow-hidden">
              <div className="flex items-center gap-2 text-sm font-bold tracking-widest text-brand-700">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="absolute h-full w-full animate-pulseRing rounded-full bg-brand-500" />
                  <span className="h-2.5 w-2.5 rounded-full bg-brand-600" />
                </span>
                AI SCANNING
              </div>
              <div className="relative mx-auto mt-5 max-w-sm">
                <img src={preview} alt="Crop being analyzed" className="mx-auto max-h-72 w-full rounded-2xl object-cover" />
                <div className="absolute inset-0 overflow-hidden rounded-2xl">
                  <div className="absolute inset-x-0 h-1 animate-scanline bg-gradient-to-r from-transparent via-leaf to-transparent shadow-[0_0_20px_#84cc16]" />
                  <div className="absolute inset-0 bg-gradient-to-b from-brand-500/5 to-brand-700/10" />
                </div>
                <div className="absolute left-3 top-3 rounded-md bg-stone-900/60 px-2 py-1 text-[10px] font-semibold text-leaf">
                  Leaf condition · Color patterns · Spots · Pest signs
                </div>
              </div>
              <div className="mt-6 space-y-2.5">
                {STAGES.map((s, i) => (
                  <motion.div
                    key={s}
                    initial={{ opacity: 0.3 }}
                    animate={{ opacity: i <= stage ? 1 : 0.35 }}
                    className="flex items-center gap-3 text-sm"
                  >
                    {i < stage || (i === stage && progress >= 100) ? (
                      <CheckCircle2 size={18} className="text-emerald-600" />
                    ) : i === stage ? (
                      <Loader2 size={18} className="animate-spin text-brand-600" />
                    ) : (
                      <div className="h-[18px] w-[18px] rounded-full border-2 border-stone-200" />
                    )}
                    <span className={i <= stage ? 'font-medium text-stone-800' : 'text-stone-400'}>{s}</span>
                  </motion.div>
                ))}
              </div>
              <div className="mt-6">
                <div className="flex justify-between text-xs font-medium text-stone-500">
                  <span>AI is analyzing your crop…</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-stone-100">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-brand-600 to-leaf"
                    animate={{ width: `${progress}%` }}
                    transition={{ ease: 'easeOut' }}
                  />
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
