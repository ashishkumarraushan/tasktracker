const adminMiddleware = (req, res, next) => {
    console.log("Admin middleware check - User role:", req.user?.role);
    
    if (!req.user || !req.user.role) {
        console.log("No user found in request");
        return res.status(401).json({ message: "User not found" });
    }
    
    if (req.user.role !== "admin") {
        console.log("Access denied - User is", req.user.role, "not admin");
        return res.status(403).json({ message: "Admin access only" });
    }
    
    console.log("Admin access granted");
    next();
};

module.exports = adminMiddleware; 