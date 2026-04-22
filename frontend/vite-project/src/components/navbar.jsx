import { useNavigate } from "react-router-dom";
import "../styles/Navbar.css";


function Navbar() {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem("user") || "{}");

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/");
    };

    const goToHome = () => {
        navigate("/home");
    };

    const goToProfile = () => {
        navigate("/profile");
    };

    const goToAdmin = () => {
        navigate("/admin");
    };

    return (
        <nav className="navbar-component">
            <div className="nav-container">
                <div className="nav-brand">
                    <span className="nav-logo">📋 TaskTracker</span>
                </div>

                <div className="nav-links">
                    <button className="nav-link" onClick={goToHome}>
                        🏠 Home
                    </button>
                    <button className="nav-link" onClick={goToProfile}>
                        👤 Profile
                    </button>

                    {user?.role === "admin" && (
                        <button className="nav-link admin" onClick={goToAdmin}>
                            👨‍💼 Admin
                        </button>
                    )}
                </div>

                <div className="nav-user">
                    <span className="user-info">
                        {user?.username && `Welcome, ${user.username}!`}
                    </span>
                    <button className="nav-logout" onClick={handleLogout}>
                        Logout
                    </button>
                </div>
            </div>
        </nav>
    );
}



export default Navbar;
