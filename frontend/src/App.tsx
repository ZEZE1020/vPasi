import ChatLayout from "./components/ChatLayout";
import LandingPage from "./components/LandingPage";

function App() {
  const path = window.location.pathname;

  if (path === "/" || path === "/index.html") {
    return <LandingPage />;
  }

  return <ChatLayout />;
}

export default App;
