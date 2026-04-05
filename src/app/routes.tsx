import { createBrowserRouter } from "react-router-dom";
import { lazy, Suspense } from "react";
import { RootLayout } from "./layouts/RootLayout";
import { HomePage } from "./pages/HomePage";

// Heavy pages — code-split, loaded on demand
const ChatPage             = lazy(() => import("./pages/ChatPage").then(m => ({ default: m.ChatPage })));
const TariffCalculatorPage = lazy(() => import("./pages/TariffCalculatorPage").then(m => ({ default: m.TariffCalculatorPage })));
const DashboardPage        = lazy(() => import("./pages/DashboardPage").then(m => ({ default: m.DashboardPage })));
const HowItWorksPage       = lazy(() => import("./pages/HowItWorksPage").then(m => ({ default: m.HowItWorksPage })));
const ApiDocsPage          = lazy(() => import("./pages/ApiDocsPage").then(m => ({ default: m.ApiDocsPage })));
const NotFoundPage         = lazy(() => import("./pages/NotFoundPage").then(m => ({ default: m.NotFoundPage })));

function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex gap-1.5">
          {[0, 1, 2].map(i => (
            <div key={i} className="w-2 h-2 rounded-full bg-orange-500 animate-bounce"
              style={{ animationDelay: `${i * 150}ms` }} />
          ))}
        </div>
      </div>
    }>
      {children}
    </Suspense>
  );
}

export const router = createBrowserRouter([
  {
    path: "/",
    Component: RootLayout,
    children: [
      { index: true,          element: <HomePage /> },
      { path: "chat",         element: <PageShell><ChatPage /></PageShell> },
      { path: "calculator",   element: <PageShell><TariffCalculatorPage /></PageShell> },
      { path: "dashboard",    element: <PageShell><DashboardPage /></PageShell> },
      { path: "how-it-works", element: <PageShell><HowItWorksPage /></PageShell> },
      { path: "api-docs",     element: <PageShell><ApiDocsPage /></PageShell> },
      { path: "*",            element: <PageShell><NotFoundPage /></PageShell> },
    ],
  },
]);
