import { Menu, X } from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";

const navLinks = [
  { name: "Home", path: "/" },
  { name: "Calculator", path: "/calculator" },
  { name: "Dashboard", path: "/dashboard" },
  { name: "How It Works", path: "/how-it-works" },
  { name: "API Docs", path: "/api-docs" },
];

export function Navigation() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const active = (path: string) =>
    path === "/" ? location.pathname === "/" : location.pathname.startsWith(path);

  return (
    <nav className="sticky top-0 z-50 bg-stone-50/95 backdrop-blur-sm border-b border-slate-200">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-orange-500 flex items-center justify-center font-extrabold text-white text-sm shadow-md shadow-orange-200 group-hover:scale-105 transition-transform duration-200">
            vP
          </div>
          <span className="text-xl font-extrabold text-slate-900 tracking-tight">vPasi</span>
        </Link>

        <div className="hidden md:flex items-center gap-0.5">
          {navLinks.map((l) => (
            <Link
              key={l.path}
              to={l.path}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                active(l.path)
                  ? "text-slate-900 bg-slate-100"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              {l.name}
            </Link>
          ))}
        </div>

        <Link to="/chat" className="hidden md:block">
          <button className="btn-cta text-sm">
            Get Started →
          </button>
        </Link>

        <button
          className="md:hidden p-2 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors"
          onClick={() => setOpen(!open)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          aria-controls="mobile-nav"
        >
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      <div
        id="mobile-nav"
        className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${open ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}`}
        aria-hidden={!open}
      >
        <div className="px-6 pb-5 pt-2 space-y-1 border-t border-slate-100">
          {navLinks.map((l) => (
            <Link key={l.path} to={l.path} onClick={() => setOpen(false)}
              className={`block px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${active(l.path) ? "text-slate-900 bg-slate-100" : "text-slate-600"}`}>
              {l.name}
            </Link>
          ))}
          <Link to="/chat" onClick={() => setOpen(false)}>
            <button className="btn-cta w-full mt-3 text-sm">
              Get Started →
            </button>
          </Link>
        </div>
      </div>
    </nav>
  );
}
