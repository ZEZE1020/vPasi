import { useState, useRef } from "react";

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
}: {
  onSend: (q: string) => void;
  disabled: boolean;
  isStreaming: boolean;
  onStop: () => void;
}) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = () => {
    if (value.trim() && !disabled) {
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
    <div className="chat-input-container">
      <div className="chat-input-wrapper">
        <textarea
          ref={textareaRef}
          className="chat-textarea"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onInput={handleInput}
          placeholder="Ask a trade research question..."
          disabled={disabled}
          rows={1}
        />
        {isStreaming ? (
          <button
            className="send-button stop-button"
            onClick={onStop}
            aria-label="Stop generation"
          >
            <StopIcon />
          </button>
        ) : (
          <button
            className="send-button"
            onClick={handleSubmit}
            disabled={!value.trim()}
            aria-label="Send message"
          >
            <SendIcon />
          </button>
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
