import type { ChatMessage } from "../types";
import ThinkingSection from "./ThinkingSection";
import Citations from "./Citations";
import ReactMarkdown from "react-markdown";

function VPasiIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 2L2 7l10 5 10-5-10-5z" />
      <path d="M2 17l10 5 10-5" />
      <path d="M2 12l10 5 10-5" />
    </svg>
  );
}

function AssistantMessage({ message }: { message: ChatMessage }) {
  return (
    <div className="message message-assistant">
      <div className="message-avatar assistant-avatar">
        <VPasiIcon />
      </div>
      <div className="message-content">
        {(message.isStreaming ||
          (message.thinkingSteps && message.thinkingSteps.length > 0)) && (
          <ThinkingSection
            steps={message.thinkingSteps || []}
            isStreaming={message.isStreaming || false}
            status={message.status || "complete"}
          />
        )}

        {message.content && (
          <div className="message-bubble assistant-bubble">
            <div className="markdown-content">
              <ReactMarkdown>{message.content}</ReactMarkdown>
            </div>
          </div>
        )}

        {message.isStreaming && !message.content && (
          <div className="message-bubble assistant-bubble">
            <div className="streaming-dots">
              <span />
              <span />
              <span />
            </div>
          </div>
        )}

        {message.citations &&
          message.citations.length > 0 &&
          !message.isStreaming && <Citations citations={message.citations} />}

        {message.status === "error" && message.error && (
          <div className="message-error">{message.error}</div>
        )}
      </div>
    </div>
  );
}

export default AssistantMessage;
