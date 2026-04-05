import { Home, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

export function NotFoundPage() {
  return (
    <div
      className="w-full min-h-[80vh] flex items-center justify-center px-6"
      style={{ backgroundColor: "var(--vpasi-bg-primary)" }}
    >
      <div className="max-w-2xl mx-auto text-center space-y-6">
        <div
          className="text-8xl font-bold"
          style={{ color: "var(--vpasi-cta-primary)" }}
        >
          404
        </div>

        <h1
          className="text-3xl md:text-4xl font-bold"
          style={{ color: "var(--vpasi-text-primary)" }}
        >
          Page Not Found
        </h1>

        <p
          className="text-lg opacity-80"
          style={{ color: "var(--vpasi-text-primary)" }}
        >
          Looks like you've crossed into uncharted territory. Let's get you back
          on track.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
          <Link to="/">
            <button
              className="px-6 py-3 rounded-lg font-semibold transition-all hover:opacity-90 flex items-center gap-2"
              style={{
                backgroundColor: "var(--vpasi-cta-primary)",
                color: "white",
              }}
            >
              <Home className="w-5 h-5" />
              Go Home
            </button>
          </Link>

          <button
            onClick={() => window.history.back()}
            className="px-6 py-3 rounded-lg font-semibold border-2 transition-all hover:opacity-80 flex items-center gap-2"
            style={{
              borderColor: "var(--vpasi-cta-primary)",
              color: "var(--vpasi-cta-primary)",
            }}
          >
            <ArrowLeft className="w-5 h-5" />
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
}
