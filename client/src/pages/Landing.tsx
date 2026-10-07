import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  BellRing, Camera, CheckCircle2, ChevronRight, Leaf, LineChart, MapPin,
  ScanLine, ShieldCheck, Sparkles, Stethoscope, Users,
} from 'lucide-react';
import { useAuth } from '../auth/AuthContext';

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-80px' },
  transition: { duration: 0.5 },
};

const STEPS = [
  { n: '01', icon: Camera, title: 'Upload', text: 'Take or upload a photo of your crop, leaf, or affected area.' },
  { n: '02', icon: ScanLine, title: 'AI Analysis', text: 'Our AI scans the image and checks leaf condition, spots, and pest signs.' },
  { n: '03', icon: Sparkles, title: 'Identify', text: 'Get a clear answer: healthy, possible pest, disease, or stress problem.' },
  { n: '04', icon: CheckCircle2, title: 'Respond', text: 'Follow simple recommended actions to protect your crop early.' },
];

const FEATURES = [
  { icon: ScanLine, title: 'AI Crop Analysis', text: 'Upload a crop photo and get an instant health check with confidence score and severity.' },
  { icon: BellRing, title: 'Early Alerts', text: 'Receive pest, disease, and weather alerts for your region before damage spreads.' },
  { icon: LineChart, title: 'Crop Monitoring', text: 'Track each crop’s health over time with history and visual health indicators.' },
  { icon: Stethoscope, title: 'Expert Support', text: 'Send uncertain cases to agricultural experts and get practical advice back.' },
  { icon: MapPin, title: 'Location-Based Alerts', text: 'Regional outbreak warnings targeted to where your farm actually is.' },
  { icon: ShieldCheck, title: 'Secure & Private', text: 'Your farm data stays yours. Role-based access for farmers, experts and admins.' },
];

const STATS = [
  { value: '92%', label: 'Average AI confidence on clear photos' },
  { value: '4x', label: 'Earlier detection vs. weekly scouting alone' },
  { value: '7+', label: 'Crop types supported in this release' },
  { value: '24/7', label: 'Monitoring and alert coverage' },
];

const TESTIMONIALS = [
  { name: 'Kwame M.', role: 'Maize farmer, Northern Region', quote: 'The app caught armyworm on my maize two weeks before I would have seen it. I treated early and saved the field.' },
  { name: 'Efua O.', role: 'Tomato farmer, Ashanti Region', quote: 'I just take a photo and it tells me what is wrong in words I understand. The expert review helped when the AI was unsure.' },
  { name: 'Dr. Ama S.', role: 'Agricultural officer', quote: 'It gives me a queue of real farmer cases with photos and AI hints. I can help many more farmers in a day.' },
];

export default function Landing() {
  const { user } = useAuth();
  const appHome = user?.role === 'admin' ? '/admin' : user?.role === 'expert' ? '/expert' : '/app';

  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <header className="sticky top-0 z-40 border-b border-stone-100 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3.5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-800">
              <Leaf size={20} className="text-leaf" />
            </div>
            <span className="text-lg font-extrabold tracking-tight text-brand-900">Quophy</span>
          </div>
          <nav className="hidden items-center gap-7 text-sm font-medium text-stone-600 md:flex">
            <a href="#how" className="hover:text-brand-700">How it works</a>
            <a href="#features" className="hover:text-brand-700">Features</a>
            <a href="#impact" className="hover:text-brand-700">Impact</a>
            <a href="#stories" className="hover:text-brand-700">Stories</a>
          </nav>
          <div className="flex items-center gap-2">
            {user ? (
              <Link to={appHome} className="rounded-xl bg-brand-700 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-800">
                Open Dashboard
              </Link>
            ) : (
              <>
                <Link to="/login" className="rounded-xl px-4 py-2 text-sm font-semibold text-stone-600 hover:text-brand-700">
                  Log in
                </Link>
                <Link to="/register" className="rounded-xl bg-brand-700 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-800">
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-brand-50 via-white to-white">
        <div className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-brand-100/60 blur-3xl" />
        <div className="pointer-events-none absolute -left-24 top-40 h-72 w-72 rounded-full bg-leaf/10 blur-3xl" />
        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 pb-20 pt-16 md:grid-cols-2 lg:pt-24">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-brand-700">
              <Sparkles size={14} /> AI-Powered Early Detection
            </span>
            <h1 className="mt-5 text-4xl font-extrabold leading-tight tracking-tight text-stone-900 sm:text-5xl">
              Protect Your Crops.<br />
              <span className="text-brand-700">Detect Problems Early.</span>
            </h1>
            <p className="mt-5 max-w-lg text-lg text-stone-600">
              AI-powered crop health monitoring that helps farmers identify pests and diseases early
              and take the right action — before crop damage becomes severe.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to={user ? `${appHome}/analyze` : '/register'}
                className="inline-flex items-center gap-2 rounded-xl bg-brand-700 px-6 py-3.5 font-semibold text-white shadow-lift transition hover:bg-brand-800"
              >
                Analyze Your Crop <ChevronRight size={18} />
              </Link>
              <a
                href="#how"
                className="inline-flex items-center gap-2 rounded-xl border border-stone-300 bg-white px-6 py-3.5 font-semibold text-stone-700 transition hover:border-brand-400 hover:text-brand-700"
              >
                Learn More
              </a>
            </div>
            <div className="mt-8 flex items-center gap-5 text-sm text-stone-500">
              <span className="flex items-center gap-1.5"><CheckCircle2 size={16} className="text-brand-600" /> Free for farmers</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 size={16} className="text-brand-600" /> Works on any phone</span>
            </div>
          </motion.div>

          {/* Hero visual */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="relative"
          >
            <div className="relative mx-auto max-w-md rounded-3xl border border-stone-100 bg-gradient-to-br from-brand-800 to-brand-950 p-6 shadow-lift">
              <div className="relative overflow-hidden rounded-2xl bg-brand-900/60 p-4">
                <div className="flex items-center justify-between text-xs font-semibold text-brand-100">
                  <span className="flex items-center gap-1.5"><ScanLine size={14} /> AI SCANNING</span>
                  <span className="animate-pulse">● LIVE</span>
                </div>
                <div className="relative mt-3 flex h-52 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-brand-700/40 to-brand-900">
                  <Leaf size={90} className="text-leaf/80" strokeWidth={1.2} />
                  <div className="absolute inset-x-0 h-0.5 animate-scanline bg-gradient-to-r from-transparent via-leaf to-transparent shadow-[0_0_18px_#84cc16]" />
                  <div className="absolute left-4 top-4 rounded-md border border-leaf/60 px-2 py-0.5 text-[10px] font-semibold text-leaf">Leaf region</div>
                  <div className="absolute bottom-4 right-4 rounded-md border border-amber-400/70 px-2 py-0.5 text-[10px] font-semibold text-amber-300">Spot detected</div>
                </div>
                <div className="mt-4 space-y-2">
                  {['Image uploaded', 'Image quality checked', 'Crop condition analyzed', 'Recommendations generated'].map((s, i) => (
                    <motion.div
                      key={s}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.6 + i * 0.25 }}
                      className="flex items-center gap-2 text-xs text-brand-100"
                    >
                      <CheckCircle2 size={14} className="text-leaf" /> {s}
                    </motion.div>
                  ))}
                </div>
              </div>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.8 }}
                className="mt-4 flex items-center justify-between rounded-2xl bg-white p-4"
              >
                <div>
                  <p className="text-xs font-semibold text-stone-500">Result</p>
                  <p className="text-sm font-bold text-orange-600">Possible Pest Attack</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-semibold text-stone-500">AI Confidence</p>
                  <p className="text-lg font-extrabold text-brand-700">91%</p>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="mx-auto max-w-6xl px-4 py-20">
        <motion.div {...fadeUp} className="text-center">
          <h2 className="text-3xl font-extrabold text-stone-900">How It Works</h2>
          <p className="mt-3 text-stone-500">Four simple steps from a photo to a protected crop.</p>
        </motion.div>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s, i) => (
            <motion.div
              key={s.n}
              {...fadeUp}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="group relative rounded-2xl border border-stone-100 bg-white p-6 shadow-card transition hover:-translate-y-1 hover:shadow-lift"
            >
              <span className="text-4xl font-extrabold text-brand-100 transition group-hover:text-brand-200">{s.n}</span>
              <div className="mt-3 inline-flex rounded-xl bg-brand-50 p-2.5 text-brand-700">
                <s.icon size={22} />
              </div>
              <h3 className="mt-3 font-bold text-stone-900">{s.title}</h3>
              <p className="mt-1.5 text-sm text-stone-500">{s.text}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="bg-gradient-to-b from-brand-50/60 to-white py-20">
        <div className="mx-auto max-w-6xl px-4">
          <motion.div {...fadeUp} className="text-center">
            <h2 className="text-3xl font-extrabold text-stone-900">Built for Farmers, Powered by AI</h2>
            <p className="mt-3 text-stone-500">Everything you need to catch crop problems early and respond fast.</p>
          </motion.div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f, i) => (
              <motion.div
                key={f.title}
                {...fadeUp}
                transition={{ duration: 0.5, delay: i * 0.07 }}
                className="rounded-2xl border border-stone-100 bg-white p-6 shadow-card transition hover:shadow-lift"
              >
                <div className="inline-flex rounded-xl bg-brand-50 p-3 text-brand-700">
                  <f.icon size={24} />
                </div>
                <h3 className="mt-4 font-bold text-stone-900">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-stone-500">{f.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Early detection split */}
      <section className="mx-auto max-w-6xl px-4 py-20">
        <div className="grid items-center gap-10 md:grid-cols-2">
          <motion.div {...fadeUp}>
            <span className="rounded-full bg-amber-50 px-3.5 py-1.5 text-xs font-semibold text-amber-700">Early Detection Matters</span>
            <h2 className="mt-4 text-3xl font-extrabold text-stone-900">
              A week of delay can cost the whole field.
            </h2>
            <p className="mt-4 text-stone-600">
              Pests and diseases spread fast. Quophy helps you spot the first signs — a few spotted
              leaves, not a ruined harvest — and tells you exactly what to do next in plain language.
            </p>
            <ul className="mt-6 space-y-3">
              {[
                'Instant AI health check from a single photo',
                'Simple treatment steps any farmer can follow',
                'Regional outbreak alerts before pests reach you',
                'Expert review when the AI is not sure',
              ].map((t) => (
                <li key={t} className="flex items-start gap-2.5 text-sm text-stone-700">
                  <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-brand-600" /> {t}
                </li>
              ))}
            </ul>
          </motion.div>
          <motion.div {...fadeUp} className="grid grid-cols-2 gap-4">
            <div className="rounded-2xl bg-brand-800 p-6 text-white">
              <BellRing size={26} className="text-leaf" />
              <p className="mt-3 text-2xl font-extrabold">Real-time</p>
              <p className="text-sm text-brand-100">pest & disease alerts</p>
            </div>
            <div className="mt-6 rounded-2xl bg-white p-6 shadow-card">
              <ScanLine size={26} className="text-brand-700" />
              <p className="mt-3 text-2xl font-extrabold text-stone-900">Seconds</p>
              <p className="text-sm text-stone-500">per AI crop analysis</p>
            </div>
            <div className="rounded-2xl bg-white p-6 shadow-card">
              <Users size={26} className="text-brand-700" />
              <p className="mt-3 text-2xl font-extrabold text-stone-900">3 roles</p>
              <p className="text-sm text-stone-500">farmers, experts, admins</p>
            </div>
            <div className="mt-6 rounded-2xl bg-leaf p-6 text-brand-950">
              <MapPin size={26} />
              <p className="mt-3 text-2xl font-extrabold">Regional</p>
              <p className="text-sm font-medium">location-targeted warnings</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section id="impact" className="bg-brand-900 py-16">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 sm:grid-cols-2 lg:grid-cols-4">
          {STATS.map((s, i) => (
            <motion.div key={s.label} {...fadeUp} transition={{ delay: i * 0.08 }} className="text-center">
              <p className="text-4xl font-extrabold text-leaf">{s.value}</p>
              <p className="mt-2 text-sm text-brand-100">{s.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section id="stories" className="mx-auto max-w-6xl px-4 py-20">
        <motion.div {...fadeUp} className="text-center">
          <h2 className="text-3xl font-extrabold text-stone-900">Trusted in the Field</h2>
          <p className="mt-3 text-stone-500">What farmers and agricultural officers say.</p>
        </motion.div>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {TESTIMONIALS.map((t, i) => (
            <motion.figure
              key={t.name}
              {...fadeUp}
              transition={{ delay: i * 0.1 }}
              className="rounded-2xl border border-stone-100 bg-white p-6 shadow-card"
            >
              <blockquote className="text-sm leading-relaxed text-stone-600">“{t.quote}”</blockquote>
              <figcaption className="mt-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-100 font-bold text-brand-800">
                  {t.name.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-bold text-stone-800">{t.name}</p>
                  <p className="text-xs text-stone-500">{t.role}</p>
                </div>
              </figcaption>
            </motion.figure>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-4 pb-20">
        <motion.div
          {...fadeUp}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-800 to-brand-950 px-8 py-14 text-center"
        >
          <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-leaf/10 blur-3xl" />
          <h2 className="text-3xl font-extrabold text-white">Start protecting your crops today</h2>
          <p className="mx-auto mt-3 max-w-xl text-brand-100">
            Create a free account, upload your first crop photo, and get an AI health check in seconds.
          </p>
          <Link
            to="/register"
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-leaf px-8 py-3.5 font-bold text-brand-950 transition hover:brightness-110"
          >
            Create Free Account <ChevronRight size={18} />
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-stone-100 bg-stone-50 py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 sm:flex-row">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-800">
              <Leaf size={14} className="text-leaf" />
            </div>
            <span className="font-bold text-brand-900">Quophy</span>
          </div>
          <p className="text-xs text-stone-400">
            AI results are advisory. Always confirm serious outbreaks with an agricultural officer.
          </p>
          <p className="text-xs text-stone-400">© 2026 Quophy. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
