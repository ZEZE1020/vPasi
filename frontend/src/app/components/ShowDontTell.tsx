import { X, Check } from "lucide-react";
import { useInView } from "../hooks/useInView";

const pains = [
  "Informal exchange rates with no paper trail",
  "Arguing tariffs at the border with no proof",
  "Paper notebooks lost to rain or theft",
  "No credit history despite years of trading",
];

const gains = [
  "Real-time tariff calculations before you cross",
  "Know exact costs and margins in advance",
  "Automated digital ledger via USSD or WhatsApp",
  "Verifiable trade history that builds your credit",
];

const cards = [
  { icon: "⚡", title: "Works on USSD", body: "No internet needed. Dial in and get started instantly on any basic phone." },
  { icon: "💬", title: "WhatsApp Native", body: "Chat naturally. Get real-time tariffs, costs, and profit tracking in seconds." },
  { icon: "🔒", title: "Your Data. Your Rules.", body: "Trade history is encrypted, owned by you, and builds your credit profile." },
];

export function ShowDontTell() {
  const { ref: headRef, visible: headVisible } = useInView();
  const { ref: gridRef, visible: gridVisible } = useInView();
  const { ref: cardsRef, visible: cardsVisible } = useInView();

  return (
    <section className="bg-stone-100 py-24 px-6" id="features">
      <div className="max-w-6xl mx-auto">

        <div ref={headRef} className={`text-center mb-16 transition-all duration-700 ease-out ${headVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
          <p className="text-xs font-bold tracking-widest text-orange-500 uppercase mb-3">The vPasi Difference</p>
          <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900">Trade Without the Guesswork.</h2>
        </div>

        <div ref={gridRef} className={`grid md:grid-cols-2 gap-6 items-stretch transition-all duration-700 ease-out ${gridVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>

          {/* Manual Pains */}
          <div className="vpasi-card p-8">
            <div className="inline-block bg-slate-100 text-slate-500 text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full mb-8">
              Manual &amp; Unpredictable
            </div>
            <div className="space-y-5">
              {pains.map((p) => (
                <div key={p} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <X className="w-3 h-3 text-slate-400" />
                  </div>
                  <span className="text-slate-500 leading-relaxed">{p}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Digital & Predictable */}
          <div className="vpasi-card p-8 bg-slate-900" style={{ background: 'linear-gradient(to bottom, #1e293b, #0f172a)' }}>
            <div className="inline-block bg-orange-500/20 text-orange-400 text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full mb-8">
              Digital &amp; Predictable
            </div>
            <div className="space-y-5 mb-8">
              {gains.map((g) => (
                <div key={g} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-orange-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-3 h-3 text-orange-400" />
                  </div>
                  <span className="text-slate-300 leading-relaxed">{g}</span>
                </div>
              ))}
            </div>

            {/* WhatsApp Mockup */}
            <div className="bg-slate-800 rounded-xl p-4 space-y-3 border border-slate-700">
              <p className="text-xs text-slate-500 font-medium mb-3">WhatsApp · vPasi Bot</p>
              <div className="flex justify-end">
                <div className="bg-green-600 rounded-2xl rounded-tr-sm px-4 py-2.5 max-w-[80%]">
                  <p className="text-sm text-white">Just crossed Malaba. 500 KES transport.</p>
                </div>
              </div>
              <div className="flex justify-start">
                <div className="bg-slate-700 rounded-2xl rounded-tl-sm px-4 py-2.5 max-w-[80%]">
                  <p className="text-sm text-slate-200">
                    ✓ Logged. Trip profit:{" "}
                    <span className="font-extrabold text-orange-400">4,500 KES</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Cards */}
        <div ref={cardsRef} className={`grid md:grid-cols-3 gap-5 mt-6 transition-all duration-700 delay-150 ease-out ${cardsVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
          {cards.map(({ icon, title, body }, i) => (
            <div
              key={title}
              className="vpasi-card p-7"
              style={{ transitionDelay: `${i * 75}ms` }}
            >
              <div className="text-3xl mb-4">{icon}</div>
              <h4 className="text-base font-bold text-slate-900 mb-2">{title}</h4>
              <p className="text-slate-500 text-sm leading-relaxed">{body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
