import { useEffect, useState, type FormEvent } from 'react';
import { Bug, Pencil, Plus, Trash2 } from 'lucide-react';
import { api, apiError } from '../../api/client';
import { AlertBanner, Badge, Button, Card, EmptyState, Field, Modal, Select, Spinner, TextArea } from '../../components/ui';
import type { Condition } from '../../types';
import { clsx } from '../../utils/clsx';

const empty = {
  name: '', kind: 'disease' as Condition['kind'], affectedCrops: '', description: '',
  symptoms: '', treatments: '', prevention: '',
};

const KIND_STYLE: Record<string, string> = {
  pest: 'bg-orange-50 text-orange-700 border-orange-200',
  disease: 'bg-red-50 text-red-700 border-red-200',
  deficiency: 'bg-amber-50 text-amber-700 border-amber-200',
  stress: 'bg-sky-50 text-sky-700 border-sky-200',
};

export default function AdminConditions() {
  const [items, setItems] = useState<Condition[] | null>(null);
  const [modal, setModal] = useState<'closed' | 'add' | 'edit'>('closed');
  const [form, setForm] = useState(empty);
  const [editing, setEditing] = useState<Condition | null>(null);
  const [deleting, setDeleting] = useState<Condition | null>(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const load = () => api.get('/admin/conditions').then((r) => setItems(r.data.conditions));
  useEffect(() => { load(); }, []);

  const split = (s: string) => s.split('\n').map((x) => x.trim()).filter(Boolean);
  const join = (a: string[]) => a.join('\n');

  function openEdit(c: Condition) {
    setEditing(c);
    setForm({
      name: c.name, kind: c.kind, affectedCrops: c.affected_crops.join(', '),
      description: c.description ?? '', symptoms: join(c.symptoms),
      treatments: join(c.treatments), prevention: join(c.prevention),
    });
    setModal('edit');
  }

  async function save(e: FormEvent) {
    e.preventDefault();
    setSaving(true); setError('');
    const body = {
      name: form.name, kind: form.kind,
      affectedCrops: form.affectedCrops.split(',').map((s) => s.trim()).filter(Boolean),
      description: form.description,
      symptoms: split(form.symptoms), treatments: split(form.treatments), prevention: split(form.prevention),
    };
    try {
      if (modal === 'edit' && editing) await api.patch(`/admin/conditions/${editing.id}`, body);
      else await api.post('/admin/conditions', body);
      setModal('closed'); setForm(empty); setEditing(null);
      load();
    } catch (err) {
      setError(apiError(err));
    } finally {
      setSaving(false);
    }
  }

  if (!items) return <Spinner label="Loading knowledge base…" />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-stone-900">Pests &amp; Diseases</h1>
          <p className="mt-1 text-sm text-stone-500">The knowledge base the AI service draws on for identification and advice.</p>
        </div>
        <Button icon={Plus} onClick={() => { setForm(empty); setEditing(null); setModal('add'); }}>Add Condition</Button>
      </div>
      {error && <AlertBanner>{error}</AlertBanner>}

      {items.length === 0 ? (
        <EmptyState icon={Bug} title="Knowledge base is empty" hint="Add pests, diseases and deficiencies the system should recognize." />
      ) : (
        <div className="grid gap-5 md:grid-cols-2">
          {items.map((c) => (
            <Card key={c.id} className="group relative">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-bold text-stone-900">{c.name}</h3>
                    <span className={clsx('rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize', KIND_STYLE[c.kind])}>{c.kind}</span>
                  </div>
                  <p className="mt-1 text-xs text-stone-500">Affects: {c.affected_crops.join(', ') || 'many crops'}</p>
                </div>
                <div className="flex gap-1 opacity-0 transition group-hover:opacity-100">
                  <button onClick={() => openEdit(c)} aria-label={`Edit ${c.name}`} className="rounded-lg p-1.5 text-stone-400 hover:bg-stone-100"><Pencil size={15} /></button>
                  <button onClick={() => setDeleting(c)} aria-label={`Delete ${c.name}`} className="rounded-lg p-1.5 text-stone-400 hover:bg-red-50 hover:text-red-600"><Trash2 size={15} /></button>
                </div>
              </div>
              <p className="mt-2 text-sm text-stone-600">{c.description}</p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {c.symptoms.slice(0, 3).map((s) => (
                  <span key={s} className="rounded-md bg-stone-100 px-2 py-0.5 text-[11px] text-stone-600">{s}</span>
                ))}
                {c.symptoms.length > 3 && <span className="text-[11px] text-stone-400">+{c.symptoms.length - 3} more</span>}
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal open={modal !== 'closed'} onClose={() => setModal('closed')} title={modal === 'edit' ? 'Edit Condition' : 'Add Condition'} wide>
        <form onSubmit={save} className="space-y-4">
          {error && <AlertBanner>{error}</AlertBanner>}
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required placeholder="e.g. Early Blight" />
            <Select label="Type" value={form.kind} onChange={(e) => setForm({ ...form, kind: e.target.value as any })}>
              <option value="pest">Pest</option>
              <option value="disease">Disease</option>
              <option value="deficiency">Nutrient Deficiency</option>
              <option value="stress">Stress</option>
            </Select>
          </div>
          <Field label="Affected crops (comma-separated)" value={form.affectedCrops} onChange={(e) => setForm({ ...form, affectedCrops: e.target.value })} placeholder="Maize, Tomato, Rice" />
          <TextArea label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <div className="grid gap-4 sm:grid-cols-3">
            <TextArea label="Symptoms (one per line)" value={form.symptoms} onChange={(e) => setForm({ ...form, symptoms: e.target.value })} />
            <TextArea label="Treatments (one per line)" value={form.treatments} onChange={(e) => setForm({ ...form, treatments: e.target.value })} />
            <TextArea label="Prevention (one per line)" value={form.prevention} onChange={(e) => setForm({ ...form, prevention: e.target.value })} />
          </div>
          <Button type="submit" loading={saving} className="w-full">{modal === 'edit' ? 'Save Changes' : 'Add Condition'}</Button>
        </form>
      </Modal>

      <Modal open={!!deleting} onClose={() => setDeleting(null)} title="Delete Condition">
        <p className="text-sm text-stone-600">Remove <strong>{deleting?.name}</strong> from the knowledge base?</p>
        <div className="mt-5 flex gap-3">
          <Button variant="outline" className="flex-1" onClick={() => setDeleting(null)}>Cancel</Button>
          <Button variant="danger" className="flex-1" onClick={async () => { await api.delete(`/admin/conditions/${deleting!.id}`); setDeleting(null); load(); }}>Delete</Button>
        </div>
      </Modal>
    </div>
  );
}
