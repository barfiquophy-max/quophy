import { useEffect, useRef, useState } from 'react';
import { NavLink, Outlet, useNavigate, Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Bell, Bug, ClipboardList, CloudRain, FileBarChart, Home, Leaf, LogOut,
  Menu, ScanLine, Settings, Sprout, Stethoscope, Users, X, Map, BellRing,
  User as UserIcon, ShieldCheck, History, LifeBuoy, Database,
} from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { api } from '../api/client';
import type { AppNotification } from '../types';
import { clsx, fmtDateTime } from '../utils/clsx';

interface NavItem {
  to: string;
  label: string;
  icon: typeof Home;
}

const NAVS: Record<string, NavItem[]> = {
  farmer: [
    { to: '/app', label: 'Dashboard', icon: Home },
    { to: '/app/analyze', label: 'Analyze Crop', icon: ScanLine },
    { to: '/app/farms', label: 'My Farms', icon: Map },
    { to: '/app/crops', label: 'My Crops', icon: Sprout },
    { to: '/app/history', label: 'Crop History', icon: History },
    { to: '/app/alerts', label: 'Alerts', icon: BellRing },
    { to: '/app/expert', label: 'Expert Support', icon: LifeBuoy },
    { to: '/app/notifications', label: 'Notifications', icon: Bell },
    { to: '/app/profile', label: 'Profile', icon: UserIcon },
    { to: '/app/settings', label: 'Settings', icon: Settings },
  ],
  expert: [
    { to: '/expert', label: 'Dashboard', icon: Home },
    { to: '/expert/cases', label: 'Farmer Cases', icon: ClipboardList },
    { to: '/expert/cases?status=pending', label: 'Pending Reviews', icon: Stethoscope },
    { to: '/expert/cases?status=resolved', label: 'Reviewed Cases', icon: FileBarChart },
    { to: '/expert/notifications', label: 'Notifications', icon: Bell },
    { to: '/expert/profile', label: 'Profile', icon: UserIcon },
    { to: '/expert/settings', label: 'Settings', icon: Settings },
  ],
  admin: [
    { to: '/admin', label: 'Dashboard', icon: Home },
    { to: '/admin/users', label: 'Users', icon: Users },
    { to: '/admin/conditions', label: 'Pests & Diseases', icon: Bug },
    { to: '/admin/analyses', label: 'AI Analyses', icon: ScanLine },
    { to: '/admin/alerts', label: 'Alerts', icon: BellRing },
    { to: '/admin/reports', label: 'Reports', icon: FileBarChart },
    { to: '/admin/settings', label: 'Settings', icon: Settings },
  ],
};

const MOBILE_NAVS: Record<string, NavItem[]> = {
  farmer: [
    { to: '/app', label: 'Home', icon: Home },
    { to: '/app/analyze', label: 'Analyze', icon: ScanLine },
    { to: '/app/farms', label: 'Farms', icon: Map },
    { to: '/app/alerts', label: 'Alerts', icon: BellRing },
    { to: '/app/profile', label: 'Profile', icon: UserIcon },
  ],
  expert: [
    { to: '/expert', label: 'Home', icon: Home },
    { to: '/expert/cases', label: 'Cases', icon: ClipboardList },
    { to: '/expert/notifications', label: 'Alerts', icon: Bell },
    { to: '/expert/profile', label: 'Profile', icon: UserIcon },
  ],
  admin: [
    { to: '/admin', label: 'Home', icon: Home },
    { to: '/admin/users', label: 'Users', icon: Users },
    { to: '/admin/alerts', label: 'Alerts', icon: BellRing },
    { to: '/admin/reports', label: 'Reports', icon: FileBarChart },
  ],
};

function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2.5">
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-800">
        <Leaf size={20} className="text-leaf" />
      </div>
      <span className="text-lg font-extrabold tracking-tight text-brand-900">Quophy</span>
    </Link>
  );
}

function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<AppNotification[]>([]);
  const [unread, setUnread] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { user } = useAuth();
  const base = user?.role === 'admin' ? '/admin' : user?.role === 'expert' ? '/expert' : '/app';

  const load = () =>
    api.get('/notifications').then((r) => {
      setItems(r.data.notifications.slice(0, 8));
      setUnread(r.data.unread);
    }).catch(() => {});

  useEffect(() => {
    load();
    const t = setInterval(load, 30_000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label={`Notifications${unread ? `, ${unread} unread` : ''}`}
        className="relative rounded-xl p-2 text-stone-500 hover:bg-stone-100 hover:text-stone-700"
      >
        <Bell size={20} />
        {unread > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
            {unread > 99 ? '99+' : unread}
          </span>
        )}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            className="absolute right-0 z-40 mt-2 w-80 overflow-hidden rounded-2xl bg-white shadow-lift border border-stone-100"
          >
            <div className="flex items-center justify-between border-b border-stone-100 px-4 py-3">
              <p className="text-sm font-bold text-stone-800">Notifications</p>
              <button
                className="text-xs font-medium text-brand-700 hover:underline"
                onClick={async () => {
                  await api.post('/notifications/read-all');
                  load();
                }}
              >
                Mark all read
              </button>
            </div>
            <div className="max-h-80 overflow-y-auto">
              {items.length === 0 && (
                <p className="px-4 py-8 text-center text-sm text-stone-400">No notifications yet.</p>
              )}
              {items.map((n) => (
                <button
                  key={n.id}
                  onClick={async () => {
                    await api.post(`/notifications/${n.id}/read`).catch(() => {});
                    setOpen(false);
                    navigate(n.link ?? `${base}/notifications`);
                  }}
                  className={clsx(
                    'block w-full border-b border-stone-50 px-4 py-3 text-left hover:bg-stone-50',
                    !n.read && 'bg-brand-50/50',
                  )}
                >
                  <p className="text-sm font-semibold text-stone-800">{n.title}</p>
                  <p className="mt-0.5 line-clamp-2 text-xs text-stone-500">{n.message}</p>
                  <p className="mt-1 text-[10px] text-stone-400">{fmtDateTime(n.created_at)}</p>
                </button>
              ))}
            </div>
            <Link
              to={`${base}/notifications`}
              onClick={() => setOpen(false)}
              className="block bg-stone-50 px-4 py-2.5 text-center text-xs font-semibold text-brand-700 hover:bg-stone-100"
            >
              View all notifications
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function NavList({ items, onNavigate }: { items: NavItem[]; onNavigate?: () => void }) {
  return (
    <nav className="flex flex-col gap-1" aria-label="Main navigation">
      {items.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to + label}
          to={to}
          end={!to.includes('?') && to.split('/').length <= 2}
          onClick={onNavigate}
          className={({ isActive }) =>
            clsx(
              'flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors',
              isActive ? 'bg-brand-800 text-white shadow-sm' : 'text-stone-600 hover:bg-brand-50 hover:text-brand-800',
            )
          }
        >
          <Icon size={18} />
          {label}
        </NavLink>
      ))}
    </nav>
  );
}

export function AppLayout() {
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const role = user?.role ?? 'farmer';
  const nav = NAVS[role] ?? NAVS.farmer;
  const mobileNav = MOBILE_NAVS[role] ?? MOBILE_NAVS.farmer;

  return (
    <div className="min-h-screen bg-[#f5f8f4]">
      {/* Sidebar (desktop) */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-stone-200 bg-white px-4 py-5 lg:flex">
        <Logo />
        <div className="mt-8 flex-1 overflow-y-auto">
          <NavList items={nav} />
        </div>
        <div className="border-t border-stone-100 pt-4">
          <div className="flex items-center gap-3 rounded-xl bg-stone-50 px-3 py-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-700 text-sm font-bold text-white">
              {user?.name?.charAt(0) ?? '?'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-stone-800">{user?.name}</p>
              <p className="text-xs capitalize text-stone-500">{role}</p>
            </div>
          </div>
          <button
            onClick={() => { logout(); navigate('/login'); }}
            className="mt-2 flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-stone-600 hover:bg-red-50 hover:text-red-600"
          >
            <LogOut size={18} /> Logout
          </button>
        </div>
      </aside>

      {/* Mobile slide-over */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div className="fixed inset-0 z-50 lg:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="absolute inset-0 bg-stone-900/40" onClick={() => setMobileOpen(false)} />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              className="absolute inset-y-0 left-0 w-72 bg-white p-5 shadow-lift"
            >
              <div className="flex items-center justify-between">
                <Logo />
                <button onClick={() => setMobileOpen(false)} aria-label="Close menu" className="rounded-lg p-1.5 text-stone-500 hover:bg-stone-100">
                  <X size={20} />
                </button>
              </div>
              <div className="mt-6">
                <NavList items={nav} onNavigate={() => setMobileOpen(false)} />
              </div>
              <button
                onClick={() => { logout(); navigate('/login'); }}
                className="mt-4 flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-stone-600 hover:bg-red-50 hover:text-red-600"
              >
                <LogOut size={18} /> Logout
              </button>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main column */}
      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-stone-200 bg-white/80 px-4 py-3 backdrop-blur-md lg:px-8">
          <button className="rounded-lg p-2 text-stone-500 hover:bg-stone-100 lg:hidden" onClick={() => setMobileOpen(true)} aria-label="Open menu">
            <Menu size={20} />
          </button>
          <div className="lg:hidden"><Logo /></div>
          <div className="flex-1" />
          <NotificationBell />
          <Link
            to={role === 'admin' ? '/admin/settings' : role === 'expert' ? '/expert/profile' : '/app/profile'}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-700 text-sm font-bold text-white"
            aria-label="Your profile"
          >
            {user?.name?.charAt(0) ?? '?'}
          </Link>
        </header>

        <main className="mx-auto max-w-6xl px-4 py-6 pb-24 lg:px-8 lg:pb-10">
          <Outlet />
        </main>
      </div>

      {/* Mobile bottom nav */}
      <nav className="fixed inset-x-0 bottom-0 z-30 flex border-t border-stone-200 bg-white pb-[env(safe-area-inset-bottom)] lg:hidden" aria-label="Mobile navigation">
        {mobileNav.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to.split('/').length <= 2}
            className={({ isActive }) =>
              clsx(
                'flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px] font-medium',
                isActive ? 'text-brand-700' : 'text-stone-400',
              )
            }
          >
            <Icon size={20} />
            {label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
