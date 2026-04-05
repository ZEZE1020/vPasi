import type { ChatMessage } from "../types";

function UserMessage({ message }: { message: ChatMessage }) {
  return (
    <div className="message message-user">
      <div className="message-content">
        <div className="message-bubble user-bubble">{message.content}</div>
      </div>
      <div className="message-avatar user-avatar">U</div>
    </div>
  );
}

export default UserMessage;
