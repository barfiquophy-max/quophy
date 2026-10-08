import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { useAuth } from './auth/AuthContext';
import { AppLayout } from './components/Layout';
import { Spinner } from './components/ui';
import Landing from './pages/Landing';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import VerifyEmail from './pages/auth/VerifyEmail';
import Dashboard from './pages/farmer/Dashboard';
import Analyze from './pages/farmer/Analyze';
import AnalysisResult from './pages/farmer/AnalysisResult';
import Farms from './pages/farmer/Farms';
import Crops from './pages/farmer/Crops';
import CropDetail from './pages/farmer/CropDetail';
import History from './pages/farmer/History';
import Alerts from './pages/farmer/Alerts';
import ExpertSupport from './pages/farmer/ExpertSupport';
import Notifications from './pages/shared/Notifications';
import Profile from './pages/shared/Profile';
import SettingsPage from './pages/shared/Settings';
import ExpertDashboard from './pages/expert/Dashboard';
import ExpertCases from './pages/expert/Cases';
import ExpertCaseDetail from './pages/expert/CaseDetail';
import AdminDashboard from './pages/admin/Dashboard';
import AdminUsers from './pages/admin/Users';
import AdminConditions from './pages/admin/Conditions';
import AdminAnalyses from './pages/admin/Analyses';
import AdminAlerts from './pages/admin/Alerts';
import AdminReports from './pages/admin/Reports';
import type { Role } from './types';

function Guard({ roles, children }: { roles?: Role[]; children: ReactNode }) {
  const { user, loading } = useAuth();
  const loc = useLocation();
  if (loading) return <div className="flex min-h-screen items-center justify-center"><Spinner label="Loading your account…" /></div>;
  if (!user) return <Navigate to="/login" state={{ from: loc.pathname }} replace />;
  if (roles && !roles.includes(user.role)) {
    const home = user.role === 'admin' ? '/admin' : user.role === 'expert' ? '/expert' : '/app';
    return <Navigate to={home} replace />;
  }
  return <>{children}</>;
}

function Page({ children }: { children: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
    >
      {children}
    </motion.div>
  );
}

export default function App() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Page><Landing /></Page>} />
        <Route path="/login" element={<Page><Login /></Page>} />
        <Route path="/register" element={<Page><Register /></Page>} />
        <Route path="/forgot" element={<Page><ForgotPassword /></Page>} />
        <Route path="/verify" element={<Page><VerifyEmail /></Page>} />

        {/* Farmer */}
        <Route path="/app" element={<Guard roles={['farmer']}><AppLayout /></Guard>}>
          <Route index element={<Page><Dashboard /></Page>} />
          <Route path="analyze" element={<Page><Analyze /></Page>} />
          <Route path="analyses/:id" element={<Page><AnalysisResult /></Page>} />
          <Route path="farms" element={<Page><Farms /></Page>} />
          <Route path="crops" element={<Page><Crops /></Page>} />
          <Route path="crops/:id" element={<Page><CropDetail /></Page>} />
          <Route path="history" element={<Page><History /></Page>} />
          <Route path="alerts" element={<Page><Alerts /></Page>} />
          <Route path="expert" element={<Page><ExpertSupport /></Page>} />
          <Route path="notifications" element={<Page><Notifications /></Page>} />
          <Route path="profile" element={<Page><Profile /></Page>} />
          <Route path="settings" element={<Page><SettingsPage /></Page>} />
        </Route>

        {/* Expert */}
        <Route path="/expert" element={<Guard roles={['expert']}><AppLayout /></Guard>}>
          <Route index element={<Page><ExpertDashboard /></Page>} />
          <Route path="cases" element={<Page><ExpertCases /></Page>} />
          <Route path="cases/:id" element={<Page><ExpertCaseDetail /></Page>} />
          <Route path="notifications" element={<Page><Notifications /></Page>} />
          <Route path="profile" element={<Page><Profile /></Page>} />
          <Route path="settings" element={<Page><SettingsPage /></Page>} />
        </Route>

        {/* Admin */}
        <Route path="/admin" element={<Guard roles={['admin']}><AppLayout /></Guard>}>
          <Route index element={<Page><AdminDashboard /></Page>} />
          <Route path="users" element={<Page><AdminUsers /></Page>} />
          <Route path="conditions" element={<Page><AdminConditions /></Page>} />
          <Route path="analyses" element={<Page><AdminAnalyses /></Page>} />
          <Route path="alerts" element={<Page><AdminAlerts /></Page>} />
          <Route path="reports" element={<Page><AdminReports /></Page>} />
          <Route path="settings" element={<Page><SettingsPage /></Page>} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
}
