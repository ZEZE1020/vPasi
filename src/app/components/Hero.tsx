import { Link } from "react-router-dom";
import { useInView } from "../hooks/useInView";
import { useEffect, useState } from "react";
import Button from "./Button";

const WORDS = [
  "Predictable",
  "Repeatable",
  "Profitable",
  "Transparent",
  "Resilient",
] as const;

const INTERVAL = 2600; // ms per word

const snapshot = [
  { label: "Route", value: "Busia → Kampala", accent: false },
  { label: "Estimated Tariff", value: "UGX 184,000", accent: true },
  { label: "Projected Margin", value: "+18.6%", accent: false },
];

function RotatingWord() {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const id = setInterval(() => {
      // fade out
      setVisible(false);
      setTimeout(() => {
        setIndex((i) => (i + 1) % WORDS.length);
        setVisible(true);
      }, 350); // half the CSS transition
    }, INTERVAL);
    return () => clearInterval(id);
  }, []);

  return (
    <span
      className="inline-block text-orange-500 transition-all duration-300 ease-in-out"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(-12px)",
      }}
    >
      {WORDS[index]}
    </span>
  );
}

export function Hero() {
  const { ref, visible } = useInView(0.1);

  return (
    <section className="bg-stone-50 pt-20 pb-24 px-6">
      <div
        ref={ref}
        className={`max-w-4xl mx-auto text-center transition-all duration-700 ease-out ${
          visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}
      >
        {/* Kicker */}
        <div className="inline-flex items-center gap-2 bg-orange-50 border border-orange-200 text-orange-600 text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
          East Africa's Trade Intelligence Layer
        </div>

        {/* Headline */}
        <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-slate-900 leading-[1.12] tracking-tight mb-6">
          <RotatingWord /> Trade.
          <br />
          <span className="text-orange-500">In Your Pocket.</span>
        </h1>

        <p className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed mb-10">
          Navigate East African border compliance, calculate exact tariffs, and
          track profit margins—via USSD and WhatsApp. No smartphone or internet
          required.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
          <Link to="/chat">
            <Button className="btn-cta">Try the Agent →</Button>
          </Link>
          <Link to="/api-docs">
            <Button className="btn-cta btn-cta-outline">View API Docs</Button>
          </Link>
        </div>

        {/* Live Trade Snapshot */}
        <div
          className={`vpasi-card p-6 text-left transition-all duration-700 delay-300 ease-out ${
            visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <div className="flex items-center gap-2 mb-5">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <p className="text-xs font-bold tracking-widest text-slate-400 uppercase">
              Live Trade Snapshot
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {snapshot.map(({ label, value, accent }) => (
              <div
                key={label}
                className="rounded-xl bg-stone-50 border border-slate-200 p-4"
              >
                <p className="text-xs text-slate-400 font-medium mb-1.5">
                  {label}
                </p>
                <p
                  className={`text-xl font-extrabold ${accent ? "text-orange-500" : "text-slate-900"}`}
                >
                  {value}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
