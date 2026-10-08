import { useState, type FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { MailCheck } from 'lucide-react';
import { AuthLayout } from './AuthLayout';
import { AlertBanner, Button, Field } from '../../components/ui';
import { api, apiError } from '../../api/client';

export default function VerifyEmail() {
  const location = useLocation() as any;
  const navigate = useNavigate();
  const [email, setEmail] = useState(location.state?.email ?? '');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const devCode = location.state?.devCode;

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await api.post('/auth/verify', { email, code });
      navigate('/login', { state: { email, message: 'Email verified — you can log in now.' } });
    } catch (err) {
      setError(apiError(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout title="Verify your email" subtitle="Enter the 6-digit code we sent to your email.">
      <form onSubmit={onSubmit} className="space-y-4">
        {devCode && (
          <AlertBanner kind="info">
            Demo mode — your verification code is <strong className="tracking-wider">{devCode}</strong>.
            In production this is emailed to you.
          </AlertBanner>
        )}
        {error && <AlertBanner>{error}</AlertBanner>}
        <Field label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <Field label="Verification code" value={code} onChange={(e) => setCode(e.target.value)} placeholder="6-digit code" required inputMode="numeric" maxLength={6} />
        <Button type="submit" loading={loading} icon={MailCheck} className="w-full" size="lg">
          Verify &amp; continue
        </Button>
        <p className="text-center text-sm text-stone-500">
          Already verified? <Link to="/login" className="font-semibold text-brand-700 hover:underline">Log in</Link>
        </p>
      </form>
    </AuthLayout>
  );
}
