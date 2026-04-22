import { useState } from "react";
import API from "../axios";
import { useNavigate, Link } from "react-router-dom";
import "../styles/Auth.css";

function Register() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState("user");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleRegister = async () => {
        if (!username.trim() || !password.trim()) {
            alert("Please fill in all fields");
            return;
        }
        if (password.length < 4) {
            alert("Password must be at least 4 characters");
            return;
        }
        try {
            setLoading(true);
            console.log("Attempting register with:", { username, role });
            const res = await API.post("/auth/register", { username, password, role });
            console.log("Register response:", res.data);
            alert("Registered successfully! Redirecting to login...");
            setTimeout(() => navigate("/"), 1500);
        } catch (err) {
            console.error("Register error:", err);
            const errorMessage = err.response?.data?.message || err.message || "Registration failed";
            alert(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === "Enter") {
            handleRegister();
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-header">
                    <h1>📋 TaskTracker</h1>
                    <p>Create an account to get started</p>
                </div>

                <div className="auth-form">
                    <h2>Register</h2>
                    <input 
                        type="text"
                        placeholder="Username" 
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        onKeyDown={handleKeyPress}
                        className="input-field"
                        disabled={loading}
                    />
                    <input 
                        type="password"
                        placeholder="Password" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onKeyDown={handleKeyPress}
                        className="input-field"
                        disabled={loading}
                    />
                    <select 
                        value={role} 
                        onChange={(e) => setRole(e.target.value)}
                        className="input-field"
                        disabled={loading}
                    >
                        <option value="user">👤 User</option>
                        <option value="manager">📊 Manager</option>
                        <option value="admin">👨‍💼 Admin</option>
                    </select>
                    <button 
                        onClick={handleRegister} 
                        className="btn-primary"
                        disabled={loading}
                    >
                        {loading ? "Registering..." : "Create Account"}
                    </button>

                    <div className="auth-footer">
                        <p>Already have an account? <Link to="/" className="link">Login here</Link></p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Register;