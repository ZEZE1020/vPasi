import { Check } from "lucide-react";
import { useInView } from "../hooks/useInView";

const forTraders = [
  "Access loans based on your actual trading consistency",
  "Build financial reputation without collateral",
  "Transparent pricing based on real performance data",
];

const forPartners = [
  "Reach a previously invisible demographic of traders",
  "Access verified, timestamped transaction data",
  "Reduce default risk with behavioral lending models",
];

function CheckList({ items, delay = 0 }: { items: string[]; delay?: number }) {
  return (
    <div className="space-y-4">
      {items.map((item, i) => (
        <div key={item} className="flex items-start gap-3" style={{ animationDelay: `${delay + i * 80}ms` }}>
          <div className="w-5 h-5 rounded-full bg-orange-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
            <Check className="w-3 h-3 text-orange-400" />
          </div>
          <p className="text-slate-300 text-sm leading-relaxed">{item}</p>
        </div>
      ))}
    </div>
  );
}

export function MoatSection() {
  const { ref: headRef, visible: headVisible } = useInView();
  const { ref: bodyRef, visible: bodyVisible } = useInView();

  return (
    <section className="bg-slate-900 py-24 px-6">
      <div className="max-w-6xl mx-auto">

        <div
          ref={headRef}
          className={`text-center mb-16 transition-all duration-700 ease-out ${headVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
        >
          <p className="text-xs font-bold tracking-widest text-orange-500 uppercase mb-4">Financial Inclusion</p>
          <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-5 leading-tight">
            Your Trade History is<br />Your Credit Score.
          </h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto leading-relaxed">
            Every fee you log builds a verifiable digital track record. vPasi
            translates your hard work into an alternative credit profile that unlocks real capital.
          </p>
        </div>

        <div
          ref={bodyRef}
          className={`grid md:grid-cols-2 gap-6 mb-12 transition-all duration-700 ease-out ${bodyVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
        >
          <div className="vpasi-card p-8" style={{ background: 'linear-gradient(to bottom, #1e293b, #0f172a)', borderColor: '#334155' }}>
            <CheckList items={forTraders} />
          </div>
          <div className="vpasi-card p-8" style={{ background: 'linear-gradient(to bottom, #1e293b, #0f172a)', borderColor: '#334155' }}>
            <CheckList items={forPartners} delay={200} />
          </div>
        </div>

        <div className="text-center">
          <button className="btn-cta">
            Become a Lending Partner →
          </button>
        </div>
      </div>
    </section>
  );
}
