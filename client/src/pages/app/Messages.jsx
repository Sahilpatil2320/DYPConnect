import { useState } from "react";
import "./Messages.css";

function Messages() {
  const conversations = [
    {
      id: 1,
      initials: "AD",
      name: "Prof. Anjali Deshmukh",
      lastMessage: "Sure, I'll share the workshop details by tomorrow.",
      time: "2h",
      unread: true,
      messages: [
        { id: 1, from: "them", text: "Hi Sahil, are you attending the AI/ML workshop next week?", time: "10:02 AM" },
        { id: 2, from: "me", text: "Yes ma'am, definitely! Do I need to register separately?", time: "10:05 AM" },
        { id: 3, from: "them", text: "Sure, I'll share the workshop details by tomorrow.", time: "10:07 AM" },
      ],
    },
    {
      id: 2,
      initials: "RS",
      name: "Rohan Shinde",
      lastMessage: "Happy to help — send me your resume whenever ready.",
      time: "5h",
      unread: false,
      messages: [
        { id: 1, from: "me", text: "Hi Rohan! Saw your post about mentoring — would love some guidance on software roles.", time: "9:10 AM" },
        { id: 2, from: "them", text: "Of course! Happy to help — send me your resume whenever ready.", time: "9:45 AM" },
      ],
    },
    {
      id: 3,
      initials: "PK",
      name: "Priya Kulkarni",
      lastMessage: "Thanks for connecting!",
      time: "1d",
      unread: false,
      messages: [
        { id: 1, from: "them", text: "Thanks for connecting!", time: "Yesterday" },
      ],
    },
  ];

  const [activeId, setActiveId] = useState(conversations[0].id);
  const [draft, setDraft] = useState("");

  const activeConversation = conversations.find((c) => c.id === activeId);

  const handleSend = (e) => {
    e.preventDefault();
    if (!draft.trim()) return;
    console.log("Sending message:", draft, "to", activeConversation.name);
    setDraft("");
    // Real sending comes once backend + real-time (Socket.io) is built
  };

  return (
    <div className="messages-page">
      <div className="messages-container">
        <aside className="conversation-list">
          <h4 className="sidebar-heading">Messaging</h4>
          {conversations.map((conv) => (
            <button
              key={conv.id}
              className={`conversation-item ${activeId === conv.id ? "conversation-item-active" : ""}`}
              onClick={() => setActiveId(conv.id)}
            >
              <div className="post-avatar-small">{conv.initials}</div>
              <div className="conversation-info">
                <p className="conversation-name">
                  {conv.name}
                  {conv.unread && <span className="unread-dot"></span>}
                </p>
                <p className="conversation-preview">{conv.lastMessage}</p>
              </div>
              <span className="conversation-time">{conv.time}</span>
            </button>
          ))}
        </aside>

        <main className="chat-window">
          <div className="chat-header">
            <div className="post-avatar-small">{activeConversation.initials}</div>
            <p className="chat-header-name">{activeConversation.name}</p>
          </div>

          <div className="chat-messages">
            {activeConversation.messages.map((msg) => (
              <div
                key={msg.id}
                className={`chat-bubble-row ${msg.from === "me" ? "chat-bubble-row-me" : ""}`}
              >
                <div className={`chat-bubble ${msg.from === "me" ? "chat-bubble-me" : "chat-bubble-them"}`}>
                  <p>{msg.text}</p>
                  <span className="chat-bubble-time">{msg.time}</span>
                </div>
              </div>
            ))}
          </div>

          <form className="chat-input-bar" onSubmit={handleSend}>
            <input
              type="text"
              placeholder={`Message ${activeConversation.name}...`}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
            />
            <button type="submit" className="chat-send-btn" aria-label="Send message">
              <i className="ti ti-send" aria-hidden="true"></i>
            </button>
          </form>
        </main>
      </div>
    </div>
  );
}

export default Messages;