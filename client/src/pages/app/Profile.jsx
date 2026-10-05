import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../utils/api";
import { getCurrentUser } from "../../utils/auth";
import { getInitials } from "../../utils/getInitials";
import "./Profile.css";

function Profile() {
    const { id } = useParams();
    const currentUser = getCurrentUser();
    const navigate = useNavigate();
    const isOwnProfile = id === currentUser._id;

    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState({ bio: "", skills: "" });

    const roleLabels = { student: "Student", teacher: "Teacher", alumni: "Alumni" };

    const fetchProfile = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/users/${id}`);
            setProfile(res.data);
            setForm({
                bio: res.data.bio || "",
                skills: (res.data.skills || []).join(", "),
            });
        } catch (err) {
            console.error("Failed to load profile:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, [id]);

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const res = await api.put("/users/profile", {
                bio: form.bio,
                skills: form.skills.split(",").map((s) => s.trim()).filter(Boolean),
            });
            setProfile(res.data);
            localStorage.setItem("dypconnect_current_user", JSON.stringify(res.data));
            setEditing(false);
        } catch (err) {
            console.error("Failed to update profile:", err);
        } finally {
            setSaving(false);
        }
    };

    const roleDetail = (p) => {
        if (p.role === "student") return `${p.department || ""} · Year ${p.year || "?"}`;
        if (p.role === "teacher") return `${p.department || ""} · ${p.designation || ""}`;
        if (p.role === "alumni") return `${p.currentRole || ""} at ${p.currentCompany || ""} · Class of ${p.graduationYear || "?"}`;
        return "";
    };

    if (loading) return <div className="profile-page"><p className="notifications-empty">Loading profile...</p></div>;
    if (!profile) return <div className="profile-page"><p className="notifications-empty">Profile not found.</p></div>;

    return (
        <div className="profile-page">
            <div className="profile-container">
                <div className="profile-banner"></div>

                <div className="profile-main-card">
                    <div className="profile-avatar-large">{getInitials(profile.fullName)}</div>

                    <div className="profile-header-info">
                        <h1>{profile.fullName}</h1>
                        <p className="profile-role-line">
                            {roleLabels[profile.role]} · {roleDetail(profile)}
                        </p>
                    </div>

                    {isOwnProfile && !editing && (
                        <button className="btn btn-outline profile-edit-btn" onClick={() => setEditing(true)}>
                            Edit Profile
                        </button>
                    )}

                    {!isOwnProfile && (
                        <button className="btn btn-primary profile-edit-btn" onClick={() => navigate("/network")}>
                            Connect
                        </button>
                    )}
                </div>

                {editing ? (
                    <form className="profile-edit-card" onSubmit={handleSave}>
                        <label>
                            Bio
                            <textarea
                                value={form.bio}
                                onChange={(e) => setForm({ ...form, bio: e.target.value })}
                                placeholder="Tell others a bit about yourself..."
                                rows={4}
                            />
                        </label>
                        <label>
                            Skills <span className="profile-form-hint">(comma-separated, e.g. React, Python, UI Design)</span>
                            <input
                                type="text"
                                value={form.skills}
                                onChange={(e) => setForm({ ...form, skills: e.target.value })}
                                placeholder="React, Node.js, MongoDB"
                            />
                        </label>
                        <div className="profile-edit-actions">
                            <button type="button" className="btn btn-outline" onClick={() => setEditing(false)}>
                                Cancel
                            </button>
                            <button type="submit" className="btn btn-primary" disabled={saving}>
                                {saving ? "Saving..." : "Save Changes"}
                            </button>
                        </div>
                    </form>
                ) : (
                    <>
                        <div className="profile-section-card">
                            <h3>About</h3>
                            <p>{profile.bio || "No bio added yet."}</p>
                        </div>

                        <div className="profile-section-card">
                            <h3>Skills</h3>
                            {profile.skills && profile.skills.length > 0 ? (
                                <div className="profile-skills-list">
                                    {profile.skills.map((skill) => (
                                        <span className="profile-skill-tag" key={skill}>{skill}</span>
                                    ))}
                                </div>
                            ) : (
                                <p>No skills added yet.</p>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

export default Profile;