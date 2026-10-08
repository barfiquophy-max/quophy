import { useEffect, useState, type FormEvent } from 'react';
import { MapPin, Plus, Pencil, Trash2, Sprout, TriangleAlert } from 'lucide-react';
import { api, apiError } from '../../api/client';
import { AlertBanner, Button, Card, EmptyState, Field, Modal, Spinner, TextArea, Badge } from '../../components/ui';
import type { Farm } from '../../types';
import { fmtDate } from '../../utils/clsx';

const empty = { farmName: '', location: '', size: '', notes: '' };

export default function Farms() {
  const [farms, setFarms] = useState<Farm[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<'closed' | 'add' | 'edit'>('closed');
  const [form, setForm] = useState(empty);
  const [editing, setEditing] = useState<Farm | null>(null);
  const [deleting, setDeleting] = useState<Farm | null>(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const load = () => api.get('/farms').then((r) => setFarms(r.data.farms)).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  function openEdit(f: Farm) {
    setEditing(f);
    setForm({ farmName: f.farm_name, location: f.location ?? '', size: f.size ? String(f.size) : '', notes: f.notes ?? '' });
    setModal('edit');
  }

  async function save(e: FormEvent) {
    e.preventDefault();
    setError(''); setSaving(true);
    const body = { farmName: form.farmName, location: form.location, size: form.size ? Number(form.size) : null, notes: form.notes };
    try {
      if (modal === 'edit' && editing) await api.patch(`/farms/${editing.id}`, body);
      else await api.post('/farms', body);
      setModal('closed');
      setForm(empty);
      setEditing(null);
      load();
    } catch (err) {
      setError(apiError(err));
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (!deleting) return;
    await api.delete(`/farms/${deleting.id}`).catch((e) => setError(apiError(e)));
    setDeleting(null);
    load();
  }

  if (loading) return <Spinner label="Loading farms…" />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-stone-900">My Farms</h1>
          <p className="mt-1 text-sm text-stone-500">Register and manage your farms and fields.</p>
        </div>
        <Button icon={Plus} onClick={() => { setForm(empty); setEditing(null); setModal('add'); }}>Add Farm</Button>
      </div>
      {error && <AlertBanner>{error}</AlertBanner>}

      {farms.length === 0 ? (
        <EmptyState
          icon={MapPin}
          title="No farms yet"
          hint="Add your first farm to start monitoring crops and receiving regional alerts."
          action={<Button icon={Plus} onClick={() => setModal('add')}>Add Your First Farm</Button>}
        />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {farms.map((f, i) => (
            <Card key={f.id} className="group relative transition hover:shadow-lift">
              <div className="flex items-start justify-between">
                <div className="rounded-xl bg-brand-50 p-3 text-brand-700"><MapPin size={22} /></div>
                <div className="flex gap-1 opacity-0 transition group-hover:opacity-100">
                  <button onClick={() => openEdit(f)} aria-label={`Edit ${f.farm_name}`} className="rounded-lg p-1.5 text-stone-400 hover:bg-stone-100 hover:text-stone-700"><Pencil size={16} /></button>
                  <button onClick={() => setDeleting(f)} aria-label={`Delete ${f.farm_name}`} className="rounded-lg p-1.5 text-stone-400 hover:bg-red-50 hover:text-red-600"><Trash2 size={16} /></button>
                </div>
              </div>
              <h3 className="mt-3 font-bold text-stone-900">{f.farm_name}</h3>
              <p className="text-sm text-stone-500">{f.location || 'No location set'} {f.size ? `· ${f.size} ha` : ''}</p>
              <div className="mt-4 flex items-center gap-4 border-t border-stone-100 pt-3 text-xs text-stone-500">
                <span className="flex items-center gap-1"><Sprout size={14} className="text-brand-600" /> {f.crop_count ?? 0} crops</span>
                {(f.attention_count ?? 0) > 0 && (
                  <span className="flex items-center gap-1 font-semibold text-amber-600"><TriangleAlert size={14} /> {f.attention_count} need attention</span>
                )}
                <span className="ml-auto">{fmtDate(f.created_at)}</span>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal open={modal !== 'closed'} onClose={() => setModal('closed')} title={modal === 'edit' ? 'Edit Farm' : 'Add Farm'}>
        <form onSubmit={save} className="space-y-4">
          {error && <AlertBanner>{error}</AlertBanner>}
          <Field label="Farm name" value={form.farmName} onChange={(e) => setForm({ ...form, farmName: e.target.value })} required placeholder="e.g. Green Valley Farm" />
          <Field label="Location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Region / town" />
          <Field label="Farm size (hectares)" type="number" step="0.1" min="0" value={form.size} onChange={(e) => setForm({ ...form, size: e.target.value })} placeholder="e.g. 4.5" />
          <TextArea label="Notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Soil type, irrigation, anything useful…" />
          <Button type="submit" loading={saving} className="w-full">{modal === 'edit' ? 'Save Changes' : 'Add Farm'}</Button>
        </form>
      </Modal>

      <Modal open={!!deleting} onClose={() => setDeleting(null)} title="Delete Farm">
        <p className="text-sm text-stone-600">
          Delete <strong>{deleting?.farm_name}</strong>? All crops and their history on this farm will be removed. This cannot be undone.
        </p>
        <div className="mt-5 flex gap-3">
          <Button variant="outline" className="flex-1" onClick={() => setDeleting(null)}>Cancel</Button>
          <Button variant="danger" className="flex-1" onClick={remove}>Delete</Button>
        </div>
      </Modal>
    </div>
  );
}
