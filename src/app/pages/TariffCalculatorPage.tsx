import { useState } from 'react';
import { Calculator, ArrowRight, MapPin, Package, DollarSign, TrendingUp, Loader2, FileText } from 'lucide-react';
import { calculateTariffWithAI, mockCalculateTariff, type TariffResult } from '../services/tariffCalculator';

export function TariffCalculatorPage() {
  const [formData, setFormData] = useState({
    goodsCategory: '',
    goodsValue: '',
    originCountry: '',
    destinationCountry: '',
    borderCrossing: '',
  });

  const [result, setResult] = useState<TariffResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [aiPowered, setAiPowered] = useState(false);

  const goodsCategories = [
    'Electronics & Appliances',
    'Textiles & Clothing',
    'Food & Beverages',
    'Agricultural Products',
    'Building Materials',
    'Automotive Parts',
    'Pharmaceuticals',
    'Cosmetics & Personal Care',
  ];

  const countries = ['Kenya', 'Uganda', 'Tanzania', 'Rwanda', 'Burundi', 'South Sudan'];

  const borderCrossings = [
    'Busia (Kenya-Uganda)',
    'Malaba (Kenya-Uganda)',
    'Namanga (Kenya-Tanzania)',
    'Taveta (Kenya-Tanzania)',
    'Gatuna (Rwanda-Uganda)',
    'Kagitumba (Rwanda-Tanzania)',
  ];

  const calculateTariff = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    try {
      const ai = await calculateTariffWithAI(formData);
      if (ai) {
        setResult(ai);
        setAiPowered(true);
      } else {
        setResult(mockCalculateTariff(formData));
        setAiPowered(false);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen">
      {/* Hero Section */}
      <section 
        className="w-full py-16 px-6 md:px-12 relative overflow-hidden"
        style={{ backgroundColor: 'var(--vpasi-bg-primary)' }}
      >
        <div className="absolute inset-0 opacity-5 bg-slate-200" />
        
        <div className="max-w-4xl mx-auto text-center space-y-4 relative z-10">
          <div className="flex justify-center mb-4">
            <div 
              className="w-16 h-16 rounded-full flex items-center justify-center"
              style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)' }}
            >
              <Calculator className="w-8 h-8" style={{ color: 'var(--vpasi-cta-primary)' }} />
            </div>
          </div>
          
          <h1 
            className="text-4xl md:text-5xl font-bold"
            style={{ color: 'var(--vpasi-text-primary)' }}
          >
            Tariff Calculator
          </h1>
          
          <p 
            className="text-lg opacity-80 max-w-2xl mx-auto"
            style={{ color: 'var(--vpasi-text-primary)' }}
          >
            Calculate your exact border costs before you travel. Know your tariffs, fees, and potential profit margins in seconds.
          </p>
        </div>
      </section>

      {/* Calculator Section */}
      <section className="w-full py-12 px-6 md:px-12" style={{ backgroundColor: '#F1F5F9' }}>
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Form */}
            <div className="bg-white p-8 rounded-xl shadow-lg">
              <h2 className="text-2xl font-bold mb-6" style={{ color: 'var(--vpasi-text-primary)' }}>
                Enter Your Trade Details
              </h2>
              
              <form onSubmit={calculateTariff} className="space-y-6">
                {/* Goods Category */}
                <div>
                  <label className="flex items-center gap-2 mb-2 font-medium" style={{ color: 'var(--vpasi-text-primary)' }}>
                    <Package className="w-4 h-4" />
                    Goods Category
                  </label>
                  <select
                    value={formData.goodsCategory}
                    onChange={(e) => setFormData({ ...formData, goodsCategory: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border-2 focus:outline-none focus:border-[var(--vpasi-cta-primary)]"
                    required
                  >
                    <option value="">Select category...</option>
                    {goodsCategories.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                {/* Goods Value */}
                <div>
                  <label className="flex items-center gap-2 mb-2 font-medium" style={{ color: 'var(--vpasi-text-primary)' }}>
                    <DollarSign className="w-4 h-4" />
                    Goods Value (USD)
                  </label>
                  <input
                    type="number"
                    value={formData.goodsValue}
                    onChange={(e) => setFormData({ ...formData, goodsValue: e.target.value })}
                    placeholder="Enter value in USD"
                    className="w-full px-4 py-3 rounded-lg border-2 focus:outline-none focus:border-[var(--vpasi-cta-primary)]"
                    required
                    min="0"
                    step="0.01"
                  />
                </div>

                {/* Origin Country */}
                <div>
                  <label className="flex items-center gap-2 mb-2 font-medium" style={{ color: 'var(--vpasi-text-primary)' }}>
                    <MapPin className="w-4 h-4" />
                    Origin Country
                  </label>
                  <select
                    value={formData.originCountry}
                    onChange={(e) => setFormData({ ...formData, originCountry: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border-2 focus:outline-none focus:border-[var(--vpasi-cta-primary)]"
                    required
                  >
                    <option value="">Select origin...</option>
                    {countries.map((country) => (
                      <option key={country} value={country}>{country}</option>
                    ))}
                  </select>
                </div>

                {/* Destination Country */}
                <div>
                  <label className="flex items-center gap-2 mb-2 font-medium" style={{ color: 'var(--vpasi-text-primary)' }}>
                    <MapPin className="w-4 h-4" />
                    Destination Country
                  </label>
                  <select
                    value={formData.destinationCountry}
                    onChange={(e) => setFormData({ ...formData, destinationCountry: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border-2 focus:outline-none focus:border-[var(--vpasi-cta-primary)]"
                    required
                  >
                    <option value="">Select destination...</option>
                    {countries.map((country) => (
                      <option key={country} value={country}>{country}</option>
                    ))}
                  </select>
                </div>

                {/* Border Crossing */}
                <div>
                  <label className="flex items-center gap-2 mb-2 font-medium" style={{ color: 'var(--vpasi-text-primary)' }}>
                    <ArrowRight className="w-4 h-4" />
                    Border Crossing Point
                  </label>
                  <select
                    value={formData.borderCrossing}
                    onChange={(e) => setFormData({ ...formData, borderCrossing: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border-2 focus:outline-none focus:border-[var(--vpasi-cta-primary)]"
                    required
                  >
                    <option value="">Select border crossing...</option>
                    {borderCrossings.map((border) => (
                      <option key={border} value={border}>{border}</option>
                    ))}
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full px-6 py-4 rounded-xl font-bold btn-cta flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <><Loader2 className="w-5 h-5 animate-spin" /> Calculating with AI...</>
                  ) : (
                    <><Calculator className="w-5 h-5" /> Calculate Tariff</>
                  )}
                </button>
              </form>
            </div>

            {/* Results */}
            <div>
              {result ? (
                <div className="vpasi-card p-8 space-y-5">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center">
                        <TrendingUp className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="text-xl font-extrabold text-slate-900">Your Results</h3>
                    </div>
                    {aiPowered && (
                      <span className="text-xs font-bold bg-orange-50 text-orange-600 border border-orange-200 px-2.5 py-1 rounded-full">
                        ✦ AI-powered
                      </span>
                    )}
                  </div>

                  {result.hs_code && result.hs_code !== '—' && (
                    <div className="bg-slate-50 rounded-xl px-4 py-3 border border-slate-200">
                      <p className="text-xs text-slate-500 font-medium">HS Code</p>
                      <p className="font-bold text-slate-900">{result.hs_code}</p>
                    </div>
                  )}

                  <div className="space-y-3">
                    {[
                      { label: 'Goods Value', value: `$${parseFloat(formData.goodsValue).toFixed(2)}`, color: 'text-slate-900' },
                      { label: `Tariff (${result.tariff_rate}%)`, value: `$${result.tariff_amount.toFixed(2)}`, color: 'text-orange-500' },
                      { label: `VAT (${result.vat_rate}%)`, value: `$${result.vat_amount.toFixed(2)}`, color: 'text-orange-500' },
                      { label: 'Processing Fee', value: `$${result.processing_fee.toFixed(2)}`, color: 'text-slate-600' },
                    ].map(({ label, value, color }) => (
                      <div key={label} className="flex justify-between items-center pb-3 border-b border-slate-100">
                        <span className="text-slate-500 text-sm">{label}</span>
                        <span className={`font-bold ${color}`}>{value}</span>
                      </div>
                    ))}
                    <div className="flex justify-between items-center pt-2">
                      <span className="font-bold text-slate-900">Total Border Cost</span>
                      <span className="font-extrabold text-2xl text-orange-500">${result.total_cost.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="bg-green-50 rounded-xl p-4 border border-green-100 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-600">Estimated Profit (25% markup)</span>
                      <span className="font-bold text-green-700">${result.estimated_profit.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-semibold text-slate-700">Net Profit (after costs)</span>
                      <span className="font-extrabold text-green-700">${result.net_profit.toFixed(2)}</span>
                    </div>
                  </div>

                  {result.required_documents.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <FileText className="w-4 h-4 text-slate-500" />
                        <p className="text-sm font-bold text-slate-700 uppercase tracking-wide">Required Documents</p>
                      </div>
                      <ul className="space-y-1.5">
                        {result.required_documents.map((doc) => (
                          <li key={doc} className="flex items-center gap-2 text-sm text-slate-600">
                            <span className="w-1.5 h-1.5 rounded-full bg-orange-500 flex-shrink-0" />
                            {doc}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {result.notes && (
                    <div className="bg-orange-50 rounded-xl p-4 border border-orange-100">
                      <p className="text-sm text-slate-700">💡 {result.notes}</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-white p-8 rounded-xl shadow-lg h-full flex flex-col items-center justify-center text-center">
                  <Calculator className="w-16 h-16 mb-4 opacity-20" style={{ color: 'var(--vpasi-text-primary)' }} />
                  <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--vpasi-text-primary)' }}>
                    Ready to Calculate
                  </h3>
                  <p className="opacity-70" style={{ color: 'var(--vpasi-text-primary)' }}>
                    Fill in your trade details to see your tariff breakdown and profit estimates.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Info Section */}
      <section className="w-full py-16 px-6 md:px-12" style={{ backgroundColor: 'var(--vpasi-bg-primary)' }}>
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8" style={{ color: 'var(--vpasi-text-primary)' }}>
            How It Works
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div 
                className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)' }}
              >
                <span className="text-xl font-bold" style={{ color: 'var(--vpasi-cta-primary)' }}>1</span>
              </div>
              <h3 className="font-semibold mb-2" style={{ color: 'var(--vpasi-text-primary)' }}>
                Enter Details
              </h3>
              <p className="text-sm opacity-70" style={{ color: 'var(--vpasi-text-primary)' }}>
                Input your goods, value, and crossing point
              </p>
            </div>

            <div className="text-center">
              <div 
                className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)' }}
              >
                <span className="text-xl font-bold" style={{ color: 'var(--vpasi-cta-primary)' }}>2</span>
              </div>
              <h3 className="font-semibold mb-2" style={{ color: 'var(--vpasi-text-primary)' }}>
                Get Instant Results
              </h3>
              <p className="text-sm opacity-70" style={{ color: 'var(--vpasi-text-primary)' }}>
                See your tariffs and fees calculated automatically
              </p>
            </div>

            <div className="text-center">
              <div 
                className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)' }}
              >
                <span className="text-xl font-bold" style={{ color: 'var(--vpasi-cta-primary)' }}>3</span>
              </div>
              <h3 className="font-semibold mb-2" style={{ color: 'var(--vpasi-text-primary)' }}>
                Trade Confidently
              </h3>
              <p className="text-sm opacity-70" style={{ color: 'var(--vpasi-text-primary)' }}>
                Cross the border knowing exactly what to pay
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
