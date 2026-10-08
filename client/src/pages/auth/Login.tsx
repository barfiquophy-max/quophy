import { useState, type FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LogIn } from 'lucide-react';
import { AuthLayout } from './AuthLayout';
import { AlertBanner, Button, Field } from '../../components/ui';
import { useAuth } from '../../auth/AuthContext';
import { apiError } from '../../api/client';
import axios from 'axios';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation() as any;
  const [identifier, setIdentifier] = useState(location.state?.email ?? '');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState(location.state?.message ?? '');
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(identifier, password, remember);
      const home = user.role === 'admin' ? '/admin' : user.role === 'expert' ? '/expert' : '/app';
      navigate(location.state?.from ?? home, { replace: true });
    } catch (err) {
      if (axios.isAxiosError(err) && (err.response?.data as any)?.needsVerification) {
        navigate('/verify', {
          state: {
            email: (err.response?.data as any).email ?? identifier,
            devCode: (err.response?.data as any).devCode,
          },
        });
        return;
      }
      setError(apiError(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout title="Welcome back" subtitle="Log in to monitor your crops and check alerts.">
      <form onSubmit={onSubmit} className="space-y-4">
        {info && <AlertBanner kind="success">{info}</AlertBanner>}
        {error && <AlertBanner>{error}</AlertBanner>}
        <Field
          label="Email or phone"
          type="text"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          placeholder="you@example.com or +233…"
          autoComplete="username"
          required
        />
        <Field
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Your password"
          autoComplete="current-password"
          required
        />
        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2 text-stone-600">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              className="h-4 w-4 rounded border-stone-300 text-brand-700 focus:ring-brand-500"
            />
            Remember me
          </label>
          <Link to="/forgot" className="font-medium text-brand-700 hover:underline">
            Forgot password?
          </Link>
        </div>
        <Button type="submit" loading={loading} icon={LogIn} className="w-full" size="lg">
          Log in
        </Button>
        <p className="text-center text-sm text-stone-500">
          New to Quophy?{' '}
          <Link to="/register" className="font-semibold text-brand-700 hover:underline">
            Create an account
          </Link>
        </p>
        <div className="rounded-xl bg-stone-50 p-3.5 text-xs text-stone-500">
          <p className="font-semibold text-stone-600">Demo accounts (password: Password1)</p>
          <p className="mt-1">farmer@quophy.app · expert@quophy.app · admin@quophy.app</p>
        </div>
      </form>
    </AuthLayout>
  );
}
