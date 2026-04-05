import type { ChatMessage } from "../types";

function UserMessage({ message }: { message: ChatMessage }) {
  return (
    <div className="message message-user">
      <div className="message-content">
        <div className="message-bubble user-bubble">{message.content}</div>
        {message.normalizedContent && (
          <div className="flex justify-end mt-1">
            <span className="text-xs text-slate-400 bg-slate-100 border border-slate-200 rounded-full px-2.5 py-0.5">
              🌍 Translated · <span className="text-slate-600 italic">"{message.normalizedContent}"</span>
            </span>
          </div>
        )}
      </div>
      <div className="message-avatar user-avatar">U</div>
    </div>
  );
}

export default UserMessage;
