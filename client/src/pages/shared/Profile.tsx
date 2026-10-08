import { useEffect, useState, type FormEvent } from 'react';
import { Save, User as UserIcon } from 'lucide-react';
import { api, apiError } from '../../api/client';
import { useAuth } from '../../auth/AuthContext';
import { AlertBanner, Button, Card, Field, Select, Spinner, TextArea } from '../../components/ui';

export default function Profile() {
  const { user, setUser } = useAuth();
  const [form, setForm] = useState({
    name: '', phone: '', email: '', location: '', farmInfo: '', preferredLanguage: 'en',
  });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ kind: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name ?? '',
        phone: user.phone ?? '',
        email: user.email ?? '',
        location: user.location ?? '',
        farmInfo: user.farmInfo ?? '',
        preferredLanguage: user.preferredLanguage ?? 'en',
      });
    }
  }, [user]);

  if (!user) return <Spinner />;

  async function save(e: FormEvent) {
    e.preventDefault();
    setMsg(null); setSaving(true);
    try {
      const r = await api.patch('/auth/me', {
        name: form.name, phone: form.phone, location: form.location,
        farmInfo: form.farmInfo, preferredLanguage: form.preferredLanguage,
      });
      setUser(r.data.user);
      setMsg({ kind: 'success', text: 'Profile updated.' });
    } catch (err) {
      setMsg({ kind: 'error', text: apiError(err) });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-stone-900">Profile</h1>
        <p className="mt-1 text-sm text-stone-500">Manage your personal and farm information.</p>
      </div>
      <Card>
        <div className="mb-6 flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl bg-brand-700 text-2xl font-bold text-white">
            {user.profileImage ? <img src={user.profileImage} alt="Profile" className="h-full w-full object-cover" /> : user.name.charAt(0)}
          </div>
          <div>
            <p className="font-bold text-stone-900">{user.name}</p>
            <p className="text-sm capitalize text-stone-500">{user.role} · {user.email}</p>
          </div>
        </div>
        <form onSubmit={save} className="space-y-4">
          {msg && <AlertBanner kind={msg.kind === 'error' ? 'error' : 'success'}>{msg.text}</AlertBanner>}
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            <Field label="Phone" type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            <Field label="Email" type="email" value={form.email} disabled hint="Email changes are not supported yet." />
            <Field label="Location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} hint="Used for regional pest and weather alerts." />
          </div>
          <Select label="Preferred language" value={form.preferredLanguage} onChange={(e) => setForm({ ...form, preferredLanguage: e.target.value })}>
            <option value="en">English</option>
            <option value="tw">Twi</option>
            <option value="fr">Français</option>
            <option value="ha">Hausa</option>
          </Select>
          <TextArea label="Farm information" value={form.farmInfo} onChange={(e) => setForm({ ...form, farmInfo: e.target.value })} placeholder="What do you grow? Farm size, main crops…" />
          <Button type="submit" loading={saving} icon={Save}>Save Changes</Button>
        </form>
      </Card>
    </div>
  );
}
