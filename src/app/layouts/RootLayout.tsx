import { Outlet, useLocation } from "react-router-dom";
import { Navigation } from "../components/Navigation";
import { Footer } from "../components/Footer";

export function RootLayout() {
  const location = useLocation();
  const isChat = location.pathname === "/chat";

  if (isChat) {
    return (
      <div className="flex flex-col h-screen overflow-hidden">
        <Navigation />
        <div className="flex-1 min-h-0">
          <Outlet />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navigation />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
