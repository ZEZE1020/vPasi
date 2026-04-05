import { Code, Book, Key, Zap, Shield, Globe } from 'lucide-react';

export function ApiDocsPage() {
  const endpoints = [
    {
      method: 'POST',
      path: '/api/v1/tariff/calculate',
      description: 'Calculate tariffs for cross-border trade',
      params: ['goods_category', 'goods_value', 'origin', 'destination', 'border_crossing']
    },
    {
      method: 'GET',
      path: '/api/v1/borders',
      description: 'Get list of supported border crossings',
      params: ['country (optional)']
    },
    {
      method: 'POST',
      path: '/api/v1/trade/log',
      description: 'Log a completed trade transaction',
      params: ['user_id', 'trade_details', 'timestamp']
    },
    {
      method: 'GET',
      path: '/api/v1/trade/history',
      description: 'Retrieve user trade history',
      params: ['user_id', 'start_date', 'end_date', 'limit']
    },
    {
      method: 'GET',
      path: '/api/v1/rates/exchange',
      description: 'Get current exchange rates for EAC currencies',
      params: ['base_currency', 'target_currency']
    }
  ];

  const features = [
    {
      icon: Zap,
      title: 'Lightning Fast',
      description: 'Average response time under 200ms across all endpoints'
    },
    {
      icon: Shield,
      title: 'Enterprise Security',
      description: 'OAuth 2.0, rate limiting, and end-to-end encryption'
    },
    {
      icon: Globe,
      title: 'Always Available',
      description: '99.9% uptime SLA with automatic failover'
    }
  ];

  return (
    <div className="w-full min-h-screen">
      {/* Hero Section */}
      <section 
        className="w-full py-20 px-6 md:px-12 relative overflow-hidden"
        style={{ backgroundColor: 'var(--vpasi-bg-secondary)' }}
      >
        <div className="max-w-5xl mx-auto relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <div 
              className="w-16 h-16 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: 'rgba(16, 185, 129, 0.2)' }}
            >
              <Code className="w-8 h-8" style={{ color: 'var(--vpasi-cta-primary)' }} />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-white">
                API Documentation
              </h1>
              <p className="text-white/80 mt-2">
                Version 1.0 • RESTful API
              </p>
            </div>
          </div>
          
          <p className="text-xl text-white/90 max-w-3xl mt-6">
            Integrate vPasi's tariff calculation and trade tracking directly into your platform. Built for financial institutions, logistics companies, and fintech applications.
          </p>
          
          <div className="flex gap-4 mt-8">
            <button 
              className="px-6 py-3 rounded-lg font-semibold transition-all hover:opacity-90"
              style={{ backgroundColor: 'var(--vpasi-cta-primary)', color: 'white' }}
            >
              Get API Key
            </button>
            <button 
              className="px-6 py-3 rounded-lg font-semibold border-2 border-white text-white transition-all hover:bg-white"
              style={{ 
                transition: 'all 0.3s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = 'var(--vpasi-bg-secondary)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'white';
              }}
            >
              View Sample Code
            </button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="w-full py-16 px-6 md:px-12" style={{ backgroundColor: '#F1F5F9' }}>
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white p-8 rounded-xl shadow-sm">
                <div 
                  className="w-12 h-12 rounded-lg flex items-center justify-center mb-4"
                  style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)' }}
                >
                  <feature.icon className="w-6 h-6" style={{ color: 'var(--vpasi-cta-primary)' }} />
                </div>
                <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--vpasi-text-primary)' }}>
                  {feature.title}
                </h3>
                <p className="opacity-80" style={{ color: 'var(--vpasi-text-primary)' }}>
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Start */}
      <section className="w-full py-16 px-6 md:px-12" style={{ backgroundColor: 'var(--vpasi-bg-primary)' }}>
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <Book className="w-8 h-8" style={{ color: 'var(--vpasi-cta-primary)' }} />
            <h2 className="text-3xl font-bold" style={{ color: 'var(--vpasi-text-primary)' }}>
              Quick Start Guide
            </h2>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-8 space-y-8">
            {/* Step 1 */}
            <div>
              <h3 className="text-xl font-semibold mb-4" style={{ color: 'var(--vpasi-text-primary)' }}>
                1. Get Your API Key
              </h3>
              <div className="bg-gray-50 p-6 rounded-lg border-l-4" style={{ borderColor: 'var(--vpasi-cta-primary)' }}>
                <p className="mb-4" style={{ color: 'var(--vpasi-text-primary)' }}>
                  Sign up for a developer account and generate your API key from the dashboard.
                </p>
                <div 
                  className="flex items-center gap-3 px-4 py-3 rounded"
                  style={{ backgroundColor: 'var(--vpasi-bg-secondary)' }}
                >
                  <Key className="w-5 h-5 text-white/70" />
                  <code className="text-sm text-white/90 font-mono">
                    vpasi_live_abc123xyz789...
                  </code>
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div>
              <h3 className="text-xl font-semibold mb-4" style={{ color: 'var(--vpasi-text-primary)' }}>
                2. Make Your First Request
              </h3>
              <div className="bg-gray-900 p-6 rounded-lg overflow-x-auto">
                <pre className="text-sm text-green-400 font-mono">
{`curl -X POST https://api.vpasi.com/v1/tariff/calculate \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "goods_category": "Electronics",
    "goods_value": 3500,
    "origin": "Kenya",
    "destination": "Uganda",
    "border_crossing": "Busia"
  }'`}
                </pre>
              </div>
            </div>

            {/* Step 3 */}
            <div>
              <h3 className="text-xl font-semibold mb-4" style={{ color: 'var(--vpasi-text-primary)' }}>
                3. Handle the Response
              </h3>
              <div className="bg-gray-900 p-6 rounded-lg overflow-x-auto">
                <pre className="text-sm text-blue-300 font-mono">
{`{
  "success": true,
  "data": {
    "goods_value": 3500,
    "tariff_rate": 0.12,
    "tariff_amount": 420,
    "processing_fee": 50,
    "total_cost": 470,
    "currency": "USD",
    "border": "Busia (Kenya-Uganda)",
    "estimated_wait_time": "45 minutes"
  },
  "timestamp": "2026-04-03T10:30:00Z"
}`}
                </pre>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Endpoints */}
      <section className="w-full py-16 px-6 md:px-12" style={{ backgroundColor: '#F1F5F9' }}>
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold mb-8" style={{ color: 'var(--vpasi-text-primary)' }}>
            API Endpoints
          </h2>
          
          <div className="space-y-4">
            {endpoints.map((endpoint, index) => (
              <div key={index} className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
                    <span 
                      className="px-3 py-1 rounded font-mono text-sm font-semibold inline-block w-fit"
                      style={{ 
                        backgroundColor: endpoint.method === 'GET' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(249, 115, 22, 0.1)',
                        color: endpoint.method === 'GET' ? 'var(--vpasi-cta-primary)' : 'var(--vpasi-alert)'
                      }}
                    >
                      {endpoint.method}
                    </span>
                    <code 
                      className="text-lg font-mono"
                      style={{ color: 'var(--vpasi-text-primary)' }}
                    >
                      {endpoint.path}
                    </code>
                  </div>
                  
                  <p className="mb-4 opacity-80" style={{ color: 'var(--vpasi-text-primary)' }}>
                    {endpoint.description}
                  </p>
                  
                  <div>
                    <p className="text-sm font-semibold mb-2" style={{ color: 'var(--vpasi-text-primary)' }}>
                      Parameters:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {endpoint.params.map((param, i) => (
                        <code 
                          key={i}
                          className="px-3 py-1 rounded text-sm"
                          style={{ 
                            backgroundColor: '#F1F5F9',
                            color: 'var(--vpasi-text-primary)'
                          }}
                        >
                          {param}
                        </code>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Authentication */}
      <section className="w-full py-16 px-6 md:px-12" style={{ backgroundColor: 'var(--vpasi-bg-primary)' }}>
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold mb-8" style={{ color: 'var(--vpasi-text-primary)' }}>
            Authentication
          </h2>
          
          <div className="bg-white rounded-xl shadow-sm p-8">
            <p className="mb-6" style={{ color: 'var(--vpasi-text-primary)' }}>
              All API requests must include your API key in the Authorization header using Bearer authentication:
            </p>
            
            <div className="bg-gray-900 p-6 rounded-lg mb-6">
              <pre className="text-sm text-green-400 font-mono">
                Authorization: Bearer YOUR_API_KEY
              </pre>
            </div>
            
            <div 
              className="p-4 rounded-lg"
              style={{ backgroundColor: 'rgba(249, 115, 22, 0.1)' }}
            >
              <p className="text-sm" style={{ color: 'var(--vpasi-text-primary)' }}>
                ⚠️ <strong>Important:</strong> Never expose your API key in client-side code. All API calls should be made from your server.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Rate Limits */}
      <section className="w-full py-16 px-6 md:px-12" style={{ backgroundColor: '#F1F5F9' }}>
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold mb-8" style={{ color: 'var(--vpasi-text-primary)' }}>
            Rate Limits
          </h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h3 className="font-semibold mb-2" style={{ color: 'var(--vpasi-text-primary)' }}>
                Free Tier
              </h3>
              <p className="text-3xl font-bold mb-2" style={{ color: 'var(--vpasi-cta-primary)' }}>
                100
              </p>
              <p className="text-sm opacity-70" style={{ color: 'var(--vpasi-text-primary)' }}>
                requests per hour
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h3 className="font-semibold mb-2" style={{ color: 'var(--vpasi-text-primary)' }}>
                Pro Tier
              </h3>
              <p className="text-3xl font-bold mb-2" style={{ color: 'var(--vpasi-cta-primary)' }}>
                1,000
              </p>
              <p className="text-sm opacity-70" style={{ color: 'var(--vpasi-text-primary)' }}>
                requests per hour
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h3 className="font-semibold mb-2" style={{ color: 'var(--vpasi-text-primary)' }}>
                Enterprise
              </h3>
              <p className="text-3xl font-bold mb-2" style={{ color: 'var(--vpasi-cta-primary)' }}>
                Custom
              </p>
              <p className="text-sm opacity-70" style={{ color: 'var(--vpasi-text-primary)' }}>
                Contact sales
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section 
        className="w-full py-16 px-6 md:px-12"
        style={{ backgroundColor: 'var(--vpasi-bg-secondary)' }}
      >
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h2 className="text-3xl md:text-4xl font-bold text-white">
            Ready to Integrate?
          </h2>
          <p className="text-xl text-white/80">
            Get your API key and start building in minutes
          </p>
          <button 
            className="px-8 py-4 rounded-lg font-semibold transition-all hover:opacity-90 inline-flex items-center gap-2"
            style={{ backgroundColor: 'var(--vpasi-cta-primary)', color: 'white' }}
          >
            <Key className="w-5 h-5" />
            Get API Access
          </button>
        </div>
      </section>
    </div>
  );
}
