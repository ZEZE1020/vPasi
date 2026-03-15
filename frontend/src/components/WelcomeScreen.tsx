const SUGGESTIONS = [
  "What are the import duties on textiles from Tanzania to Kenya?",
  "Compare maize prices across East African markets",
  "What documents do I need for cross-border trade between Uganda and DRC?",
  "Latest trade regulations for agricultural exports in COMESA region",
];

function WelcomeScreen({
  onSuggestionClick,
}: {
  onSuggestionClick: (q: string) => void;
}) {
  return (
    <div className="welcome-screen">
      <h1 className="welcome-title">vPasi Research</h1>
      <p className="welcome-subtitle">
        AI-powered trade research for African cross-border traders
      </p>
      <div className="suggestions-grid">
        {SUGGESTIONS.map((s, i) => (
          <button
            key={i}
            className="suggestion-chip"
            onClick={() => onSuggestionClick(s)}
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}

export default WelcomeScreen;
