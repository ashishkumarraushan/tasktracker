
import { useState, useEffect } from "react";
import "../styles/Profile.css";

function Profile() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            const userData = JSON.parse(localStorage.getItem("user") || "{}");
            if (userData && userData._id) {
                setUser(userData);
            }
            setLoading(false);
        })();
    }, []);

    if (loading) {
        return <div className="loading">Loading profile...</div>;
    }

    if (!user) {
        return <div className="no-profile">No user data found. Please login.</div>;
    }

    return (
        <div className="profile-page">
            <div className="profile-container">
                <div className="profile-card">
                    <div className="profile-header">
                        <div className="profile-avatar">
                            👤
                        </div>
                        <h1>User Profile</h1>
                    </div>

                    <div className="profile-info">
                        <div className="info-section">
                            <h3>Account Information</h3>
                            <div className="info-grid">
                                <div className="info-item">
                                    <label>Username</label>
                                    <p className="info-value">{user?.username || "N/A"}</p>
                                </div>

                                <div className="info-item">
                                    <label>Role</label>
                                    <p className="info-value role-badge" data-role={user?.role}>
                                        {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1) || "N/A"}
                                    </p>
                                </div>

                                <div className="info-item">
                                    <label>User ID</label>
                                    <p className="info-value">{user?._id || "N/A"}</p>
                                </div>

                                <div className="info-item">
                                    <label>Joined Date</label>
                                    <p className="info-value">
                                        {user?.createdAt 
                                            ? new Date(user.createdAt).toLocaleDateString() 
                                            : "N/A"}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="info-section">
                            <h3>Permissions</h3>
                            <div className="permissions">
                                {user?.role === "admin" && (
                                    <div className="permission-badge admin">
                                        ✓ Admin Access - Full system control
                                    </div>
                                )}
                                {user?.role === "manager" && (
                                    <div className="permission-badge manager">
                                        ✓ Manager Access - Team task management
                                    </div>
                                )}
                                {user?.role === "user" && (
                                    <div className="permission-badge user">
                                        ✓ User Access - Personal task management
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Profile;