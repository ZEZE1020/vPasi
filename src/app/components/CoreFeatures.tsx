import { Smartphone, Calculator, FileText } from "lucide-react";
import { useInView } from "../hooks/useInView";

const features = [
  {
    Icon: Smartphone,
    title: "Offline-First Ledger",
    body: "Track every expense, border fee, and sale via USSD or WhatsApp. Works on any phone, no data plan needed.",
  },
  {
    Icon: Calculator,
    title: "Instant Tariff Estimator",
    body: "Type your goods and crossing point. Get accurate EAC tariff calculations before you reach the border.",
  },
  {
    Icon: FileText,
    title: "Automated Tax Summaries",
    body: "Generate professional tax reports for compliance. Every transaction logged with timestamps and location.",
  },
];

export function CoreFeatures() {
  const { ref, visible } = useInView();

  return (
    <section className="bg-stone-50 py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <div ref={ref} className={`grid md:grid-cols-3 gap-5 transition-all duration-700 ease-out ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
          {features.map(({ Icon, title, body }, i) => (
            <div
              key={title}
              className="vpasi-card group p-8"
              style={{ transitionDelay: `${i * 100}ms` }}
            >
              <div className="w-12 h-12 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center mb-6 group-hover:bg-orange-500 group-hover:border-orange-500 transition-colors duration-300">
                <Icon className="w-5 h-5 text-orange-500 group-hover:text-white transition-colors duration-300" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-3">{title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed">{body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
