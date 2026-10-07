import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { KeyRound, ArrowLeft } from 'lucide-react';
import { AuthLayout } from './AuthLayout';
import { AlertBanner, Button, Field } from '../../components/ui';
import { api, apiError } from '../../api/client';

export default function ForgotPassword() {
  const [step, setStep] = useState<'email' | 'reset' | 'done'>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [devCode, setDevCode] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);

  async function requestCode(e: FormEvent) {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const r = await api.post('/auth/forgot', { email });
      setInfo(r.data.message);
      if (r.data.devCode) setDevCode(r.data.devCode);
      setStep('reset');
    } catch (err) {
      setError(apiError(err));
    } finally {
      setLoading(false);
    }
  }

  async function doReset(e: FormEvent) {
    e.preventDefault();
    setError('');
    if (password !== confirm) return setError('Passwords do not match.');
    setLoading(true);
    try {
      await api.post('/auth/reset', { email, code, password });
      setStep('done');
    } catch (err) {
      setError(apiError(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout title="Reset your password" subtitle="We'll help you get back into your account.">
      {step === 'email' && (
        <form onSubmit={requestCode} className="space-y-4">
          {error && <AlertBanner>{error}</AlertBanner>}
          <Field label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />
          <Button type="submit" loading={loading} icon={KeyRound} className="w-full" size="lg">
            Send reset code
          </Button>
        </form>
      )}
      {step === 'reset' && (
        <form onSubmit={doReset} className="space-y-4">
          {info && <AlertBanner kind="info">{info}</AlertBanner>}
          {devCode && (
            <AlertBanner kind="info">
              Demo mode — your reset code is <strong className="tracking-wider">{devCode}</strong>.
              In production this is sent by email/SMS.
            </AlertBanner>
          )}
          {error && <AlertBanner>{error}</AlertBanner>}
          <Field label="Reset code" value={code} onChange={(e) => setCode(e.target.value)} placeholder="6-digit code" required inputMode="numeric" />
          <Field label="New password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="new-password" />
          <Field label="Confirm new password" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required autoComplete="new-password" />
          <Button type="submit" loading={loading} className="w-full" size="lg">Set new password</Button>
        </form>
      )}
      {step === 'done' && (
        <div className="space-y-4">
          <AlertBanner kind="success">Your password has been updated. Log in with your new password.</AlertBanner>
          <Link to="/login"><Button className="w-full" size="lg">Back to login</Button></Link>
        </div>
      )}
      <Link to="/login" className="mt-6 flex items-center justify-center gap-1.5 text-sm font-medium text-stone-500 hover:text-brand-700">
        <ArrowLeft size={16} /> Back to login
      </Link>
    </AuthLayout>
  );
}
