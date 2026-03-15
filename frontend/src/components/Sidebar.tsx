import type { ChatSession } from "../types";

function PlusIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="8" y1="2" x2="8" y2="14" />
      <line x1="2" y1="8" x2="14" y2="8" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <polyline points="2 4 14 4" />
      <path d="M5 4V2h6v2" />
      <rect x="3" y="4" width="10" height="10" rx="1" />
    </svg>
  );
}

function ChatIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <path d="M14 10a2 2 0 0 1-2 2H5l-3 3V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v6z" />
    </svg>
  );
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - d.getTime()) / 86400000);
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function groupSessions(sessions: ChatSession[]) {
  const groups: Record<string, ChatSession[]> = {};
  for (const s of sessions) {
    const label = formatDate(s.createdAt);
    if (!groups[label]) groups[label] = [];
    groups[label].push(s);
  }
  return groups;
}

interface SidebarProps {
  sessions: ChatSession[];
  activeSessionId: string | null;
  onNewChat: () => void;
  onSelectSession: (id: string) => void;
  onDeleteSession: (id: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

function Sidebar({
  sessions,
  activeSessionId,
  onNewChat,
  onSelectSession,
  onDeleteSession,
  isOpen,
  onClose,
}: SidebarProps) {
  const groups = groupSessions(sessions);

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && <div className="sidebar-overlay" onClick={onClose} />}

      <aside className={`sidebar${isOpen ? " sidebar-open" : ""}`}>
        <div className="sidebar-header">
          <div className="sidebar-brand-row">
            <span className="sidebar-brand">vPasi</span>
            <button className="sidebar-close-btn" onClick={onClose} aria-label="Close sidebar">✕</button>
          </div>
          <button className="new-chat-btn" onClick={onNewChat}>
            <PlusIcon /> New Research
          </button>
        </div>

        <div className="session-list">
          {sessions.length === 0 && (
            <p className="session-empty">No previous research yet.</p>
          )}
          {Object.entries(groups).map(([label, group]) => (
            <div key={label} className="session-group">
              <div className="session-group-label">{label}</div>
              {group.map((session) => (
                <div
                  key={session.id}
                  className={`session-item${session.id === activeSessionId ? " session-item-active" : ""}`}
                  onClick={() => onSelectSession(session.id)}
                >
                  <ChatIcon />
                  <span className="session-title">{session.title}</span>
                  <button
                    className="session-delete-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteSession(session.id);
                    }}
                    aria-label="Delete session"
                  >
                    <TrashIcon />
                  </button>
                </div>
              ))}
            </div>
          ))}
        </div>

        <div className="sidebar-footer">
          <div className="sidebar-tagline">AI-powered trade intelligence</div>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
