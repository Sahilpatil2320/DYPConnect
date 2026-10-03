import { useState, useEffect } from "react";
import api from "../../utils/api";
import { getCurrentUser } from "../../utils/auth";
import "./Opportunities.css";

function Opportunities() {
    const currentUser = getCurrentUser();
    const [activeFilter, setActiveFilter] = useState("all");
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showPostModal, setShowPostModal] = useState(false);
    const [posting, setPosting] = useState(false);

    const [form, setForm] = useState({
        type: "internship",
        title: "",
        org: "",
        location: "",
        description: "",
        deadline: "",
        applicationLink: "",
    });

    const filters = [
        { id: "all", label: "All" },
        { id: "internship", label: "Internships" },
        { id: "job", label: "Jobs" },
        { id: "workshop", label: "Workshops" },
        { id: "event", label: "Events" },
    ];

    const fetchListings = async () => {
        setLoading(true);
        try {
            const res = await api.get("/opportunities");
            setListings(res.data);
        } catch (err) {
            console.error("Failed to load opportunities:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchListings();
    }, []);

    const filteredListings =
        activeFilter === "all" ? listings : listings.filter((item) => item.type === activeFilter);

    const handleFormChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handlePostSubmit = async (e) => {
        e.preventDefault();
        setPosting(true);
        try {
            const res = await api.post("/opportunities", form);
            setListings([res.data, ...listings]);
            setShowPostModal(false);
            setForm({
                type: "internship",
                title: "",
                org: "",
                location: "",
                description: "",
                deadline: "",
                applicationLink: "",
            });
        } catch (err) {
            console.error("Failed to post opportunity:", err);
        } finally {
            setPosting(false);
        }
    };

    const handleApply = async (item) => {
        if (item.applicationLink) {
            window.open(item.applicationLink, "_blank", "noopener,noreferrer");
        }

        const alreadyApplied = item.applicants.includes(currentUser._id);
        if (alreadyApplied) return;

        try {
            const res = await api.post(`/opportunities/${item._id}/apply`);
            setListings(
                listings.map((l) =>
                    l._id === item._id ? { ...l, applicants: res.data.applicants } : l
                )
            );
        } catch (err) {
            console.error("Failed to apply:", err);
        }
    };

    return (
        <div className="opportunities-page">
            <div className="opportunities-container">
                <div className="opportunities-top">
                    <div>
                        <h1 className="opportunities-heading">Opportunities</h1>
                        <p className="opportunities-subheading">
                            Internships, jobs, workshops and events shared by your college network
                        </p>
                    </div>
                    <button className="opportunities-post-btn" onClick={() => setShowPostModal(true)}>
                        <i className="ti ti-plus" aria-hidden="true"></i>
                        Post an Opportunity
                    </button>
                </div>

                <div className="opportunities-filters">
                    {filters.map((f) => (
                        <button
                            key={f.id}
                            className={`filter-chip ${activeFilter === f.id ? "filter-chip-active" : ""}`}
                            onClick={() => setActiveFilter(f.id)}
                        >
                            {f.label}
                        </button>
                    ))}
                </div>

                {loading && <p className="opportunities-empty">Loading opportunities...</p>}

                <div className="opportunities-list">
                    {!loading &&
                        filteredListings.map((item) => {
                            const hasApplied = item.applicants.includes(currentUser._id);
                            const actionLabel = item.type === "job" || item.type === "internship" ? "Apply" : "Register";

                            return (
                                <div className="opportunity-card" key={item._id}>
                                    <div className="opportunity-header">
                                        <span className={`opportunity-tag opportunity-tag-${item.type}`}>
                                            {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                                        </span>
                                        {item.deadline && <span className="opportunity-deadline">{item.deadline}</span>}
                                    </div>
                                    <h3 className="opportunity-title">{item.title}</h3>
                                    <p className="opportunity-org">
                                        {item.org}{item.location ? ` · ${item.location}` : ""}
                                    </p>
                                    <p className="opportunity-desc">{item.description}</p>
                                    <div className="opportunity-footer">
                                        <span className="opportunity-postedby">
                                            Posted by {item.postedBy?.fullName || "Unknown"}
                                        </span>
                                        {hasApplied ? (
                                            <button className="opportunity-apply opportunity-applied" disabled>
                                                <i className="ti ti-check" aria-hidden="true"></i>
                                                {actionLabel === "Apply" ? "Applied" : "Registered"}
                                            </button>
                                        ) : (
                                            <button className="opportunity-apply" onClick={() => handleApply(item)}>
                                                {item.applicationLink && <i className="ti ti-external-link" aria-hidden="true"></i>}
                                                {actionLabel}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}

                    {!loading && filteredListings.length === 0 && (
                        <p className="opportunities-empty">No {activeFilter === "all" ? "opportunities" : activeFilter + "s"} posted right now.</p>
                    )}
                </div>
            </div>

            {showPostModal && (
                <div className="post-modal-overlay" onClick={() => setShowPostModal(false)}>
                    <div className="post-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="post-modal-header">
                            <h3>Post an Opportunity</h3>
                            <button className="post-modal-close" onClick={() => setShowPostModal(false)}>
                                <i className="ti ti-x" aria-hidden="true"></i>
                            </button>
                        </div>

                        <form onSubmit={handlePostSubmit} className="opportunity-form">
                            <label>
                                Type
                                <select name="type" value={form.type} onChange={handleFormChange}>
                                    <option value="internship">Internship</option>
                                    <option value="job">Job</option>
                                    <option value="workshop">Workshop</option>
                                    <option value="event">Event</option>
                                </select>
                            </label>

                            <label>
                                Title
                                <input
                                    type="text"
                                    name="title"
                                    placeholder="e.g. Frontend Developer Intern"
                                    value={form.title}
                                    onChange={handleFormChange}
                                    required
                                />
                            </label>

                            <label>
                                Organization
                                <input
                                    type="text"
                                    name="org"
                                    placeholder="e.g. Zeta Technologies"
                                    value={form.org}
                                    onChange={handleFormChange}
                                    required
                                />
                            </label>

                            <label>
                                Location
                                <input
                                    type="text"
                                    name="location"
                                    placeholder="e.g. Pune (Hybrid) or Remote"
                                    value={form.location}
                                    onChange={handleFormChange}
                                />
                            </label>

                            <label>
                                Description
                                <textarea
                                    name="description"
                                    placeholder="Brief description of the opportunity"
                                    value={form.description}
                                    onChange={handleFormChange}
                                    rows={4}
                                    required
                                />
                            </label>

                            <label>
                                Deadline / Date
                                <input
                                    type="text"
                                    name="deadline"
                                    placeholder="e.g. Apply by Oct 20, 2026"
                                    value={form.deadline}
                                    onChange={handleFormChange}
                                />
                            </label>

                            <label>
                                Application Link <span className="opportunity-form-optional">(optional)</span>
                                <input
                                    type="url"
                                    name="applicationLink"
                                    placeholder="https://..."
                                    value={form.applicationLink}
                                    onChange={handleFormChange}
                                />
                            </label>

                            <p className="opportunity-form-hint">
                                If you leave the link blank, students can still mark interest and you'll see who applied — useful for workshops and events with no external form.
                            </p>

                            <div className="post-modal-footer">
                                <button type="submit" className="btn btn-primary" disabled={posting}>
                                    {posting ? "Posting..." : "Post Opportunity"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Opportunities;