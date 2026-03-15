import { useChat } from "../hooks/useChat";
import Sidebar from "./Sidebar";
import WelcomeScreen from "./WelcomeScreen";
import MessageList from "./MessageList";
import ChatInput from "./ChatInput";

function ChatLayout() {
  const { messages, isStreaming, sendMessage, clearChat } = useChat();

  return (
    <div className="chat-layout">
      <Sidebar onNewChat={clearChat} />
      <main className="chat-main">
        {messages.length === 0 ? (
          <WelcomeScreen onSuggestionClick={sendMessage} />
        ) : (
          <MessageList messages={messages} />
        )}
        <ChatInput onSend={sendMessage} disabled={isStreaming} />
      </main>
    </div>
  );
}

export default ChatLayout;
