import { useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL || "";

function WelcomeScreen({ onSuggestionClick }: { onSuggestionClick: (q: string) => void }) {
  const [suggestions, setSuggestions] = useState<string[]>([]);

  useEffect(() => {
    fetch(`${API_URL}/api/suggestions`)
      .then((r) => r.json())
      .then(setSuggestions)
      .catch(() => setSuggestions([]));
  }, []);

  return (
    <div className="welcome-screen">
      <h1 className="welcome-title">vPasi Research</h1>
      <p className="welcome-subtitle">
        AI-powered trade research for African cross-border traders
      </p>
      {suggestions.length > 0 && (
        <div className="suggestions-grid">
          {suggestions.map((s, i) => (
            <button key={i} className="suggestion-chip" onClick={() => onSuggestionClick(s)}>
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default WelcomeScreen;
