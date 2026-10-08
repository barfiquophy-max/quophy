import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  BellRing, ChevronRight, Leaf, LifeBuoy, MapPin, Plus, ScanLine,
  Sprout, TriangleAlert, CheckCircle2,
} from 'lucide-react';
import { api } from '../../api/client';
import { useAuth } from '../../auth/AuthContext';
import { Badge, Card, EmptyState, Spinner, StatCard } from '../../components/ui';
import type { Analysis, Alert, Crop, Farm } from '../../types';
import { fmtDateTime } from '../../utils/clsx';

export default function Dashboard() {
  const { user } = useAuth();
  const [farms, setFarms] = useState<Farm[]>([]);
  const [crops, setCrops] = useState<Crop[]>([]);
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/farms'),
      api.get('/crops'),
      api.get('/analyses'),
      api.get('/alerts'),
    ])
      .then(([f, c, a, al]) => {
        setFarms(f.data.farms);
        setCrops(c.data.crops);
        setAnalyses(a.data.analyses);
        setAlerts(al.data.alerts);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner label="Loading your dashboard…" />;

  const active = crops.filter((c) => c.status === 'attention').length;
  const healthy = crops.filter((c) => c.status === 'healthy').length;
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-stone-900">{greeting}, {user?.name?.split(' ')[0]}</h1>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-stone-500">
            <MapPin size={14} /> {user?.location || 'Add your location in profile for regional alerts'}
          </p>
        </div>
        <Link to="/app/analyze">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="inline-flex items-center gap-2 rounded-xl bg-brand-700 px-5 py-3 font-semibold text-white shadow-lift hover:bg-brand-800"
          >
            <ScanLine size={18} /> Analyze Crop
          </motion.button>
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard icon={MapPin} label="Total Farms" value={farms.length} />
        <StatCard icon={Sprout} label="Crops Monitored" value={crops.length} />
        <StatCard icon={CheckCircle2} label="Healthy Crops" value={healthy} tone="brand" />
        <StatCard icon={TriangleAlert} label="Active Cases" value={active} tone={active ? 'red' : 'brand'} />
      </div>

      {alerts[0] && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4"
        >
          <BellRing size={20} className="mt-0.5 shrink-0 text-amber-600" />
          <div className="flex-1">
            <p className="text-sm font-bold text-amber-800">{alerts[0].title}</p>
            <p className="text-sm text-amber-700">{alerts[0].message}</p>
          </div>
          <Link to="/app/alerts" className="shrink-0 text-xs font-semibold text-amber-800 hover:underline">
            View all
          </Link>
        </motion.div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent analyses */}
        <Card className="lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-bold text-stone-900">Recent AI Analyses</h2>
            <Link to="/app/history" className="flex items-center gap-1 text-sm font-semibold text-brand-700 hover:underline">
              View all <ChevronRight size={15} />
            </Link>
          </div>
          {analyses.length === 0 ? (
            <EmptyState
              icon={ScanLine}
              title="No analyses yet"
              hint="Upload a crop photo to get your first AI health check."
              action={<Link to="/app/analyze"><span className="inline-flex items-center gap-2 rounded-xl bg-brand-700 px-4 py-2.5 text-sm font-semibold text-white">Analyze Crop</span></Link>}
            />
          ) : (
            <div className="divide-y divide-stone-100">
              {analyses.slice(0, 5).map((a) => (
                <Link key={a.id} to={`/app/analyses/${a.id}`} className="flex items-center gap-4 py-3 hover:bg-stone-50 -mx-2 px-2 rounded-xl transition">
                  <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-stone-100">
                    {a.image_url ? (
                      <img src={a.image_url} alt={a.crop_type ?? 'Crop'} className="h-full w-full object-cover" loading="lazy" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-stone-300"><Leaf size={20} /></div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-stone-800">{a.crop_type ?? 'Crop'} — {a.detected_condition}</p>
                    <p className="text-xs text-stone-500">
                      {fmtDateTime(a.created_at)} · AI confidence {Math.round((a.confidence ?? 0) * 100)}%{a.severity && a.severity !== 'None' ? ` · ${a.severity} severity` : ''}
                    </p>
                  </div>
                  <Badge status={a.status} />
                </Link>
              ))}
            </div>
          )}
        </Card>

        {/* Quick actions */}
        <Card>
          <h2 className="mb-4 font-bold text-stone-900">Quick Actions</h2>
          <div className="grid gap-3">
            {[
              { to: '/app/analyze', icon: ScanLine, label: 'Analyze Crop', desc: 'AI health check', tone: 'bg-brand-700 text-white' },
              { to: '/app/farms', icon: Plus, label: 'Add Farm', desc: 'Register a new farm', tone: 'bg-brand-50 text-brand-800' },
              { to: '/app/alerts', icon: BellRing, label: 'View Alerts', desc: 'Pest & weather warnings', tone: 'bg-amber-50 text-amber-800' },
              { to: '/app/crops', icon: Sprout, label: 'My Crops', desc: 'Monitor crop health', tone: 'bg-emerald-50 text-emerald-800' },
              { to: '/app/expert', icon: LifeBuoy, label: 'Ask Expert', desc: 'Get professional advice', tone: 'bg-sky-50 text-sky-800' },
            ].map((a) => (
              <Link
                key={a.label}
                to={a.to}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 transition hover:shadow-md ${a.tone}`}
              >
                <a.icon size={20} />
                <div>
                  <p className="text-sm font-bold">{a.label}</p>
                  <p className="text-xs opacity-75">{a.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </Card>
      </div>

      {/* Crops at a glance */}
      {crops.length > 0 && (
        <Card>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-bold text-stone-900">Crops at a Glance</h2>
            <Link to="/app/crops" className="flex items-center gap-1 text-sm font-semibold text-brand-700 hover:underline">
              Manage <ChevronRight size={15} />
            </Link>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {crops.slice(0, 6).map((c) => (
              <Link key={c.id} to={`/app/crops/${c.id}`} className="rounded-xl border border-stone-100 p-4 transition hover:border-brand-200 hover:shadow-card">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-stone-800">{c.crop_type}</p>
                  <Badge status={c.status} />
                </div>
                <p className="mt-1 text-xs text-stone-500">{c.farm_name}</p>
                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-stone-100">
                  <div
                    className={`h-full rounded-full ${c.health_score >= 75 ? 'bg-emerald-500' : c.health_score >= 50 ? 'bg-amber-500' : 'bg-red-500'}`}
                    style={{ width: `${c.health_score}%` }}
                  />
                </div>
              </Link>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
