import { useState, useEffect } from "react";
import { useSessions } from "../hooks/useSessions";
import { useChat } from "../hooks/useChat";
import Sidebar from "./Sidebar";
import WelcomeScreen from "./WelcomeScreen";
import MessageList from "./MessageList";
import ChatInput from "./ChatInput";

function MenuIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="3" y1="5" x2="17" y2="5" />
      <line x1="3" y1="10" x2="17" y2="10" />
      <line x1="3" y1="15" x2="17" y2="15" />
    </svg>
  );
}

function ChatLayout() {
  const {
    sessions,
    activeSessionId,
    setActiveSessionId,
    activeMessages,
    setActiveMessages,
    createSession,
    deleteSession,
    updateSessionTitle,
  } = useSessions();

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { isStreaming, sendMessage, stopStreaming } = useChat({
    messages: activeMessages,
    setMessages: setActiveMessages,
    onTitled: updateSessionTitle,
  });

  const handleSend = async (query: string) => {
    let sid = activeSessionId;
    if (!sid) {
      sid = await createSession();
    }
    sendMessage(query, sid);
  };

  const handleSelectSession = (id: string) => {
    stopStreaming();
    setActiveSessionId(id);
    setSidebarOpen(false);
  };

  const handleNewChat = () => {
    stopStreaming();
    setActiveSessionId(null);
    setSidebarOpen(false);
  };

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 769px)");
    const handler = (e: MediaQueryListEvent) => { if (e.matches) setSidebarOpen(false); };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  return (
    <div className="chat-layout">
      <Sidebar
        sessions={sessions}
        activeSessionId={activeSessionId}
        onNewChat={handleNewChat}
        onSelectSession={handleSelectSession}
        onDeleteSession={deleteSession}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <main className="chat-main">
        <div className="mobile-header">
          <button className="mobile-menu-btn" onClick={() => setSidebarOpen(true)} aria-label="Open sidebar">
            <MenuIcon />
          </button>
          <span className="mobile-title">vPasi</span>
        </div>

        {activeMessages.length === 0 ? (
          <WelcomeScreen onSuggestionClick={handleSend} />
        ) : (
          <MessageList messages={activeMessages} />
        )}

        <ChatInput
          onSend={handleSend}
          disabled={isStreaming}
          isStreaming={isStreaming}
          onStop={stopStreaming}
        />
      </main>
    </div>
  );
}

export default ChatLayout;
