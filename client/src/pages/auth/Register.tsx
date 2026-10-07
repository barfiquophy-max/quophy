import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus } from 'lucide-react';
import { AuthLayout } from './AuthLayout';
import { AlertBanner, Button, Field, Select } from '../../components/ui';
import { api, apiError } from '../../api/client';
import axios from 'axios';

function strength(pw: string) {
  let s = 0;
  if (pw.length >= 8) s++;
  if (/[A-Z]/.test(pw)) s++;
  if (/[a-z]/.test(pw)) s++;
  if (/[0-9]/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  return s;
}

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '', email: '', phone: '', password: '', confirm: '', location: '', role: 'farmer',
  });
  const [terms, setTerms] = useState(false);
  const [privacy, setPrivacy] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const pw = strength(form.password);
  const pwLabels = ['Too weak', 'Weak', 'Okay', 'Good', 'Strong', 'Very strong'];
  const pwColors = ['bg-red-500', 'bg-red-400', 'bg-amber-500', 'bg-amber-400', 'bg-emerald-500', 'bg-emerald-600'];

  const set = (k: keyof typeof form) => (e: any) => setForm((f) => ({ ...f, [k]: e.target.value }));

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirm) return setError('Passwords do not match.');
    if (!terms || !privacy) return setError('Please accept the Terms & Conditions and Privacy Policy.');
    setLoading(true);
    try {
      const r = await api.post('/auth/register', {
        name: form.name,
        email: form.email,
        phone: form.phone,
        password: form.password,
        location: form.location,
        role: form.role,
        acceptTerms: terms,
        acceptPrivacy: privacy,
      });
      navigate('/verify', { state: { email: form.email, devCode: r.data.devCode } });
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.data?.issues?.length) {
        const first = err.response.data.issues[0];
        setError(first.message ?? apiError(err));
      } else setError(apiError(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout title="Create your account" subtitle="Join Quophy and start protecting your crops today.">
      <form onSubmit={onSubmit} className="space-y-4">
        {error && <AlertBanner>{error}</AlertBanner>}
        <Field label="Full name" value={form.name} onChange={set('name')} placeholder="e.g. Kwame Mensah" required autoComplete="name" />
        <Field label="Email" type="email" value={form.email} onChange={set('email')} placeholder="you@example.com" required autoComplete="email" />
        <Field label="Phone number" type="tel" value={form.phone} onChange={set('phone')} placeholder="+233 24 000 0000" autoComplete="tel" />
        <Field label="Location" value={form.location} onChange={set('location')} placeholder="e.g. Northern Region" />
        <Select label="I am a…" value={form.role} onChange={set('role')}>
          <option value="farmer">Farmer</option>
          <option value="expert">Agricultural Expert</option>
          <option value="admin">Administrator</option>
        </Select>
        <div>
          <Field label="Password" type="password" value={form.password} onChange={set('password')} placeholder="At least 8 characters" required autoComplete="new-password" />
          {form.password && (
            <div className="mt-2 flex items-center gap-2">
              <div className="flex h-1.5 flex-1 gap-1">
                {[0, 1, 2, 3, 4].map((i) => (
                  <div key={i} className={`h-full flex-1 rounded-full ${i < pw ? pwColors[pw - 1] : 'bg-stone-200'}`} />
                ))}
              </div>
              <span className="text-xs text-stone-500">{pwLabels[pw]}</span>
            </div>
          )}
          <p className="mt-1.5 text-xs text-stone-400">Use 8+ characters with upper & lowercase letters and a number.</p>
        </div>
        <Field label="Confirm password" type="password" value={form.confirm} onChange={set('confirm')} placeholder="Repeat your password" required autoComplete="new-password" />
        <div className="space-y-2.5">
          <label className="flex items-start gap-2.5 text-sm text-stone-600">
            <input type="checkbox" checked={terms} onChange={(e) => setTerms(e.target.checked)} className="mt-0.5 h-4 w-4 rounded border-stone-300 text-brand-700 focus:ring-brand-500" />
            <span>I agree to the <a href="#" className="font-medium text-brand-700 hover:underline">Terms &amp; Conditions</a></span>
          </label>
          <label className="flex items-start gap-2.5 text-sm text-stone-600">
            <input type="checkbox" checked={privacy} onChange={(e) => setPrivacy(e.target.checked)} className="mt-0.5 h-4 w-4 rounded border-stone-300 text-brand-700 focus:ring-brand-500" />
            <span>I agree to the <a href="#" className="font-medium text-brand-700 hover:underline">Privacy Policy</a></span>
          </label>
        </div>
        <Button type="submit" loading={loading} icon={UserPlus} className="w-full" size="lg">
          Create Account
        </Button>
        <p className="text-center text-sm text-stone-500">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-brand-700 hover:underline">Log in</Link>
        </p>
      </form>
    </AuthLayout>
  );
}
