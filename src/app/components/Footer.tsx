import { Link } from "react-router-dom";
import Button from "./Button";

export function Footer() {
  return (
    <footer className="bg-slate-900 px-6 pt-16 pb-8">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-xl bg-orange-500 flex items-center justify-center font-extrabold text-white text-xs">vP</div>
              <span className="text-lg font-extrabold text-white">vPasi</span>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed">
              AI-powered trade intelligence for East African cross-border traders.
            </p>
          </div>

          {/* Product */}
          <div>
            <p className="text-xs font-bold tracking-widest text-slate-500 uppercase mb-4">Product</p>
            <ul className="space-y-3">
              {["USSD Guide", "WhatsApp Commands", "Tariff Calculator", "Pricing"].map((l) => (
                <li key={l}><a href="#" className="text-slate-400 text-sm hover:text-white transition-colors">{l}</a></li>
              ))}
            </ul>
          </div>

          {/* Developers */}
          <div>
            <p className="text-xs font-bold tracking-widest text-slate-500 uppercase mb-4">Developers</p>
            <ul className="space-y-3">
              {["API Docs", "Webhooks", "SDKs", "Status"].map((l) => (
                <li key={l}><a href="#" className="text-slate-400 text-sm hover:text-white transition-colors">{l}</a></li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <p className="text-xs font-bold tracking-widest text-slate-500 uppercase mb-4">Company</p>
            <ul className="space-y-3">
              {["About", "B2B Partnerships", "Privacy Policy", "Terms of Service"].map((l) => (
                <li key={l}><a href="#" className="text-slate-400 text-sm hover:text-white transition-colors">{l}</a></li>
              ))}
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-slate-500 text-sm">© 2026 vPasi. Reliable Guide for Cross-Border Trade.</p>
          <Link to="/chat">
            <Button className="btn-cta">
              Try the Agent →
            </Button>
          </Link>
        </div>
      </div>
    </footer>
  );
}
