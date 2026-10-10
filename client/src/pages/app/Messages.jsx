import { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import api from "../../utils/api";
import { getCurrentUser } from "../../utils/auth";
import { getInitials } from "../../utils/getInitials";
import socket from "../../utils/socket";
import "./Messages.css";

function Messages() {
	const currentUser = getCurrentUser();
	const location = useLocation();
	const requestedConversationId = location.state?.conversationId;

	const [conversations, setConversations] = useState([]);
	const [activeConversation, setActiveConversation] = useState(null);
	const [messages, setMessages] = useState([]);
	const [draft, setDraft] = useState("");
	const [loading, setLoading] = useState(true);
	const [typingInfo, setTypingInfo] = useState(null);
	const [showChatOnMobile, setShowChatOnMobile] = useState(!!requestedConversationId);

	// A ref always holds the CURRENT open chat, even inside long-lived socket handlers
	const activeIdRef = useRef(null);
	const typingClearRef = useRef(null);
	const lastTypingEmitRef = useRef(0);
	const messagesEndRef = useRef(null);

	const getOtherParticipant = (conv) =>
		conv.participants.find((p) => p._id !== currentUser._id);

	const refreshConversations = async () => {
		try {
			const res = await api.get("/chat/conversations");
			setConversations(res.data);
			return res.data;
		} catch (err) {
			console.error("Failed to load conversations:", err);
			return [];
		}
	};

	const selectConversation = async (conv) => {
		activeIdRef.current = conv._id;
		setActiveConversation(conv);
		setMessages([]);
		try {
			const res = await api.get(`/chat/messages/${conv._id}`);
			if (activeIdRef.current === conv._id) setMessages(res.data);
			window.dispatchEvent(new Event("badgesUpdated"));
		} catch (err) {
			console.error("Failed to load messages:", err);
		}
	};

	// Load the conversation list once and open the right chat
	useEffect(() => {
		const init = async () => {
			const list = await refreshConversations();
			const target = list.find((c) => c._id === requestedConversationId) || list[0];
			if (target) await selectConversation(target);
			setLoading(false);
		};
		init();
	}, []);

	// Live updates
	useEffect(() => {
		socket.connect();

		const handleNewMessage = (message) => {
			const fromMe = message.sender._id === currentUser._id;
			const isOpenChat = activeIdRef.current === message.conversation;

			if (isOpenChat) {
				setMessages((prev) =>
					prev.some((m) => m._id === message._id) ? prev : [...prev, message]
				);
				if (!fromMe) {
					socket.emit("markRead", { conversationId: message.conversation }, () => {
						window.dispatchEvent(new Event("badgesUpdated"));
					});
				}
			} else if (!fromMe) {
				window.dispatchEvent(new Event("badgesUpdated"));
			}

			refreshConversations();
		};

		const handleUserTyping = ({ conversationId, userName }) => {
			setTypingInfo({ conversationId, userName });
			clearTimeout(typingClearRef.current);
			typingClearRef.current = setTimeout(() => setTypingInfo(null), 2000);
		};

		socket.on("newMessage", handleNewMessage);
		socket.on("userTyping", handleUserTyping);

		return () => {
			socket.off("newMessage", handleNewMessage);
			socket.off("userTyping", handleUserTyping);
			clearTimeout(typingClearRef.current);
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
			text: draft.trim(),
		});

		setDraft("");
	};

	const handleDraftChange = (e) => {
		setDraft(e.target.value);
		if (!activeConversation) return;

		const now = Date.now();
		if (now - lastTypingEmitRef.current < 1500) return;
		lastTypingEmitRef.current = now;
		socket.emit("typing", { conversationId: activeConversation._id });
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
				<aside className={`conversation-list ${showChatOnMobile ? "mobile-hidden" : ""}`}>					<h4 className="sidebar-heading">Messaging</h4>

					{conversations.length === 0 && (
						<p className="notifications-empty">
							No conversations yet. Connect with someone first, then start a chat from My Network.
						</p>
					)}

					{conversations.map((conv) => {
						const other = getOtherParticipant(conv);
						return (
							<button
								key={conv._id}
								className={`conversation-item ${activeConversation?._id === conv._id ? "conversation-item-active" : ""}`}
								onClick={() => {
									selectConversation(conv);
									setShowChatOnMobile(true);
								}}
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

				<main className={`chat-window ${showChatOnMobile ? "" : "mobile-hidden"}`}>
					{activeConversation ? (
						<>
							<div className="chat-header">
								<button
									className="chat-back-btn"
									onClick={() => setShowChatOnMobile(false)}
									aria-label="Back to conversations"
								>
									<i className="ti ti-arrow-left" aria-hidden="true"></i>
								</button>
								<div className="post-avatar-small">
									{getInitials(getOtherParticipant(activeConversation)?.fullName)}
								</div>
								<p className="chat-header-name">
									{getOtherParticipant(activeConversation)?.fullName}
								</p>
							</div>

							<div className="chat-messages">
								{messages.map((msg) => {
									const senderId = msg.sender._id || msg.sender;
									const isMe = senderId === currentUser._id;
									return (
										<div key={msg._id} className={`chat-bubble-row ${isMe ? "chat-bubble-row-me" : ""}`}>
											<div className={`chat-bubble ${isMe ? "chat-bubble-me" : "chat-bubble-them"}`}>
												<p>{msg.text}</p>
												<span className="chat-bubble-time">{formatTime(msg.createdAt)}</span>
											</div>
										</div>
									);
								})}
								{typingInfo && typingInfo.conversationId === activeConversation._id && (
									<p className="typing-indicator">{typingInfo.userName} is typing...</p>
								)}
								<div ref={messagesEndRef}></div>
							</div>

							<form className="chat-input-bar" onSubmit={handleSend}>
								<input
									type="text"
									placeholder={`Message ${getOtherParticipant(activeConversation)?.fullName}...`}
									value={draft}
									onChange={handleDraftChange}
									maxLength={2000}
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