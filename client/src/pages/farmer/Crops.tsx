import { useEffect, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Sprout, Trash2 } from 'lucide-react';
import { api, apiError } from '../../api/client';
import { AlertBanner, Badge, Button, Card, EmptyState, Field, HealthBar, Modal, Select, Spinner, TextArea } from '../../components/ui';
import type { Crop, Farm } from '../../types';
import { fmtDate } from '../../utils/clsx';

const CROP_TYPES = ['Maize', 'Tomato', 'Pepper', 'Cassava', 'Plantain', 'Cocoa', 'Rice', 'Other'];
const empty = { farmId: '', cropType: '', variety: '', plantingDate: '', expectedHarvestDate: '', notes: '' };

export default function Crops() {
  const [crops, setCrops] = useState<Crop[]>([]);
  const [farms, setFarms] = useState<Farm[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(empty);
  const [deleting, setDeleting] = useState<Crop | null>(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const load = () =>
    Promise.all([api.get('/crops'), api.get('/farms')]).then(([c, f]) => {
      setCrops(c.data.crops);
      setFarms(f.data.farms);
    }).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  async function save(e: FormEvent) {
    e.preventDefault();
    setError(''); setSaving(true);
    try {
      await api.post('/crops', form);
      setModal(false);
      setForm(empty);
      load();
    } catch (err) {
      setError(apiError(err));
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <Spinner label="Loading crops…" />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-stone-900">My Crops</h1>
          <p className="mt-1 text-sm text-stone-500">Monitor the health of every crop you're growing.</p>
        </div>
        <Button icon={Plus} onClick={() => setModal(true)} disabled={farms.length === 0}>Add Crop</Button>
      </div>
      {error && <AlertBanner>{error}</AlertBanner>}
      {farms.length === 0 && (
        <AlertBanner kind="info">You need to add a farm first. Go to My Farms to register one.</AlertBanner>
      )}

      {crops.length === 0 ? (
        <EmptyState icon={Sprout} title="No crops registered" hint="Add crops to a farm so you can track their health over time." />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {crops.map((c) => (
            <Card key={c.id} className="group relative transition hover:shadow-lift">
              <Link to={`/app/crops/${c.id}`} className="block">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-brand-50 p-2.5 text-brand-700"><Sprout size={20} /></div>
                    <div>
                      <p className="font-bold text-stone-900">{c.crop_type}{c.variety ? ` · ${c.variety}` : ''}</p>
                      <p className="text-xs text-stone-500">{c.farm_name}</p>
                    </div>
                  </div>
                  <Badge status={c.status} />
                </div>
                <div className="mt-4"><HealthBar score={c.health_score} /></div>
                <div className="mt-3 flex justify-between text-xs text-stone-500">
                  <span>Planted {fmtDate(c.planting_date)}</span>
                  <span>Harvest ~{fmtDate(c.expected_harvest_date)}</span>
                </div>
                <p className="mt-2 text-xs text-stone-400">{(c.analyses ?? []).length} AI {(c.analyses ?? []).length === 1 ? 'analysis' : 'analyses'}</p>
              </Link>
              <button
                onClick={() => setDeleting(c)}
                aria-label={`Delete ${c.crop_type}`}
                className="absolute right-3 top-3 rounded-lg p-1.5 text-stone-300 opacity-0 transition hover:bg-red-50 hover:text-red-600 group-hover:opacity-100"
              >
                <Trash2 size={15} />
              </button>
            </Card>
          ))}
        </div>
      )}

      <Modal open={modal} onClose={() => setModal(false)} title="Add Crop">
        <form onSubmit={save} className="space-y-4">
          {error && <AlertBanner>{error}</AlertBanner>}
          <Select label="Farm" value={form.farmId} onChange={(e) => setForm({ ...form, farmId: e.target.value })} required>
            <option value="">Select farm…</option>
            {farms.map((f) => <option key={f.id} value={f.id}>{f.farm_name}</option>)}
          </Select>
          <Select label="Crop type" value={form.cropType} onChange={(e) => setForm({ ...form, cropType: e.target.value })} required>
            <option value="">Select crop…</option>
            {CROP_TYPES.map((c) => <option key={c} value={c}>{c}</option>)}
          </Select>
          <Field label="Variety (optional)" value={form.variety} onChange={(e) => setForm({ ...form, variety: e.target.value })} placeholder="e.g. Obatanpa" />
          <div className="grid grid-cols-2 gap-4">
            <Field label="Planting date" type="date" value={form.plantingDate} onChange={(e) => setForm({ ...form, plantingDate: e.target.value })} />
            <Field label="Expected harvest" type="date" value={form.expectedHarvestDate} onChange={(e) => setForm({ ...form, expectedHarvestDate: e.target.value })} />
          </div>
          <TextArea label="Notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          <Button type="submit" loading={saving} className="w-full">Add Crop</Button>
        </form>
      </Modal>

      <Modal open={!!deleting} onClose={() => setDeleting(null)} title="Delete Crop">
        <p className="text-sm text-stone-600">Delete <strong>{deleting?.crop_type}</strong>? Its analysis history will be kept but unlinked.</p>
        <div className="mt-5 flex gap-3">
          <Button variant="outline" className="flex-1" onClick={() => setDeleting(null)}>Cancel</Button>
          <Button variant="danger" className="flex-1" onClick={async () => { await api.delete(`/crops/${deleting!.id}`); setDeleting(null); load(); }}>Delete</Button>
        </div>
      </Modal>
    </div>
  );
}
