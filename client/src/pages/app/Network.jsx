import { useState, useEffect } from "react";
import api from "../../utils/api";
import { getInitials } from "../../utils/getInitials";
import "./Network.css";
import { useNavigate } from "react-router-dom";

function Network() {
    const [activeTab, setActiveTab] = useState("grow");
    const navigate = useNavigate();

    const handleMessage = async (userId) => {
        try {
            const res = await api.post("/chat/conversations", { recipientId: userId });
            navigate("/messages", { state: { conversationId: res.data._id } });
        } catch (err) {
            console.error("Failed to start conversation:", err);
        }
    };

    const [suggestions, setSuggestions] = useState([]);
    const [invitations, setInvitations] = useState([]);
    const [connections, setConnections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sentIds, setSentIds] = useState([]);
    const [recentActivity, setRecentActivity] = useState([]);
    const [dismissedActivity, setDismissedActivity] = useState([]);
    const [showAllActivity, setShowAllActivity] = useState(false);

    const roleLabels = { student: "Student", teacher: "Teacher", alumni: "Alumni" };

    const roleInfo = (person) => {
        const label = roleLabels[person.role] || person.role;
        if (person.role === "student") return `${label}, ${person.department || ""}`;
        if (person.role === "teacher") return `${label} · ${person.designation || ""}`;
        if (person.role === "alumni") return `${label} · ${person.currentCompany || ""}`;
        return label;
    };

    const loadAll = async () => {
        setLoading(true);
        try {
            const [suggestionsRes, invitationsRes, connectionsRes, activityRes] = await Promise.all([
                api.get("/users/suggestions"),
                api.get("/connections/invitations"),
                api.get("/connections"),
                api.get("/connections/recent-activity"),
            ]);
            setSuggestions(suggestionsRes.data);
            setInvitations(invitationsRes.data);
            setConnections(connectionsRes.data);
            setRecentActivity(activityRes.data);
        } catch (err) {
            console.error("Failed to load network data:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadAll();
    }, []);

    const handleConnect = async (recipientId) => {
        try {
            await api.post("/connections", { recipientId });
            setSentIds([...sentIds, recipientId]);
        } catch (err) {
            console.error("Failed to send request:", err);
        }
    };

    const handleDismiss = (id) => {
        setSuggestions(suggestions.filter((s) => s._id !== id));
    };

    const handleRespond = async (connectionId, action) => {
        try {
            await api.put(`/connections/${connectionId}/respond`, { action });
            setInvitations(invitations.filter((inv) => inv._id !== connectionId));
            if (action === "accept") loadAll();
        } catch (err) {
            console.error("Failed to respond to invitation:", err);
        }
    };

    const stats = [
        { label: "Connections", count: connections.length, icon: "ti-users" },
        { label: "Invitations", count: invitations.length, icon: "ti-user-plus" },
    ];

    return (
        <div className="network-page">
            <div className="network-grid">
                <aside className="network-sidebar">
                    <h4 className="sidebar-heading">Manage My Network</h4>
                    <ul className="network-stat-list">
                        {stats.map((stat) => (
                            <li key={stat.label} className="network-stat-item">
                                <i className={`ti ${stat.icon}`} aria-hidden="true"></i>
                                <span className="network-stat-label">{stat.label}</span>
                                <span className="network-stat-count">{stat.count}</span>
                            </li>
                        ))}
                    </ul>
                </aside>

                <main className="network-main">
                    <div className="network-tabs">
                        <button
                            className={`network-tab ${activeTab === "grow" ? "network-tab-active" : ""}`}
                            onClick={() => setActiveTab("grow")}
                        >
                            Grow
                        </button>
                        <button
                            className={`network-tab ${activeTab === "catchup" ? "network-tab-active" : ""}`}
                            onClick={() => setActiveTab("catchup")}
                        >
                            Catch Up
                        </button>
                    </div>

                    {loading && <p className="catchup-empty">Loading...</p>}

                    {!loading && activeTab === "grow" && (
                        <>
                            {invitations.length > 0 ? (
                                <div className="invitations-card">
                                    <h4 className="sidebar-heading">Invitations ({invitations.length})</h4>
                                    <div className="invitation-list">
                                        {invitations.map((inv) => (
                                            <div className="invitation-item" key={inv._id}>
                                                <div className="suggestion-avatar">{getInitials(inv.requester.fullName)}</div>
                                                <div className="invitation-info">
                                                    <p className="suggestion-tile-name">{inv.requester.fullName}</p>
                                                    <p className="suggestion-tile-role">{roleInfo(inv.requester)}</p>
                                                </div>
                                                <div className="invitation-actions">
                                                    <button className="invite-ignore" onClick={() => handleRespond(inv._id, "reject")}>
                                                        Ignore
                                                    </button>
                                                    <button className="invite-accept" onClick={() => handleRespond(inv._id, "accept")}>
                                                        Accept
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="invite-card">
                                    <span>No pending invitations</span>
                                </div>
                            )}

                            {(() => {
                                const visibleActivity = recentActivity.filter(
                                    (a) => !dismissedActivity.includes(a._id)
                                );
                                if (visibleActivity.length === 0) return null;

                                const [first, ...rest] = visibleActivity;
                                const itemsToShow = showAllActivity ? visibleActivity : [first];

                                const handleDismiss = (id) => setDismissedActivity([...dismissedActivity, id]);

                                return (
                                    <div className="invitations-card">
                                        <h4 className="sidebar-heading">Recent Activity</h4>
                                        <div className="activity-list">
                                            {!showAllActivity && (
                                                <div className="activity-item">
                                                    <div className="suggestion-avatar">{getInitials(first.recipient.fullName)}</div>
                                                    <p className="activity-line">
                                                        <strong>{first.recipient.fullName}</strong>
                                                        {rest.length > 0 && (
                                                            <>
                                                                {" "}and{" "}
                                                                <button className="activity-others-link" onClick={() => setShowAllActivity(true)}>
                                                                    {rest.length} other{rest.length > 1 ? "s" : ""}
                                                                </button>
                                                            </>
                                                        )}
                                                        {" "}accepted your connection request{rest.length > 0 ? "s" : ""} —{" "}
                                                        <button className="activity-message-link" onClick={() => handleMessage(first.recipient._id)}>
                                                            message
                                                        </button>
                                                    </p>
                                                    <button
                                                        className="activity-dismiss"
                                                        onClick={() => handleDismiss(first._id)}
                                                        aria-label="Dismiss"
                                                    >
                                                        <i className="ti ti-x" aria-hidden="true"></i>
                                                    </button>
                                                </div>
                                            )}

                                            {showAllActivity &&
                                                itemsToShow.map((activity) => (
                                                    <div className="activity-item" key={activity._id}>
                                                        <div className="suggestion-avatar">{getInitials(activity.recipient.fullName)}</div>
                                                        <p className="activity-line">
                                                            <strong>{activity.recipient.fullName}</strong> accepted your connection request —{" "}
                                                            <button className="activity-message-link" onClick={() => handleMessage(activity.recipient._id)}>
                                                                message
                                                            </button>
                                                        </p>
                                                        <button
                                                            className="activity-dismiss"
                                                            onClick={() => handleDismiss(activity._id)}
                                                            aria-label="Dismiss"
                                                        >
                                                            <i className="ti ti-x" aria-hidden="true"></i>
                                                        </button>
                                                    </div>
                                                ))}
                                        </div>
                                    </div>
                                );
                            })()}

                            <div className="suggestions-card">
                                <h4 className="sidebar-heading">People You May Know</h4>
                                <div className="suggestions-grid">
                                    {suggestions.map((person) => (
                                        <div className="suggestion-tile" key={person._id}>
                                            <button
                                                className="suggestion-dismiss"
                                                onClick={() => handleDismiss(person._id)}
                                                aria-label={`Dismiss ${person.fullName}`}
                                            >
                                                <i className="ti ti-x" aria-hidden="true"></i>
                                            </button>
                                            <div className="suggestion-avatar">{getInitials(person.fullName)}</div>
                                            <p className="suggestion-tile-name">{person.fullName}</p>
                                            <p className="suggestion-tile-role">{roleInfo(person)}</p>
                                            {sentIds.includes(person._id) ? (
                                                <button className="suggestion-tile-btn suggestion-tile-btn-pending" disabled>
                                                    Pending
                                                </button>
                                            ) : (
                                                <button className="suggestion-tile-btn" onClick={() => handleConnect(person._id)}>
                                                    Connect
                                                </button>
                                            )}
                                        </div>
                                    ))}

                                    {suggestions.length === 0 && (
                                        <p className="catchup-empty">No suggestions right now — you're connected with everyone available!</p>
                                    )}
                                </div>
                            </div>
                        </>
                    )}

                    {!loading && activeTab === "catchup" && (
                        <div className="suggestions-card">
                            {connections.length > 0 ? (
                                <div className="suggestions-grid">
                                    {connections.map((person) => (
                                        <div className="suggestion-tile" key={person._id}>
                                            <div className="suggestion-avatar">{getInitials(person.fullName)}</div>
                                            <p className="suggestion-tile-name">{person.fullName}</p>
                                            <p className="suggestion-tile-role">{roleInfo(person)}</p>
                                            <button className="suggestion-tile-btn" onClick={() => handleMessage(person._id)}>
                                                Message
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="catchup-empty">No connections yet. Start connecting with people in Grow!</p>
                            )}
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}

export default Network;