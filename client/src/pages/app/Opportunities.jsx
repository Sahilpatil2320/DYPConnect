import { useState } from "react";
import "./Opportunities.css";

function Opportunities() {
    const [activeFilter, setActiveFilter] = useState("all");
    const [appliedIds, setAppliedIds] = useState([]);

    const handleApply = (id) => {
        setAppliedIds([...appliedIds, id]);
    };

    const filters = [
        { id: "all", label: "All" },
        { id: "internship", label: "Internships" },
        { id: "job", label: "Jobs" },
        { id: "workshop", label: "Workshops" },
        { id: "event", label: "Events" },
    ];

    const listings = [
        {
            id: 1,
            type: "internship",
            title: "Frontend Developer Intern",
            org: "Zeta Technologies",
            location: "Pune (Hybrid)",
            postedBy: "Rohan Shinde",
            deadline: "Apply by Oct 10, 2026",
            description: "Looking for a final-year student proficient in React to join our product team for a 3-month internship.",
        },
        {
            id: 2,
            type: "job",
            title: "Software Engineer",
            org: "Infosys",
            location: "Bangalore",
            postedBy: "DYPConnect Placement Cell",
            deadline: "Apply by Oct 20, 2026",
            description: "Full-time opportunity for 2026 graduates. Strong DSA and one backend language required.",
        },
        {
            id: 3,
            type: "workshop",
            title: "AI/ML Bootcamp",
            org: "Dept. of Computer Science",
            location: "DYPCET Campus, Kolhapur",
            postedBy: "Prof. Anjali Deshmukh",
            deadline: "Oct 4, 2026",
            description: "Hands-on workshop covering ML fundamentals, model training, and deployment basics.",
        },
        {
            id: 4,
            type: "event",
            title: "Alumni Meet 2026",
            org: "DYPConnect Alumni Association",
            location: "DYPCET Campus, Kolhapur",
            postedBy: "Alumni Cell",
            deadline: "Oct 18, 2026",
            description: "Annual gathering to reconnect with alumni across all departments and graduation years.",
        },
        {
            id: 5,
            type: "internship",
            title: "Data Analyst Intern",
            org: "Movate",
            location: "Remote",
            postedBy: "Aditya Kadam",
            deadline: "Apply by Oct 15, 2026",
            description: "Remote internship for students comfortable with Python, SQL, and basic data visualization.",
        },
    ];

    const filteredListings =
        activeFilter === "all"
            ? listings
            : listings.filter((item) => item.type === activeFilter);

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
                    <button className="opportunities-post-btn">
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

                <div className="opportunities-list">
                    {filteredListings.map((item) => (
                        <div className="opportunity-card" key={item.id}>
                            <div className="opportunity-header">
                                <span className={`opportunity-tag opportunity-tag-${item.type}`}>
                                    {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                                </span>
                                <span className="opportunity-deadline">{item.deadline}</span>
                            </div>
                            <h3 className="opportunity-title">{item.title}</h3>
                            <p className="opportunity-org">{item.org} · {item.location}</p>
                            <p className="opportunity-desc">{item.description}</p>
                            <div className="opportunity-footer">
                                <span className="opportunity-postedby">Posted by {item.postedBy}</span>
                                {appliedIds.includes(item.id) ? (
                                    <button className="opportunity-apply opportunity-applied" disabled>
                                        <i className="ti ti-check" aria-hidden="true"></i>
                                        {item.type === "job" || item.type === "internship" ? "Applied" : "Registered"}
                                    </button>
                                ) : (
                                    <button className="opportunity-apply" onClick={() => handleApply(item.id)}>
                                        {item.type === "job" || item.type === "internship" ? "Apply" : "Register"}
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}

                    {filteredListings.length === 0 && (
                        <p className="opportunities-empty">No {activeFilter}s posted right now.</p>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Opportunities;