import { useInView } from "../hooks/useInView";

const pillars = [
  { label: "Async Core", desc: "Handles peak border-hour traffic" },
  { label: "Stateless API", desc: "Scales horizontally, zero downtime" },
  { label: "End-to-End Encrypted", desc: "Your data never leaves your control" },
];

export function TechnicalTrust() {
  const { ref, visible } = useInView();

  return (
    <section className="bg-stone-50 py-20 px-6">
      <div
        ref={ref}
        className={`max-w-4xl mx-auto text-center transition-all duration-700 ease-out ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
      >
        <p className="text-xs font-bold tracking-widest text-slate-400 uppercase mb-3">Infrastructure</p>
        <h3 className="text-3xl font-extrabold text-slate-900 mb-4">Built for Scale.</h3>
        <p className="text-slate-500 leading-relaxed max-w-xl mx-auto mb-10">
          A high-performance asynchronous engine designed to handle peak border-hour
          traffic without dropping a single USSD session.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          {pillars.map(({ label, desc }) => (
            <div key={label} className="bg-white border border-slate-200 rounded-xl px-6 py-4 text-left hover:border-orange-200 hover:shadow-md transition-all duration-200">
              <p className="text-sm font-bold text-slate-900 mb-0.5">{label}</p>
              <p className="text-xs text-slate-500">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
