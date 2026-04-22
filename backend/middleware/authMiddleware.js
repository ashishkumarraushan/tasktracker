const jwt = require("jsonwebtoken");

const verifytoken = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        console.log("No authorization header");
        return res.status(401).json({ message: "No token provided" });
    }

    if (!authHeader.startsWith("Bearer ")) {
        console.log("Invalid token format");
        return res.status(401).json({ message: "Invalid token format" });
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        console.log("Token verified, user:", req.user);
        next();
    } catch (err) {
        console.error("Token verification failed:", err.message);
        return res.status(403).json({ message: "Token is not valid" });
    }
};

module.exports = verifytoken;