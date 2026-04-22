import { Navigate } from "react-router-dom";

function ProtectedRoute({ children, requiredRoles }) {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const token = localStorage.getItem("token");

    // If not logged in, redirect to login
    if (!token || !user?.role) {
        console.warn("No token or user role found, redirecting to login");
        return <Navigate to="/" replace />;
    }

    // If requiredRoles is specified and user role doesn't match, redirect to home
    if (requiredRoles && !requiredRoles.includes(user.role)) {
        console.warn(`User role '${user.role}' not in allowed roles:`, requiredRoles);
        return <Navigate to="/home" replace />;
    }

    return children;
}

export default ProtectedRoute;
