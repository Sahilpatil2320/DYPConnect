import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import { getInitials } from "../utils/getInitials";
import { getSearchHistory, addSearchHistory, removeSearchHistoryItem } from "../utils/searchHistory";
import "./SearchBar.css";

function SearchBar() {
    const navigate = useNavigate();
    const [query, setQuery] = useState("");
    const [results, setResults] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(false);
    const wrapperRef = useRef(null);
    const debounceRef = useRef(null);

    const roleLabels = { student: "Student", teacher: "Teacher", alumni: "Alumni" };

    const roleDetail = (p) => {
        if (p.role === "student") return `${roleLabels.student} · ${p.department || ""}`;
        if (p.role === "teacher") return `${roleLabels.teacher} · ${p.designation || ""}`;
        if (p.role === "alumni") return `${roleLabels.alumni} · ${p.currentCompany || ""}`;
        return "";
    };

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        if (!query.trim()) {
            setResults([]);
            return;
        }

        setLoading(true);
        if (debounceRef.current) clearTimeout(debounceRef.current);

        debounceRef.current = setTimeout(async () => {
            try {
                const res = await api.get(`/users/search?q=${encodeURIComponent(query)}`);
                setResults(res.data);
            } catch (err) {
                console.error("Search failed:", err);
            } finally {
                setLoading(false);
            }
        }, 300);

        return () => clearTimeout(debounceRef.current);
    }, [query]);

    const handleFocus = () => {
        setIsOpen(true);
        setHistory(getSearchHistory());
    };

    const handleSelectResult = (user) => {
        addSearchHistory(user.fullName);
        setIsOpen(false);
        setQuery("");
        navigate(`/profile/${user._id}`);
    };

    const handleHistoryClick = (term) => {
        setQuery(term);
    };

    const handleRemoveHistory = (e, term) => {
        e.stopPropagation();
        removeSearchHistoryItem(term);
        setHistory(getSearchHistory());
    };

    const showHistory = isOpen && !query.trim() && history.length > 0;
    const showResults = isOpen && query.trim().length > 0;

    return (
        <div className="dash-search-wrapper" ref={wrapperRef}>
            <div className="dash-search">
                <i className="ti ti-search" aria-hidden="true"></i>
                <input
                    type="text"
                    placeholder="Search people..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={handleFocus}
                />
                {query && (
                    <button className="search-clear-btn" onClick={() => setQuery("")} aria-label="Clear search">
                        <i className="ti ti-x" aria-hidden="true"></i>
                    </button>
                )}
            </div>

            {showHistory && (
                <div className="search-dropdown">
                    <div className="search-dropdown-header">
                        <span>Recent Searches</span>
                    </div>
                    {history.map((term) => (
                        <div key={term} className="search-history-item" onClick={() => handleHistoryClick(term)}>
                            <i className="ti ti-clock" aria-hidden="true"></i>
                            <span className="search-history-text">{term}</span>
                            <button
                                className="search-history-remove"
                                onClick={(e) => handleRemoveHistory(e, term)}
                                aria-label="Remove from history"
                            >
                                <i className="ti ti-x" aria-hidden="true"></i>
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {showResults && (
                <div className="search-dropdown">
                    {loading && <div className="search-dropdown-loading">Searching...</div>}

                    {!loading && results.length === 0 && (
                        <div className="search-dropdown-empty">No people found for "{query}"</div>
                    )}

                    {!loading &&
                        results.map((user) => (
                            <div key={user._id} className="search-result-item" onClick={() => handleSelectResult(user)}>
                                <div className="search-result-avatar">{getInitials(user.fullName)}</div>
                                <div className="search-result-info">
                                    <p className="search-result-name">{user.fullName}</p>
                                    <p className="search-result-role">{roleDetail(user)}</p>
                                    {user.bio && <p className="search-result-bio">{user.bio}</p>}
                                </div>
                            </div>
                        ))}
                </div>
            )}
        </div>
    );
}

export default SearchBar;