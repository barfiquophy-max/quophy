import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Leaf, ScanLine, BellRing, Stethoscope } from 'lucide-react';

export function AuthLayout({ children, title, subtitle }: { children: ReactNode; title: string; subtitle: string }) {
  return (
    <div className="flex min-h-screen bg-white">
      {/* Visual panel */}
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-gradient-to-br from-brand-800 to-brand-950 p-12 lg:flex">
        <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-leaf/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -left-24 h-96 w-96 rounded-full bg-brand-600/20 blur-3xl" />
        <Link to="/" className="relative flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10">
            <Leaf size={20} className="text-leaf" />
          </div>
          <span className="text-lg font-extrabold text-white">Quophy</span>
        </Link>
        <div className="relative">
          <h2 className="text-3xl font-extrabold leading-snug text-white">
            Catch crop problems<br />before they spread.
          </h2>
          <ul className="mt-8 space-y-4">
            {[
              { icon: ScanLine, text: 'AI analysis from a single crop photo' },
              { icon: BellRing, text: 'Regional pest & disease alerts' },
              { icon: Stethoscope, text: 'Expert review when you need a second opinion' },
            ].map((f) => (
              <li key={f.text} className="flex items-center gap-3 text-brand-100">
                <div className="rounded-lg bg-white/10 p-2"><f.icon size={18} /></div>
                <span className="text-sm">{f.text}</span>
              </li>
            ))}
          </ul>
        </div>
        <p className="relative text-xs text-brand-200/70">
          Helping farmers act early — in plain language.
        </p>
      </div>

      {/* Form panel */}
      <div className="flex w-full flex-col items-center justify-center px-4 py-10 lg:w-1/2">
        <div className="w-full max-w-md">
          <Link to="/" className="mb-8 flex items-center gap-2.5 lg:hidden">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-800">
              <Leaf size={20} className="text-leaf" />
            </div>
            <span className="text-lg font-extrabold text-brand-900">Quophy</span>
          </Link>
          <h1 className="text-2xl font-extrabold text-stone-900">{title}</h1>
          <p className="mt-1.5 text-sm text-stone-500">{subtitle}</p>
          <div className="mt-7">{children}</div>
        </div>
      </div>
    </div>
  );
}
