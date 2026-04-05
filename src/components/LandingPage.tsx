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
        <div className="landing-body">
          <p className="landing-copy">
            Cross-border trade in East and Central Africa is often plagued by
            confusing regulations, arbitrary tariffs, language barriers, and
            fear of extortion at border crossings. Finding reliable, up-to-date
            information is challenging for informal traders.
          </p>
          <p className="landing-copy">
            <strong>vPasi</strong> levels the playing field. We provide informal
            traders with practical, source-backed answers to help them declare
            goods correctly, avoid confiscation, and navigate changing border
            requirements with confidence.
          </p>

          <ul className="landing-features">
            <li>Instant regulation and customs guidance</li>
            <li>Breakdowns of duties, tariffs, and required documents</li>
            <li>Source citations for easy verification</li>
            <li>Accessible anytime via Web, USSD, Voice, and WhatsApp</li>
          </ul>
        </div>

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
