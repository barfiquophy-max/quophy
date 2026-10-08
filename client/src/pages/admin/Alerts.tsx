import { useEffect, useState, type FormEvent } from 'react';
import { BellRing, Pencil, Plus, Trash2 } from 'lucide-react';
import { api, apiError } from '../../api/client';
import { AlertBanner, Badge, Button, Card, EmptyState, Field, Modal, Select, Spinner, TextArea } from '../../components/ui';
import type { Alert } from '../../types';
import { fmtDateTime } from '../../utils/clsx';

const empty = { title: '', message: '', alertType: 'general' as Alert['alert_type'], location: '', severity: 'info' as Alert['severity'] };

export default function AdminAlerts() {
  const [alerts, setAlerts] = useState<Alert[] | null>(null);
  const [modal, setModal] = useState<'closed' | 'add' | 'edit'>('closed');
  const [form, setForm] = useState(empty);
  const [editing, setEditing] = useState<Alert | null>(null);
  const [deleting, setDeleting] = useState<Alert | null>(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const load = () => api.get('/admin/alerts').then((r) => setAlerts(r.data.alerts));
  useEffect(() => { load(); }, []);

  function openEdit(a: Alert) {
    setEditing(a);
    setForm({ title: a.title, message: a.message, alertType: a.alert_type, location: a.location ?? '', severity: a.severity });
    setModal('edit');
  }

  async function save(e: FormEvent) {
    e.preventDefault();
    setSaving(true); setError('');
    try {
      if (modal === 'edit' && editing) await api.patch(`/admin/alerts/${editing.id}`, form);
      else await api.post('/admin/alerts', form);
      setModal('closed'); setForm(empty); setEditing(null);
      load();
    } catch (err) {
      setError(apiError(err));
    } finally {
      setSaving(false);
    }
  }

  if (!alerts) return <Spinner label="Loading alerts…" />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-stone-900">Alerts</h1>
          <p className="mt-1 text-sm text-stone-500">Broadcast pest, disease and weather alerts — optionally targeted to a region.</p>
        </div>
        <Button icon={Plus} onClick={() => { setForm(empty); setEditing(null); setModal('add'); }}>Create Alert</Button>
      </div>
      {error && <AlertBanner>{error}</AlertBanner>}

      {alerts.length === 0 ? (
        <EmptyState icon={BellRing} title="No alerts" hint="Create an alert to warn farmers about outbreaks or weather." />
      ) : (
        <div className="space-y-3">
          {alerts.map((a) => (
            <Card key={a.id} className="group flex items-start gap-4">
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-bold text-stone-900">{a.title}</p>
                  <Badge status={a.severity} />
                  <span className="rounded-full bg-stone-100 px-2.5 py-0.5 text-xs font-medium capitalize text-stone-600">{a.alert_type}</span>
                  {a.location ? (
                    <span className="rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-medium text-brand-700">{a.location}</span>
                  ) : (
                    <span className="rounded-full bg-stone-100 px-2.5 py-0.5 text-xs text-stone-500">All regions</span>
                  )}
                </div>
                <p className="mt-1 text-sm text-stone-600">{a.message}</p>
                <p className="mt-1 text-xs text-stone-400">{fmtDateTime(a.created_at)}</p>
              </div>
              <div className="flex gap-1 opacity-0 transition group-hover:opacity-100">
                <button onClick={() => openEdit(a)} aria-label={`Edit ${a.title}`} className="rounded-lg p-1.5 text-stone-400 hover:bg-stone-100"><Pencil size={16} /></button>
                <button onClick={() => setDeleting(a)} aria-label={`Delete ${a.title}`} className="rounded-lg p-1.5 text-stone-400 hover:bg-red-50 hover:text-red-600"><Trash2 size={16} /></button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal open={modal !== 'closed'} onClose={() => setModal('closed')} title={modal === 'edit' ? 'Edit Alert' : 'Create Alert'}>
        <form onSubmit={save} className="space-y-4">
          {error && <AlertBanner>{error}</AlertBanner>}
          <Field label="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required placeholder="e.g. Fall Armyworm activity reported" />
          <TextArea label="Message" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} required placeholder="What farmers should know and do…" />
          <div className="grid grid-cols-2 gap-4">
            <Select label="Type" value={form.alertType} onChange={(e) => setForm({ ...form, alertType: e.target.value as any })}>
              <option value="pest">Pest</option>
              <option value="disease">Disease</option>
              <option value="crop">Crop</option>
              <option value="weather">Weather</option>
              <option value="treatment">Treatment reminder</option>
              <option value="general">General</option>
            </Select>
            <Select label="Severity" value={form.severity} onChange={(e) => setForm({ ...form, severity: e.target.value as any })}>
              <option value="info">Info</option>
              <option value="warning">Warning</option>
              <option value="critical">Critical</option>
            </Select>
          </div>
          <Field label="Target region (blank = all farmers)" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="e.g. Northern Region" />
          <Button type="submit" loading={saving} className="w-full">{modal === 'edit' ? 'Save Changes' : 'Publish Alert'}</Button>
        </form>
      </Modal>

      <Modal open={!!deleting} onClose={() => setDeleting(null)} title="Delete Alert">
        <p className="text-sm text-stone-600">Delete <strong>{deleting?.title}</strong>?</p>
        <div className="mt-5 flex gap-3">
          <Button variant="outline" className="flex-1" onClick={() => setDeleting(null)}>Cancel</Button>
          <Button variant="danger" className="flex-1" onClick={async () => { await api.delete(`/admin/alerts/${deleting!.id}`); setDeleting(null); load(); }}>Delete</Button>
        </div>
      </Modal>
    </div>
  );
}
