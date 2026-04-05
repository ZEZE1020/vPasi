import { useState } from "react";
import {
  TrendingUp, TrendingDown, Package, DollarSign,
  Plus, Download, Calculator, Lock, Phone, Mail,
  BarChart3, ShieldCheck, CreditCard, ArrowLeft,
  CheckCircle2, Eye, EyeOff, User, MapPin,
} from "lucide-react";

const MOCK_TRADES = [
  { id: 1, date: "2026-03-28", goods: "Electronics",          origin: "Kenya",    destination: "Uganda",   border: "Busia",   value: 5000, tariff: 600,  profit: 650  },
  { id: 2, date: "2026-03-25", goods: "Textiles",             origin: "Tanzania", destination: "Kenya",    border: "Namanga", value: 3200, tariff: 384,  profit: 416  },
  { id: 3, date: "2026-03-22", goods: "Agricultural Products",origin: "Uganda",   destination: "Rwanda",   border: "Gatuna",  value: 2100, tariff: 252,  profit: 273  },
  { id: 4, date: "2026-03-20", goods: "Building Materials",   origin: "Kenya",    destination: "Tanzania", border: "Taveta",  value: 8500, tariff: 1020, profit: 1105 },
];

const PERKS = [
  { icon: BarChart3,    title: "Trade History",    desc: "Every crossing logged automatically" },
  { icon: TrendingUp,   title: "Profit Tracking",  desc: "Real-time margin calculations"       },
  { icon: CreditCard,   title: "Credit Profile",   desc: "Build your alternative credit score" },
  { icon: ShieldCheck,  title: "Tax Reports",      desc: "One-click export for compliance"     },
];

type AuthStep = "choose" | "whatsapp" | "email" | "done";

function Field({ label, type = "text", placeholder, value, onChange, icon: Icon, toggle, onToggle }: {
  label: string; type?: string; placeholder: string;
  value: string; onChange: (v: string) => void;
  icon: React.ElementType; toggle?: boolean; onToggle?: () => void;
}) {
  return (
    <div>
      <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">{label}</label>
      <div className="relative">
        <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full pl-10 pr-10 py-3 rounded-xl border-2 border-slate-200 text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:border-orange-400 transition-colors"
        />
        {toggle !== undefined && (
          <button type="button" onClick={onToggle} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
            {toggle ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        )}
      </div>
    </div>
  );
}

function AuthGate({ onAuth }: { onAuth: () => void }) {
  const [step, setStep] = useState<AuthStep>("choose");
  const [mode, setMode] = useState<"signup" | "login">("signup");
  const [showPw, setShowPw] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", email: "", password: "", country: "", confirmPassword: "" });
  const set = (k: keyof typeof form) => (v: string) => setForm((f) => ({ ...f, [k]: v }));

  const countries = ["Kenya", "Uganda", "Tanzania", "Rwanda", "Burundi", "South Sudan"];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep("done");
    setTimeout(onAuth, 1800);
  };

  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center p-4 overflow-y-auto">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />

      <div className="relative z-10 w-full max-w-md my-auto">
        <div className="vpasi-card overflow-hidden">

          {/* ── Nav header ── */}
          <div className="bg-slate-900 px-6 py-5 flex items-center gap-3">
            {step !== "choose" && step !== "done" && (
              <button
                onClick={() => setStep("choose")}
                aria-label="Go back"
                className="text-slate-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <div className="flex-1 text-center">
              <div className="flex items-center justify-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-orange-500 flex items-center justify-center">
                  <Lock className="w-3.5 h-3.5 text-white" />
                </div>
                <span className="font-extrabold text-white">vPasi</span>
              </div>
            </div>
            {/* spacer to balance back button */}
            {step !== "choose" && step !== "done" ? <div className="w-5" /> : <div />}
          </div>

          {/* ── Step: Choose method ── */}
          {step === "choose" && (
            <>
              <div className="px-8 pt-7 pb-4 text-center">
                <h2 className="text-xl font-extrabold text-slate-900 mb-1">Your Dashboard Awaits</h2>
                <p className="text-slate-500 text-sm">Create a free account to access your trade history, profit tracking, and credit profile.</p>
              </div>

              <div className="grid grid-cols-2 gap-3 px-8 py-4 bg-stone-50 border-y border-slate-100">
                {PERKS.map(({ icon: Icon, title, desc }) => (
                  <div key={title} className="flex items-start gap-2">
                    <div className="w-6 h-6 rounded-lg bg-orange-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Icon className="w-3 h-3 text-orange-500" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">{title}</p>
                      <p className="text-xs text-slate-400">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="px-8 py-6 space-y-3">
                <button onClick={() => setStep("whatsapp")}
                  className="btn-cta w-full">
                  <Phone className="w-4 h-4" /> Continue with WhatsApp
                </button>
                <button onClick={() => setStep("email")}
                  className="btn-cta btn-cta-outline w-full">
                  <Mail className="w-4 h-4" /> Continue with Email
                </button>
                <p className="text-center text-xs text-slate-400">Free to join · No credit card required</p>
              </div>
            </>
          )}

          {/* ── Step: WhatsApp ── */}
          {step === "whatsapp" && (
            <form onSubmit={handleSubmit} className="px-8 py-7 space-y-5">
              <div className="text-center mb-2">
                <h2 className="text-lg font-extrabold text-slate-900">Sign up with WhatsApp</h2>
                <p className="text-slate-500 text-sm mt-1">We'll send a verification code to your number.</p>
              </div>

              <Field label="Full Name" placeholder="Grace Mwangi" value={form.name} onChange={set("name")} icon={User} />
              <Field label="WhatsApp Number" placeholder="+254 700 000 000" value={form.phone} onChange={set("phone")} icon={Phone} />

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">Country</label>
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <select value={form.country} onChange={(e) => set("country")(e.target.value)} required
                    className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-slate-200 text-slate-900 text-sm focus:outline-none focus:border-orange-400 transition-colors appearance-none bg-white">
                    <option value="">Select your country</option>
                    {countries.map((c) => <option key={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <button type="submit" className="btn-cta w-full">
                Send Verification Code →
              </button>
              <p className="text-center text-xs text-slate-400">Already have an account?{" "}
                <button type="button" onClick={() => setMode(mode === "signup" ? "login" : "signup")} className="text-orange-500 font-semibold hover:underline">Sign in</button>
              </p>
            </form>
          )}

          {/* ── Step: Email ── */}
          {step === "email" && (
            <form onSubmit={handleSubmit} className="px-8 py-7 space-y-4">
              <div className="text-center mb-2">
                <div className="flex justify-center gap-4 mb-5">
                  {(["signup", "login"] as const).map((m) => (
                    <button key={m} type="button" onClick={() => setMode(m)}
                      className={`px-5 py-2 rounded-xl text-sm font-bold transition-all ${
                        mode === m ? "bg-slate-900 text-white" : "text-slate-500 hover:text-slate-900"
                      }`}>
                      {m === "signup" ? "Create Account" : "Sign In"}
                    </button>
                  ))}
                </div>
              </div>

              {mode === "signup" && (
                <Field label="Full Name" placeholder="Grace Mwangi" value={form.name} onChange={set("name")} icon={User} />
              )}
              <Field label="Email Address" type="email" placeholder="grace@example.com" value={form.email} onChange={set("email")} icon={Mail} />
              {mode === "signup" && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">Country</label>
                  <div className="relative">
                    <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <select value={form.country} onChange={(e) => set("country")(e.target.value)} required
                      className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-slate-200 text-slate-900 text-sm focus:outline-none focus:border-orange-400 transition-colors appearance-none bg-white">
                      <option value="">Select your country</option>
                      {countries.map((c) => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
              )}
              <Field label="Password" type={showPw ? "text" : "password"} placeholder="Min. 8 characters"
                value={form.password} onChange={set("password")} icon={Lock}
                toggle={showPw} onToggle={() => setShowPw(!showPw)} />
              {mode === "signup" && (
                <Field label="Confirm Password" type={showPw ? "text" : "password"} placeholder="Repeat password"
                  value={form.confirmPassword} onChange={set("confirmPassword")} icon={Lock} />
              )}

              <button type="submit" className="btn-cta w-full mt-2">
                {mode === "signup" ? "Create My Account →" : "Sign In →"}
              </button>
              <p className="text-center text-xs text-slate-400">
                {mode === "signup" ? "Already have an account? " : "Don't have an account? "}
                <button type="button" onClick={() => setMode(mode === "signup" ? "login" : "signup")} className="text-orange-500 font-semibold hover:underline">
                  {mode === "signup" ? "Sign in" : "Create one"}
                </button>
              </p>
            </form>
          )}

          {/* ── Step: Done ── */}
          {step === "done" && (
            <div className="px-8 py-12 text-center">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-5">
                <CheckCircle2 className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-xl font-extrabold text-slate-900 mb-2">You're in!</h2>
              <p className="text-slate-500 text-sm">Setting up your dashboard…</p>
              <div className="mt-6 flex justify-center gap-1.5">
                {[0,1,2].map((i) => (
                  <div key={i} className="w-2 h-2 rounded-full bg-orange-500 animate-bounce" style={{ animationDelay: `${i * 150}ms` }} />
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon, label, value, sub, accent = false, trend = "up",
}: {
  icon: React.ElementType; label: string; value: string; sub: string; accent?: boolean; trend?: "up" | "down";
}) {
  return (
    <div className="vpasi-card p-6">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${accent ? "bg-orange-100" : "bg-slate-100"}`}>
          <Icon className={`w-5 h-5 ${accent ? "text-orange-500" : "text-slate-600"}`} />
        </div>
        {trend === "up"
          ? <TrendingUp className="w-4 h-4 text-green-500" />
          : <TrendingDown className="w-4 h-4 text-orange-400" />}
      </div>
      <p className="text-sm text-slate-500 mb-1">{label}</p>
      <p className={`text-3xl font-extrabold ${accent ? "text-orange-500" : "text-slate-900"}`}>{value}</p>
      <p className="text-xs text-slate-400 mt-1">{sub}</p>
    </div>
  );
}

export function DashboardPage() {
  const [authed, setAuthed] = useState(false);

  const totalRevenue = MOCK_TRADES.reduce((s, t) => s + t.value, 0);
  const totalTariffs = MOCK_TRADES.reduce((s, t) => s + t.tariff, 0);
  const totalProfit  = MOCK_TRADES.reduce((s, t) => s + t.profit, 0);
  const margin = ((totalProfit / totalRevenue) * 100).toFixed(1);

  return (
    <div className="relative min-h-screen bg-stone-100">
      {/* Auth gate — shown when not authed */}
      {!authed && <AuthGate onAuth={() => setAuthed(true)} />}

      {/* Dashboard content — inert (keyboard/screen reader blocked) when gated */}
      <div
        aria-hidden={!authed}
        style={{ pointerEvents: !authed ? 'none' : undefined }}
        {...(!authed ? { inert: '' as unknown as boolean } : {})}
      >

        {/* Header bar */}
        <div className="bg-slate-900 px-6 py-8">
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-slate-400 text-sm mb-1">Welcome back</p>
              <h1 className="text-2xl font-extrabold text-white">Grace's Dashboard 👋</h1>
              <p className="text-slate-400 text-sm mt-1">March 2026 · Busia–Kampala route</p>
            </div>
            <button className="flex items-center gap-2 px-5 py-2.5 bg-orange-500 text-white font-bold rounded-xl hover:bg-orange-600 transition-colors text-sm self-start sm:self-auto">
              <Plus className="w-4 h-4" /> Log New Trade
            </button>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-6 py-8 space-y-8">

          {/* Stat cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard icon={Package}   label="Total Trades"  value={String(MOCK_TRADES.length)} sub="+2 from last month"  />
            <StatCard icon={DollarSign} label="Total Revenue" value={`$${totalRevenue.toLocaleString()}`} sub="+15% from last month" />
            <StatCard icon={Calculator} label="Tariffs Paid"  value={`$${totalTariffs.toLocaleString()}`} sub={`${((totalTariffs/totalRevenue)*100).toFixed(0)}% of revenue`} trend="down" />
            <StatCard icon={TrendingUp} label="Net Profit"    value={`$${totalProfit.toLocaleString()}`}  sub={`${margin}% margin`} accent />
          </div>

          {/* Trades table */}
          <div className="vpasi-card overflow-hidden">
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-900">Recent Trades</h2>
              <button className="flex items-center gap-2 px-4 py-2 border-2 border-slate-200 text-slate-700 text-sm font-semibold rounded-xl hover:border-slate-900 transition-colors">
                <Download className="w-4 h-4" /> Export
              </button>
            </div>

            {/* Desktop */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-stone-50 border-b border-slate-100">
                  <tr>
                    {["Date","Goods","Route","Border","Value","Tariff","Profit","Status"].map((h, i) => (
                      <th key={h} className={`px-6 py-3.5 font-semibold text-slate-500 text-xs uppercase tracking-wide ${i >= 4 ? "text-right" : "text-left"} ${h === "Status" ? "text-center" : ""}`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {MOCK_TRADES.map((t) => (
                    <tr key={t.id} className="hover:bg-stone-50 transition-colors">
                      <td className="px-6 py-4 text-slate-500">{new Date(t.date).toLocaleDateString("en-US",{month:"short",day:"numeric"})}</td>
                      <td className="px-6 py-4 font-medium text-slate-900">{t.goods}</td>
                      <td className="px-6 py-4 text-slate-600">{t.origin} → {t.destination}</td>
                      <td className="px-6 py-4 text-slate-600">{t.border}</td>
                      <td className="px-6 py-4 text-right font-medium text-slate-900">${t.value.toLocaleString()}</td>
                      <td className="px-6 py-4 text-right text-orange-500 font-medium">${t.tariff.toLocaleString()}</td>
                      <td className="px-6 py-4 text-right text-green-600 font-bold">+${t.profit.toLocaleString()}</td>
                      <td className="px-6 py-4 text-center">
                        <span className="px-2.5 py-1 bg-green-50 text-green-700 text-xs font-semibold rounded-full">Completed</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile */}
            <div className="md:hidden divide-y divide-slate-100">
              {MOCK_TRADES.map((t) => (
                <div key={t.id} className="px-5 py-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-slate-900">{t.goods}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{t.origin} → {t.destination} · {t.border}</p>
                    </div>
                    <span className="px-2.5 py-1 bg-green-50 text-green-700 text-xs font-semibold rounded-full">Completed</span>
                  </div>
                  <div className="grid grid-cols-3 gap-3 text-sm">
                    <div><p className="text-xs text-slate-400">Value</p><p className="font-semibold text-slate-900">${t.value.toLocaleString()}</p></div>
                    <div><p className="text-xs text-slate-400">Tariff</p><p className="font-semibold text-orange-500">${t.tariff.toLocaleString()}</p></div>
                    <div><p className="text-xs text-slate-400">Profit</p><p className="font-bold text-green-600">+${t.profit.toLocaleString()}</p></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick actions */}
          <div>
            <h2 className="text-lg font-bold text-slate-900 mb-4">Quick Actions</h2>
            <div className="grid sm:grid-cols-3 gap-4">
              {[
                { icon: Package,    title: "Log New Trade",    desc: "Record a cross-border transaction" },
                { icon: Calculator, title: "Calculate Tariff", desc: "Estimate costs for your next trade" },
                { icon: Download,   title: "Generate Report",  desc: "Export history for tax filing"     },
              ].map(({ icon: Icon, title, desc }) => (
                <button key={title} className="vpasi-card p-6 text-left w-full group">
                  <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center mb-4 group-hover:bg-orange-500 transition-colors duration-200">
                    <Icon className="w-5 h-5 text-orange-500 group-hover:text-white transition-colors duration-200" />
                  </div>
                  <p className="font-bold text-slate-900 mb-1">{title}</p>
                  <p className="text-sm text-slate-500">{desc}</p>
                </button>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
