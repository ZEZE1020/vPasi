function LandingPage() {
  return (
    <div className="landing-shell">
      <div className="landing-glow landing-glow-a" aria-hidden="true" />
      <div className="landing-glow landing-glow-b" aria-hidden="true" />

      <main className="landing-card">
        <p className="landing-kicker">vPasi Trade Assistant</p>
        <h1 className="landing-title">
          Market intelligence for cross-border traders
        </h1>
        <p className="landing-copy">
          vPasi helps informal traders in East and Central Africa make better
          decisions with practical, source-backed answers on duties, border
          requirements, and regional price signals.
        </p>

        <ul className="landing-features">
          <li>Regulation and customs guidance</li>
          <li>Source citations for verification</li>
          <li>Web, USSD, voice, and WhatsApp access</li>
        </ul>

        <div className="landing-actions">
          <a className="landing-primary" href="/app/">
            Try the Agent
          </a>
          <a className="landing-secondary" href="/app/#about">
            Learn More
          </a>
        </div>
      </main>
    </div>
  );
}

export default LandingPage;
