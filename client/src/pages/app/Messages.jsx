import { useState, useEffect, useRef } from "react";
import api from "../../utils/api";
import { getCurrentUser } from "../../utils/auth";
import { getInitials } from "../../utils/getInitials";
import socket from "../../utils/socket";
import "./Messages.css";

function Messages() {
	const currentUser = getCurrentUser();
	const [conversations, setConversations] = useState([]);
	const [activeConversation, setActiveConversation] = useState(null);
	const [messages, setMessages] = useState([]);
	const [draft, setDraft] = useState("");
	const [loading, setLoading] = useState(true);
	const [typingUser, setTypingUser] = useState("");
	const typingTimeoutRef = useRef(null);
	const messagesEndRef = useRef(null);

	const getOtherParticipant = (conv) =>
		conv.participants.find((p) => p._id !== currentUser._id);

	const loadConversations = async () => {
		setLoading(true);
		try {
			const res = await api.get("/chat/conversations");
			setConversations(res.data);
			if (res.data.length > 0 && !activeConversation) {
				selectConversation(res.data[0]);
			}
		} catch (err) {
			console.error("Failed to load conversations:", err);
		} finally {
			setLoading(false);
		}
	};

	const selectConversation = async (conv) => {
		setActiveConversation(conv);
		socket.emit("joinConversation", conv._id);
		try {
			const res = await api.get(`/chat/messages/${conv._id}`);
			setMessages(res.data);
		} catch (err) {
			console.error("Failed to load messages:", err);
		}
	};

	useEffect(() => {
		socket.connect();
		socket.emit("register", currentUser._id);

		socket.on("newMessage", (message) => {
			setMessages((prev) => {
				if (activeConversation && message.conversation === activeConversation._id) {
					return [...prev, message];
				}
				return prev;
			});
			loadConversations();
		});

		socket.on("userTyping", (userName) => {
			setTypingUser(userName);
			setTimeout(() => setTypingUser(""), 2000);
		});

		loadConversations();

		return () => {
			socket.off("newMessage");
			socket.off("userTyping");
			socket.disconnect();
		};
	}, []);

	useEffect(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [messages]);

	const handleSend = (e) => {
		e.preventDefault();
		if (!draft.trim() || !activeConversation) return;

		socket.emit("sendMessage", {
			conversationId: activeConversation._id,
			text: draft,
			senderId: currentUser._id,
		});

		setDraft("");
	};

	const handleTyping = () => {
		if (!activeConversation) return;
		socket.emit("typing", {
			conversationId: activeConversation._id,
			userName: currentUser.fullName,
		});
	};

	const formatTime = (dateStr) => {
		return new Date(dateStr).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
	};

	if (loading) {
		return (
			<div className="messages-page">
				<div className="messages-container">
					<p className="notifications-empty">Loading conversations...</p>
				</div>
			</div>
		);
	}

	return (
		<div className="messages-page">
			<div className="messages-container">
				<aside className="conversation-list">
					<h4 className="sidebar-heading">Messaging</h4>

					{conversations.length === 0 && (
						<p className="notifications-empty">
							No conversations yet. Connect with someone first, then start a chat from their profile.
						</p>
					)}

					{conversations.map((conv) => {
						const other = getOtherParticipant(conv);
						return (
							<button
								key={conv._id}
								className={`conversation-item ${activeConversation?._id === conv._id ? "conversation-item-active" : ""}`}
								onClick={() => selectConversation(conv)}
							>
								<div className="post-avatar-small">{getInitials(other?.fullName)}</div>
								<div className="conversation-info">
									<p className="conversation-name">{other?.fullName || "Unknown"}</p>
									<p className="conversation-preview">{conv.lastMessage || "No messages yet"}</p>
								</div>
							</button>
						);
					})}
				</aside>

				<main className="chat-window">
					{activeConversation ? (
						<>
							<div className="chat-header">
								<div className="post-avatar-small">
									{getInitials(getOtherParticipant(activeConversation)?.fullName)}
								</div>
								<p className="chat-header-name">
									{getOtherParticipant(activeConversation)?.fullName}
								</p>
							</div>

							<div className="chat-messages">
								{messages.map((msg) => {
									const isMe = msg.sender._id === currentUser._id || msg.sender === currentUser._id;
									return (
										<div key={msg._id} className={`chat-bubble-row ${isMe ? "chat-bubble-row-me" : ""}`}>
											<div className={`chat-bubble ${isMe ? "chat-bubble-me" : "chat-bubble-them"}`}>
												<p>{msg.text}</p>
												<span className="chat-bubble-time">{formatTime(msg.createdAt)}</span>
											</div>
										</div>
									);
								})}
								{typingUser && <p className="typing-indicator">{typingUser} is typing...</p>}
								<div ref={messagesEndRef}></div>
							</div>

							<form className="chat-input-bar" onSubmit={handleSend}>
								<input
									type="text"
									placeholder={`Message ${getOtherParticipant(activeConversation)?.fullName}...`}
									value={draft}
									onChange={(e) => {
										setDraft(e.target.value);
										handleTyping();
									}}
								/>
								<button type="submit" className="chat-send-btn" aria-label="Send message">
									<i className="ti ti-send" aria-hidden="true"></i>
								</button>
							</form>
						</>
					) : (
						<div className="chat-empty-state">
							<p>Select a conversation to start chatting</p>
						</div>
					)}
				</main>
			</div>
		</div>
	);
}

export default Messages;