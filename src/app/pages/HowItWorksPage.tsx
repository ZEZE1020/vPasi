import { MessageSquare, Calculator, FileText, CheckCircle, ArrowRight } from 'lucide-react';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';

export function HowItWorksPage() {
  const steps = [
    {
      icon: MessageSquare,
      title: "Send a Message",
      description: "Text 'Hi' to our WhatsApp number or dial our USSD code on any phone",
      details: ["Works on feature phones", "No internet required", "Instant response"],
      image: "https://images.unsplash.com/photo-1699531683515-d9c19d9cf9c6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzbWFydHBob25lJTIwY29tbXVuaWNhdGlvbiUyMGhhbmRzfGVufDF8fHx8MTc3NTA3ODk2M3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
    },
    {
      icon: Calculator,
      title: "Get Instant Calculations",
      description: "Tell us what you're trading and where you're going - we calculate everything",
      details: ["Real-time tariff rates", "Border crossing fees", "Total cost breakdown"],
      image: "https://images.unsplash.com/photo-1744610108846-88775c8c8d9f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsb2dpc3RpY3MlMjBib3JkZXIlMjBjcm9zc2luZyUyMHRydWNrfGVufDF8fHx8MTc3NTA3ODk2M3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
    },
    {
      icon: FileText,
      title: "Track Your Trades",
      description: "Every transaction is automatically logged and accessible anytime",
      details: ["Digital receipts", "Monthly summaries", "Tax-ready reports"],
      image: "https://images.unsplash.com/photo-1727459985930-6e1311772791?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0cmFkaW5nJTIwZ29vZHMlMjBtYXJrZXR8ZW58MXx8fHwxNzc1MDc4OTY0fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
    },
    {
      icon: CheckCircle,
      title: "Cross Borders with Confidence",
      description: "Show up at the border knowing exactly what you'll pay",
      details: ["No surprises", "No arguments", "Build your credit score"],
      image: "https://images.unsplash.com/photo-1563132337-f159f484226c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhZnJpY2FuJTIwd29tYW4lMjBlbnRyZXByZW5ldXJ8ZW58MXx8fHwxNzc1MjE0NTQwfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
    }
  ];

  const useCases = [
    {
      title: "Small-Scale Traders",
      description: "Cross borders 2-3 times per week with textiles, electronics, or food products",
      benefits: ["Save 2-3 hours per crossing", "Reduce disputes by 80%", "Track every transaction"]
    },
    {
      title: "Logistics Companies",
      description: "Manage multiple drivers and shipments across East Africa",
      benefits: ["Real-time tracking", "Automated reporting", "API integration available"]
    },
    {
      title: "Market Vendors",
      description: "Source goods from neighboring countries for resale",
      benefits: ["Calculate profit margins instantly", "Plan purchases better", "Access credit facilities"]
    }
  ];

  return (
    <div className="w-full min-h-screen">
      {/* Hero Section */}
      <section 
        className="w-full py-20 px-6 md:px-12 relative overflow-hidden"
        style={{ backgroundColor: 'var(--vpasi-bg-primary)' }}
      >
        <div className="absolute inset-0 opacity-10">
          <ImageWithFallback
            src="https://images.unsplash.com/photo-1768212565426-58b089b6386d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhZnJpY2FuJTIwbWFya2V0JTIwY29sb3JmdWwlMjB2aWJyYW50fGVufDF8fHx8MTc3NTIwOTM0NHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
            alt="African market"
            className="w-full h-full object-cover"
          />
        </div>
        
        <div className="max-w-4xl mx-auto text-center space-y-6 relative z-10">
          <div className="flex justify-center mb-4">
            <div className="w-20 h-1 rounded-full" style={{ background: 'linear-gradient(to right, var(--vpasi-cta-primary), var(--vpasi-alert))' }} />
          </div>
          
          <h1 
            className="text-4xl md:text-6xl font-bold"
            style={{ color: 'var(--vpasi-text-primary)' }}
          >
            How vPasi Works
          </h1>
          
          <p 
            className="text-xl opacity-80 max-w-2xl mx-auto"
            style={{ color: 'var(--vpasi-text-primary)' }}
          >
            From your first message to building a verified trade history, here's how vPasi transforms cross-border trading.
          </p>
        </div>
      </section>

      {/* Steps Section */}
      <section className="w-full py-20 px-6 md:px-12" style={{ backgroundColor: '#F1F5F9' }}>
        <div className="max-w-6xl mx-auto space-y-24">
          {steps.map((step, index) => (
            <div 
              key={index} 
              className={`grid md:grid-cols-2 gap-12 items-center ${index % 2 === 1 ? 'md:flex-row-reverse' : ''}`}
            >
              {/* Content */}
              <div className={`${index % 2 === 1 ? 'md:order-2' : ''}`}>
                <div 
                  className="w-16 h-16 rounded-full flex items-center justify-center mb-6"
                  style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)' }}
                >
                  <step.icon className="w-8 h-8" style={{ color: 'var(--vpasi-cta-primary)' }} />
                </div>
                
                <div className="flex items-center gap-3 mb-4">
                  <span 
                    className="text-5xl font-bold opacity-20"
                    style={{ color: 'var(--vpasi-cta-primary)' }}
                  >
                    {index + 1}
                  </span>
                  <h2 
                    className="text-3xl font-bold"
                    style={{ color: 'var(--vpasi-text-primary)' }}
                  >
                    {step.title}
                  </h2>
                </div>
                
                <p 
                  className="text-lg opacity-80 mb-6"
                  style={{ color: 'var(--vpasi-text-primary)' }}
                >
                  {step.description}
                </p>
                
                <div className="space-y-3">
                  {step.details.map((detail, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 flex-shrink-0" style={{ color: 'var(--vpasi-cta-primary)' }} />
                      <span style={{ color: 'var(--vpasi-text-primary)' }}>{detail}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Image */}
              <div className={`${index % 2 === 1 ? 'md:order-1' : ''}`}>
                <div className="rounded-2xl overflow-hidden shadow-2xl">
                  <ImageWithFallback
                    src={step.image}
                    alt={step.title}
                    className="w-full h-auto"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* WhatsApp Demo Section */}
      <section className="w-full py-20 px-6 md:px-12" style={{ backgroundColor: 'var(--vpasi-bg-primary)' }}>
        <div className="max-w-4xl mx-auto">
          <h2 
            className="text-3xl md:text-4xl font-bold text-center mb-12"
            style={{ color: 'var(--vpasi-text-primary)' }}
          >
            See It In Action
          </h2>
          
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
            <div className="space-y-6">
              {/* User Message */}
              <div className="flex justify-end">
                <div 
                  className="max-w-xs px-6 py-3 rounded-2xl rounded-tr-sm"
                  style={{ backgroundColor: 'var(--vpasi-cta-primary)' }}
                >
                  <p className="text-white">
                    Hi, I want to take electronics from Nairobi to Kampala
                  </p>
                </div>
              </div>
              
              {/* Bot Response 1 */}
              <div className="flex justify-start">
                <div className="max-w-md px-6 py-3 rounded-2xl rounded-tl-sm bg-gray-100">
                  <p style={{ color: 'var(--vpasi-text-primary)' }}>
                    Great! I'll help you calculate the tariffs. What's the total value of the electronics in USD?
                  </p>
                </div>
              </div>
              
              {/* User Message */}
              <div className="flex justify-end">
                <div 
                  className="max-w-xs px-6 py-3 rounded-2xl rounded-tr-sm"
                  style={{ backgroundColor: 'var(--vpasi-cta-primary)' }}
                >
                  <p className="text-white">$3,500</p>
                </div>
              </div>
              
              {/* Bot Response 2 */}
              <div className="flex justify-start">
                <div className="max-w-md px-6 py-3 rounded-2xl rounded-tl-sm bg-gray-100">
                  <p className="mb-3" style={{ color: 'var(--vpasi-text-primary)' }}>
                    ✅ <strong>Tariff Calculation Complete!</strong>
                  </p>
                  <div className="space-y-2 text-sm" style={{ color: 'var(--vpasi-text-primary)' }}>
                    <p>📦 Goods Value: $3,500</p>
                    <p>📊 Tariff Rate: 12%</p>
                    <p>💵 Tariff Amount: $420</p>
                    <p>🔧 Processing Fee: $50</p>
                    <p className="pt-2 border-t font-semibold">💰 Total Cost: $470</p>
                    <p className="text-xs opacity-70 pt-2">
                      Border: Busia (Kenya-Uganda)<br/>
                      Expected wait time: 45 mins
                    </p>
                  </div>
                </div>
              </div>
              
              {/* User Message */}
              <div className="flex justify-end">
                <div 
                  className="max-w-xs px-6 py-3 rounded-2xl rounded-tr-sm"
                  style={{ backgroundColor: 'var(--vpasi-cta-primary)' }}
                >
                  <p className="text-white">Save this</p>
                </div>
              </div>
              
              {/* Bot Response 3 */}
              <div className="flex justify-start">
                <div className="max-w-md px-6 py-3 rounded-2xl rounded-tl-sm bg-gray-100">
                  <p style={{ color: 'var(--vpasi-text-primary)' }}>
                    ✅ Saved to your trade history! You can access it anytime by texting "history" or view it in your dashboard.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="mt-8 text-center">
              <button 
                className="px-8 py-4 rounded-lg font-semibold transition-all hover:opacity-90 flex items-center gap-2 mx-auto"
                style={{ backgroundColor: 'var(--vpasi-cta-primary)', color: 'white' }}
              >
                <MessageSquare className="w-5 h-5" />
                Try It Yourself
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="w-full py-20 px-6 md:px-12" style={{ backgroundColor: '#F1F5F9' }}>
        <div className="max-w-6xl mx-auto">
          <h2 
            className="text-3xl md:text-4xl font-bold text-center mb-12"
            style={{ color: 'var(--vpasi-text-primary)' }}
          >
            Who Uses vPasi?
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {useCases.map((useCase, index) => (
              <div key={index} className="bg-white p-8 rounded-xl shadow-sm">
                <h3 
                  className="text-xl font-bold mb-3"
                  style={{ color: 'var(--vpasi-text-primary)' }}
                >
                  {useCase.title}
                </h3>
                <p 
                  className="opacity-80 mb-6"
                  style={{ color: 'var(--vpasi-text-primary)' }}
                >
                  {useCase.description}
                </p>
                <div className="space-y-3">
                  {useCase.benefits.map((benefit, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <ArrowRight className="w-4 h-4 mt-1 flex-shrink-0" style={{ color: 'var(--vpasi-cta-primary)' }} />
                      <span className="text-sm" style={{ color: 'var(--vpasi-text-primary)' }}>
                        {benefit}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section 
        className="w-full py-20 px-6 md:px-12"
        style={{ backgroundColor: 'var(--vpasi-bg-secondary)' }}
      >
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h2 className="text-3xl md:text-5xl font-bold text-white">
            Ready to Start Trading Smarter?
          </h2>
          <p className="text-xl text-white/80">
            Join 5,000+ traders who trust vPasi for their cross-border business
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <button 
              className="px-8 py-4 rounded-lg font-semibold transition-all hover:opacity-90"
              style={{ backgroundColor: 'var(--vpasi-cta-primary)', color: 'white' }}
            >
              Get Started Now
            </button>
            <button 
              className="px-8 py-4 rounded-lg font-semibold border-2 border-white text-white transition-all hover:bg-white hover:text-[var(--vpasi-bg-secondary)]"
            >
              Talk to Sales
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
