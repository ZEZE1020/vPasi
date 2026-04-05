import { useInView } from "../hooks/useInView";

const countries = ["🇰🇪 Kenya", "🇺🇬 Uganda", "🇹🇿 Tanzania", "🇷🇼 Rwanda", "🇧🇮 Burundi"];

export function TrustBanner() {
  const { ref, visible } = useInView();

  return (
    <section className="bg-stone-50 py-12 px-6 border-y border-slate-200">
      <div
        ref={ref}
        className={`max-w-6xl mx-auto text-center transition-all duration-700 ease-out ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
      >
        <p className="text-xs font-bold tracking-widest text-slate-400 uppercase mb-6">
          Trusted by traders across East Africa
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          {countries.map((c) => (
            <span key={c} className="px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:border-orange-300 hover:text-orange-600 transition-colors duration-200">
              {c}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
