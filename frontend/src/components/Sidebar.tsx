function PlusIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <line x1="8" y1="2" x2="8" y2="14" />
      <line x1="2" y1="8" x2="14" y2="8" />
    </svg>
  );
}

function Sidebar({ onNewChat }: { onNewChat: () => void }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <button className="new-chat-btn" onClick={onNewChat}>
          <PlusIcon /> New Research
        </button>
      </div>
      <div className="sidebar-footer">
        <div className="sidebar-brand">vPasi</div>
        <div className="sidebar-tagline">AI-powered trade intelligence</div>
      </div>
    </aside>
  );
}

export default Sidebar;
