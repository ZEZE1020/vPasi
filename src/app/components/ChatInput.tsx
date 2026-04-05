import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Button from "./Button";

function SendIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor">
      <path d="M2.5 16.5l14-7.5-14-7.5v5.5l10 2-10 2z" />
    </svg>
  );
}

function StopIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
      <rect x="3" y="3" width="10" height="10" rx="2" />
    </svg>
  );
}

function ChatInput({
  onSend,
  disabled,
  isStreaming,
  onStop,
  hasTriedAgent,
  setHasTriedAgent,
}: {
  onSend: (q: string) => void;
  disabled: boolean;
  isStreaming: boolean;
  onStop: () => void;
  hasTriedAgent?: boolean;
  setHasTriedAgent?: (val: boolean) => void;
}) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const navigate = useNavigate();

  const handleSubmit = () => {
    if (hasTriedAgent) {
      navigate("/dashboard?signup=true");
      return;
    }

    if (value.trim() && !disabled) {
      if (setHasTriedAgent) {
        setHasTriedAgent(true);
        localStorage.setItem("vpasi_has_tried_agent", "true");
      }
      onSend(value.trim());
      setValue("");
      if (textareaRef.current) textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleInput = () => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = "auto";
      el.style.height = Math.min(el.scrollHeight, 200) + "px";
    }
  };

  return (
    <div className="chat-input-container relative">
      {hasTriedAgent && (
        <div className="absolute -top-12 left-0 right-0 text-center">
          <p className="text-red-500 font-semibold bg-red-50 py-1 px-4 rounded-full inline-block border border-red-200 shadow-sm text-sm">
            You've used your free try. Please sign up to continue.
          </p>
        </div>
      )}
      <div className="chat-input-wrapper">
        <textarea
          ref={textareaRef}
          className="chat-textarea"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onInput={handleInput}
          placeholder={
            hasTriedAgent
              ? "Sign up to continue chatting..."
              : "Ask a trade research question..."
          }
          disabled={disabled}
          rows={1}
        />
        {isStreaming ? (
          <Button
            className="send-button stop-button cursor-pointer"
            onClick={onStop}
            aria-label="Stop generation"
          >
            <StopIcon />
          </Button>
        ) : (
          <Button
            className="send-button cursor-pointer"
            onClick={handleSubmit}
            disabled={!value.trim() && !hasTriedAgent}
            aria-label="Send message"
          >
            <SendIcon />
          </Button>
        )}
      </div>
      <p className="chat-disclaimer">
        vPasi can make mistakes. Verify important trade information
        independently.
      </p>
    </div>
  );
}

export default ChatInput;
