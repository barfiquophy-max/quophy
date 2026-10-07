import { forwardRef, type ButtonHTMLAttributes, type InputHTMLAttributes, type ReactNode, type TextareaHTMLAttributes, type SelectHTMLAttributes } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, CheckCircle2, Eye, EyeOff, Loader2, X, type LucideIcon } from 'lucide-react';
import { useState } from 'react';
import { clsx } from '../utils/clsx';

/* ---------- Button ---------- */
type Variant = 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'ghost' | 'outline';
const variants: Record<Variant, string> = {
  primary: 'bg-brand-700 text-white hover:bg-brand-800 active:bg-brand-900 shadow-sm',
  secondary: 'bg-brand-50 text-brand-800 hover:bg-brand-100 border border-brand-200',
  success: 'bg-emerald-600 text-white hover:bg-emerald-700',
  warning: 'bg-amber-500 text-white hover:bg-amber-600',
  danger: 'bg-red-600 text-white hover:bg-red-700',
  ghost: 'text-stone-600 hover:bg-stone-100',
  outline: 'border border-stone-300 text-stone-700 hover:border-brand-500 hover:text-brand-700 bg-white',
};

interface BtnProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  loading?: boolean;
  icon?: LucideIcon;
  size?: 'sm' | 'md' | 'lg';
}

export const Button = forwardRef<HTMLButtonElement, BtnProps>(function Button(
  { variant = 'primary', loading, icon: Icon, size = 'md', className, children, disabled, ...rest },
  ref,
) {
  const sizes = { sm: 'px-3 py-1.5 text-sm', md: 'px-4 py-2.5 text-sm', lg: 'px-6 py-3.5 text-base' };
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={clsx(
        'inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all duration-150',
        'disabled:cursor-not-allowed disabled:opacity-50 active:scale-[.98]',
        sizes[size],
        variants[variant],
        className,
      )}
      {...rest}
    >
      {loading ? <Loader2 size={18} className="animate-spin" /> : Icon && <Icon size={18} />}
      {children}
    </button>
  );
});

/* ---------- Inputs ---------- */
interface FieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  hint?: string;
}
export const Field = forwardRef<HTMLInputElement, FieldProps>(function Field(
  { label, error, hint, type, className, id, ...rest },
  ref,
) {
  const [show, setShow] = useState(false);
  const isPassword = type === 'password';
  const inputId = id ?? label.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className="space-y-1.5">
      <label htmlFor={inputId} className="block text-sm font-medium text-stone-700">
        {label}
      </label>
      <div className="relative">
        <input
          ref={ref}
          id={inputId}
          type={isPassword && show ? 'text' : type}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
          className={clsx(
            'w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm transition-colors',
            'placeholder:text-stone-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 focus:outline-none',
            error ? 'border-red-400' : 'border-stone-300',
            isPassword && 'pr-11',
            className,
          )}
          {...rest}
        />
        {isPassword && (
          <button
            type="button"
            aria-label={show ? 'Hide password' : 'Show password'}
            onClick={() => setShow((s) => !s)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
          >
            {show ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
      {error ? (
        <p id={`${inputId}-error`} role="alert" className="text-xs text-red-600">
          {error}
        </p>
      ) : hint ? (
        <p id={`${inputId}-hint`} className="text-xs text-stone-500">
          {hint}
        </p>
      ) : null}
    </div>
  );
});

export function TextArea({
  label,
  error,
  ...rest
}: TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string; error?: string }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-stone-700">{label}</label>
      <textarea
        className={clsx(
          'w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm transition-colors placeholder:text-stone-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100',
          error ? 'border-red-400' : 'border-stone-300',
        )}
        rows={3}
        {...rest}
      />
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}

export function Select({
  label,
  children,
  error,
  ...rest
}: SelectHTMLAttributes<HTMLSelectElement> & { label: string; error?: string }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-stone-700">{label}</label>
      <select
        className={clsx(
          'w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100',
          error ? 'border-red-400' : 'border-stone-300',
        )}
        {...rest}
      >
        {children}
      </select>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}

/* ---------- Badge / status ---------- */
const statusStyles: Record<string, string> = {
  healthy: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  possible_pest: 'bg-orange-50 text-orange-700 border-orange-200',
  possible_disease: 'bg-red-50 text-red-700 border-red-200',
  possible_stress: 'bg-amber-50 text-amber-700 border-amber-200',
  undetermined: 'bg-stone-100 text-stone-600 border-stone-200',
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  under_review: 'bg-sky-50 text-sky-700 border-sky-200',
  resolved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  info: 'bg-sky-50 text-sky-700 border-sky-200',
  warning: 'bg-amber-50 text-amber-700 border-amber-200',
  critical: 'bg-red-50 text-red-700 border-red-200',
  growing: 'bg-brand-50 text-brand-700 border-brand-200',
  attention: 'bg-amber-50 text-amber-700 border-amber-200',
  harvested: 'bg-stone-100 text-stone-600 border-stone-200',
};

export const statusLabel: Record<string, string> = {
  healthy: 'Healthy',
  possible_pest: 'Possible Pest Attack',
  possible_disease: 'Possible Disease',
  possible_stress: 'Possible Stress',
  undetermined: 'Undetermined',
  pending: 'Pending',
  under_review: 'Under Review',
  resolved: 'Resolved',
  growing: 'Growing',
  attention: 'Needs Attention',
  harvested: 'Harvested',
};

export function Badge({ status, label, className }: { status: string; label?: string; className?: string }) {
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold',
        statusStyles[status] ?? 'bg-stone-100 text-stone-600 border-stone-200',
        className,
      )}
    >
      {label ?? statusLabel[status] ?? status}
    </span>
  );
}

/* ---------- Card ---------- */
export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={clsx('card p-5', className)}>{children}</div>;
}

export function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  tone = 'brand',
}: {
  icon: LucideIcon;
  label: string;
  value: ReactNode;
  sub?: string;
  tone?: 'brand' | 'amber' | 'red' | 'sky';
}) {
  const tones = {
    brand: 'bg-brand-50 text-brand-700',
    amber: 'bg-amber-50 text-amber-700',
    red: 'bg-red-50 text-red-700',
    sky: 'bg-sky-50 text-sky-700',
  };
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="card p-5 hover:shadow-lift transition-shadow"
    >
      <div className="flex items-center gap-3">
        <div className={clsx('rounded-xl p-2.5', tones[tone])}>
          <Icon size={22} />
        </div>
        <div>
          <p className="text-2xl font-bold text-stone-900">{value}</p>
          <p className="text-sm text-stone-500">{label}</p>
          {sub && <p className="text-xs text-stone-400 mt-0.5">{sub}</p>}
        </div>
      </div>
    </motion.div>
  );
}

/* ---------- Modal ---------- */
export function Modal({
  open,
  onClose,
  title,
  children,
  wide,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  wide?: boolean;
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          role="dialog"
          aria-modal="true"
          aria-label={title}
        >
          <div className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm" onClick={onClose} />
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.98 }}
            className={clsx(
              'relative max-h-[90vh] w-full overflow-y-auto rounded-2xl bg-white p-6 shadow-lift',
              wide ? 'max-w-3xl' : 'max-w-md',
            )}
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-stone-900">{title}</h2>
              <button onClick={onClose} aria-label="Close" className="rounded-lg p-1.5 text-stone-400 hover:bg-stone-100 hover:text-stone-600">
                <X size={20} />
              </button>
            </div>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ---------- Feedback ---------- */
export function AlertBanner({ kind = 'error', children }: { kind?: 'error' | 'success' | 'info'; children: ReactNode }) {
  const styles = {
    error: 'bg-red-50 text-red-700 border-red-200',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    info: 'bg-sky-50 text-sky-700 border-sky-200',
  };
  const Icon = kind === 'error' ? AlertCircle : kind === 'success' ? CheckCircle2 : AlertCircle;
  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      className={clsx('flex items-start gap-2.5 rounded-xl border px-4 py-3 text-sm', styles[kind])}
      role={kind === 'error' ? 'alert' : 'status'}
    >
      <Icon size={18} className="mt-0.5 shrink-0" />
      <div>{children}</div>
    </motion.div>
  );
}

export function EmptyState({ icon: Icon, title, hint, action }: { icon: LucideIcon; title: string; hint?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-stone-200 bg-white px-6 py-14 text-center">
      <div className="rounded-2xl bg-brand-50 p-4 text-brand-600">
        <Icon size={28} />
      </div>
      <h3 className="mt-4 font-semibold text-stone-800">{title}</h3>
      {hint && <p className="mt-1 max-w-sm text-sm text-stone-500">{hint}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function Spinner({ label }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-2 py-10 text-stone-500" role="status">
      <Loader2 className="animate-spin" size={20} />
      <span className="text-sm">{label ?? 'Loading…'}</span>
    </div>
  );
}

export function HealthBar({ score }: { score: number }) {
  const color = score >= 75 ? 'bg-emerald-500' : score >= 50 ? 'bg-amber-500' : 'bg-red-500';
  return (
    <div>
      <div className="flex justify-between text-xs font-medium text-stone-600">
        <span>Crop Health</span>
        <span>{score}%</span>
      </div>
      <div className="mt-1 h-2.5 overflow-hidden rounded-full bg-stone-200">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className={clsx('h-full rounded-full', color)}
        />
      </div>
    </div>
  );
}

export function ConfidenceMeter({ value }: { value: number }) {
  const pct = Math.round(value * 100);
  return (
    <div className="flex items-center gap-3">
      <div className="relative h-16 w-16">
        <svg viewBox="0 0 36 36" className="h-16 w-16 -rotate-90">
          <circle cx="18" cy="18" r="15.5" fill="none" stroke="#e7e5e4" strokeWidth="3.5" />
          <motion.circle
            cx="18" cy="18" r="15.5" fill="none"
            stroke={pct >= 75 ? '#238049' : pct >= 50 ? '#d97706' : '#dc2626'}
            strokeWidth="3.5" strokeLinecap="round"
            strokeDasharray="97.4"
            initial={{ strokeDashoffset: 97.4 }}
            animate={{ strokeDashoffset: 97.4 - (97.4 * pct) / 100 }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-stone-800">
          {pct}%
        </span>
      </div>
      <div>
        <p className="text-sm font-semibold text-stone-800">AI Confidence</p>
        <p className="text-xs text-stone-500">
          {pct >= 75 ? 'High confidence result' : pct >= 50 ? 'Moderate — keep monitoring' : 'Low — consider expert review'}
        </p>
      </div>
    </div>
  );
}
