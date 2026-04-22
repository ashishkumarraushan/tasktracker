import { useState } from "react";
import API from "../axios";
import { useNavigate, Link } from "react-router-dom";
import "../styles/Auth.css";

function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async () => {
        if (!username.trim() || !password.trim()) {
            alert("Please fill in all fields");
            return;
        }

        try {
            setLoading(true);
            console.log("Attempting login with:", username);

            const res = await API.post("/auth/login", { username, password });
            
            console.log("Response data:", res.data);
            console.log("Token exists:", !!res.data?.token);
            console.log("User exists:", !!res.data?.user);

            // Get token and user from response
            const token = res.data?.token;
            let user = res.data?.user;

            if (!token) {
                throw new Error("No token in response");
            }

            // If user not in response, decode from token
            if (!user) {
                console.warn("User not in response, decoding from token...");
                try {
                    const decoded = JSON.parse(atob(token.split('.')[1]));
                    user = {
                        _id: decoded.id,
                        username: decoded.username,
                        role: decoded.role,
                        createdAt: new Date()
                    };
                    console.log("User decoded from token:", user);
                } catch (err) {
                    console.error("Token decode error:", err);
                    throw new Error("Failed to get user from token");
                }
            }

            localStorage.setItem("token", token);
            localStorage.setItem("user", JSON.stringify(user));
            console.log("Login successful, token and user stored");

            if (user?.role === "admin") {
                navigate("/admin");
            } else {
                navigate("/home");
            }

        } catch (err) {
            console.error("Login error:", err.message);
            const errorMessage = err.response?.data?.message || err.message || "Login failed";
            alert(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === "Enter") {
            handleLogin();
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-header">
                    <h1>📋 TaskTracker</h1>
                    <p>Manage your tasks efficiently</p>
                </div>

                <div className="auth-form">
                    <h2>Login</h2>

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

                    <button 
                        onClick={handleLogin} 
                        className="btn-primary"
                        disabled={loading}
                    >
                        {loading ? "Logging in..." : "Login"}
                    </button>

                    <div className="auth-footer">
                        <p>
                            Don't have an account?{" "}
                            <Link to="/register" className="link">
                                Register here
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Login;