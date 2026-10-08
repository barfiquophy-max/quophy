import { useEffect, useState, type FormEvent } from 'react';
import { Bell, KeyRound, Save } from 'lucide-react';
import { api, apiError } from '../../api/client';
import { useAuth } from '../../auth/AuthContext';
import { AlertBanner, Button, Card, Field, Spinner } from '../../components/ui';

const PREFS = [
  { key: 'alerts', label: 'Pest & disease alerts', desc: 'Regional outbreak warnings' },
  { key: 'weather', label: 'Weather alerts', desc: 'Rainfall and weather warnings' },
  { key: 'reminders', label: 'Treatment reminders', desc: 'Scheduled treatment due dates' },
  { key: 'expert', label: 'Expert updates', desc: 'Replies to your expert cases' },
] as const;

export default function SettingsPage() {
  const { user, setUser } = useAuth();
  const [prefs, setPrefs] = useState<Record<string, boolean>>({});
  const [pw, setPw] = useState({ current: '', next: '', confirm: '' });
  const [msg, setMsg] = useState<{ kind: 'success' | 'error'; text: string } | null>(null);
  const [pwMsg, setPwMsg] = useState<{ kind: 'success' | 'error'; text: string } | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user?.notificationPrefs) setPrefs(user.notificationPrefs as Record<string, boolean>);
  }, [user]);

  if (!user) return <Spinner />;

  async function savePrefs() {
    setSaving(true); setMsg(null);
    try {
      const r = await api.patch('/auth/me', { notificationPrefs: prefs });
      setUser(r.data.user);
      setMsg({ kind: 'success', text: 'Notification preferences saved.' });
    } catch (e) {
      setMsg({ kind: 'error', text: apiError(e) });
    } finally {
      setSaving(false);
    }
  }

  async function changePw(e: FormEvent) {
    e.preventDefault();
    setPwMsg(null);
    if (pw.next !== pw.confirm) return setPwMsg({ kind: 'error', text: 'New passwords do not match.' });
    try {
      await api.post('/auth/me/password', { current: pw.current, next: pw.next });
      setPwMsg({ kind: 'success', text: 'Password changed.' });
      setPw({ current: '', next: '', confirm: '' });
    } catch (err) {
      setPwMsg({ kind: 'error', text: apiError(err) });
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-stone-900">Settings</h1>
        <p className="mt-1 text-sm text-stone-500">Notifications and account security.</p>
      </div>

      <Card>
        <h2 className="flex items-center gap-2 font-bold text-stone-900"><Bell size={18} className="text-brand-600" /> Notification Preferences</h2>
        <div className="mt-4 space-y-1">
          {PREFS.map((p) => (
            <label key={p.key} className="flex cursor-pointer items-center justify-between rounded-xl px-2 py-3 hover:bg-stone-50">
              <div>
                <p className="text-sm font-semibold text-stone-800">{p.label}</p>
                <p className="text-xs text-stone-500">{p.desc}</p>
              </div>
              <input
                type="checkbox"
                checked={!!prefs[p.key]}
                onChange={(e) => setPrefs({ ...prefs, [p.key]: e.target.checked })}
                className="h-5 w-5 rounded border-stone-300 text-brand-700 focus:ring-brand-500"
              />
            </label>
          ))}
        </div>
        {msg && <div className="mt-3"><AlertBanner kind={msg.kind === 'error' ? 'error' : 'success'}>{msg.text}</AlertBanner></div>}
        <Button onClick={savePrefs} loading={saving} icon={Save} className="mt-4">Save Preferences</Button>
      </Card>

      <Card>
        <h2 className="flex items-center gap-2 font-bold text-stone-900"><KeyRound size={18} className="text-brand-600" /> Change Password</h2>
        <form onSubmit={changePw} className="mt-4 space-y-4">
          {pwMsg && <AlertBanner kind={pwMsg.kind === 'error' ? 'error' : 'success'}>{pwMsg.text}</AlertBanner>}
          <Field label="Current password" type="password" value={pw.current} onChange={(e) => setPw({ ...pw, current: e.target.value })} required autoComplete="current-password" />
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="New password" type="password" value={pw.next} onChange={(e) => setPw({ ...pw, next: e.target.value })} required autoComplete="new-password" />
            <Field label="Confirm new password" type="password" value={pw.confirm} onChange={(e) => setPw({ ...pw, confirm: e.target.value })} required autoComplete="new-password" />
          </div>
          <Button type="submit">Change Password</Button>
        </form>
      </Card>
    </div>
  );
}
