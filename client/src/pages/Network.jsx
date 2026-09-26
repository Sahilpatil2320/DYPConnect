import { useState } from "react";
import "./Network.css";

function Network() {
    const [activeTab, setActiveTab] = useState("grow");

    const stats = [
        { label: "Connections", count: 128, icon: "ti-users" },
        { label: "Groups", count: 3, icon: "ti-users-group" },
        { label: "Events", count: 2, icon: "ti-calendar-event" },
        { label: "Departments", count: 6, icon: "ti-building" },
    ];

    const [invitations, setInvitations] = useState([
        { id: 101, initials: "OR", name: "Om Raut", role: "Student, Electronics Engineering", mutual: 5 },
        { id: 102, initials: "KP", name: "Kavya Pawar", role: "Alumni · UX Designer", mutual: 9 },
    ]);

    const handleAccept = (id) => {
        setInvitations(invitations.filter((inv) => inv.id !== id));
    };

    const handleIgnore = (id) => {
        setInvitations(invitations.filter((inv) => inv.id !== id));
    };

    const suggestions = [
        { id: 1, initials: "PK", name: "Priya Kulkarni", role: "Student, Mechanical Engg.", mutual: 4 },
        { id: 2, initials: "VJ", name: "Vikram Joshi", role: "Alumni · Product Manager", mutual: 12 },
        { id: 3, initials: "SR", name: "Sneha Raut", role: "Student, Computer Science", mutual: 7 },
        { id: 4, initials: "AK", name: "Aditya Kadam", role: "Alumni · Data Analyst", mutual: 3 },
        { id: 5, initials: "MN", name: "Mrunal Naik", role: "Student, Electronics", mutual: 9 },
        { id: 6, initials: "RT", name: "Rutuja Thorat", role: "Faculty, Civil Engineering", mutual: 2 },
    ];

    const [connectedIds, setConnectedIds] = useState([]);
    const [dismissedIds, setDismissedIds] = useState([]);

    const handleConnect = (id) => {
        setConnectedIds([...connectedIds, id]);
    };

    const handleDismiss = (id) => {
        setDismissedIds([...dismissedIds, id]);
    };

    const visibleSuggestions = suggestions.filter((s) => !dismissedIds.includes(s.id));

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

                    {activeTab === "grow" && (
                        <>
                            {invitations.length > 0 ? (
                                <div className="invitations-card">
                                    <h4 className="sidebar-heading">Invitations ({invitations.length})</h4>
                                    <div className="invitation-list">
                                        {invitations.map((inv) => (
                                            <div className="invitation-item" key={inv.id}>
                                                <div className="suggestion-avatar">{inv.initials}</div>
                                                <div className="invitation-info">
                                                    <p className="suggestion-tile-name">{inv.name}</p>
                                                    <p className="suggestion-tile-role">{inv.role}</p>
                                                    <p className="suggestion-tile-mutual">{inv.mutual} mutual connections</p>
                                                </div>
                                                <div className="invitation-actions">
                                                    <button className="invite-ignore" onClick={() => handleIgnore(inv.id)}>
                                                        Ignore
                                                    </button>
                                                    <button className="invite-accept" onClick={() => handleAccept(inv.id)}>
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

                            <div className="suggestions-card">
                                <h4 className="sidebar-heading">People You May Know</h4>
                                <div className="suggestions-grid">
                                    {visibleSuggestions.map((person) => (
                                        <div className="suggestion-tile" key={person.id}>
                                            <button
                                                className="suggestion-dismiss"
                                                onClick={() => handleDismiss(person.id)}
                                                aria-label={`Dismiss ${person.name}`}
                                            >
                                                <i className="ti ti-x" aria-hidden="true"></i>
                                            </button>
                                            <div className="suggestion-avatar">{person.initials}</div>
                                            <p className="suggestion-tile-name">{person.name}</p>
                                            <p className="suggestion-tile-role">{person.role}</p>
                                            <p className="suggestion-tile-mutual">{person.mutual} mutual connections</p>
                                            {connectedIds.includes(person.id) ? (
                                                <button className="suggestion-tile-btn suggestion-tile-btn-pending" disabled>
                                                    Pending
                                                </button>
                                            ) : (
                                                <button
                                                    className="suggestion-tile-btn"
                                                    onClick={() => handleConnect(person.id)}
                                                >
                                                    Connect
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}

                    {activeTab === "catchup" && (
                        <div className="suggestions-card">
                            <p className="catchup-empty">No recent activity from your connections yet.</p>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}

export default Network;