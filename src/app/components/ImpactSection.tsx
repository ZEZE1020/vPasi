import { useInView } from "../hooks/useInView";

const stats = [
  { number: "5,000+", label: "Active Traders", accent: false },
  { number: "12", label: "Border Crossings", accent: false },
  { number: "45%", label: "Avg. Profit Increase", accent: true },
];

export function ImpactSection() {
  const { ref: imgRef, visible: imgVisible } = useInView();
  const { ref: statsRef, visible: statsVisible } = useInView();

  return (
    <section className="bg-stone-100 py-24 px-6">
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">

        {/* Image */}
        <div
          ref={imgRef}
          className={`relative rounded-2xl overflow-hidden transition-all duration-700 ease-out ${imgVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-8"}`}
        >
          <div className="bg-gradient-to-br from-slate-700 to-slate-900 h-96 rounded-2xl flex items-center justify-center">
            <div className="text-center px-8">
              <div className="text-5xl mb-4">🌍</div>
              <p className="text-slate-400 text-sm font-medium">
                Insert authentic photo of border crossing here
              </p>
            </div>
          </div>
          {/* Floating badge */}
          <div className="absolute bottom-5 left-5 bg-white rounded-xl px-4 py-3 shadow-lg flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs font-bold text-slate-700">Live across 12 borders</span>
          </div>
        </div>

        {/* Stats + Testimonial */}
        <div
          ref={statsRef}
          className={`space-y-10 transition-all duration-700 ease-out ${statsVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8"}`}
        >
          <div>
            <p className="text-xs font-bold tracking-widest text-orange-500 uppercase mb-6">By the Numbers</p>
            <div className="grid grid-cols-3 gap-4">
              {stats.map(({ number, label, accent }, i) => (
                <div
                  key={label}
                  className="vpasi-card p-5 text-center"
                  style={{ transitionDelay: `${i * 100}ms` }}
                >
                  <p className={`text-3xl font-extrabold mb-1 ${accent ? "text-orange-500" : "text-slate-900"}`}>
                    {number}
                  </p>
                  <p className="text-xs text-slate-500 font-medium leading-tight">{label}</p>
                </div>
              ))}
            </div>
          </div>

          <blockquote className="vpasi-card p-7">
            <div className="absolute top-0 left-7 w-0.5 h-full bg-orange-500 rounded-full" style={{ top: 0, height: "100%", left: "0", width: "4px", borderRadius: "0 0 0 16px" }} />
            <div className="border-l-4 border-orange-500 pl-6">
              <p className="text-slate-700 leading-relaxed mb-4 italic">
                "Before vPasi, I was guessing my profits. Now I know exactly what
                I'll make before I even cross the border."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-sm font-bold text-orange-600">G</div>
                <div>
                  <p className="text-sm font-bold text-slate-900">Grace M.</p>
                  <p className="text-xs text-slate-500">Cross-Border Trader, Busia</p>
                </div>
              </div>
            </div>
          </blockquote>
        </div>
      </div>
    </section>
  );
}
