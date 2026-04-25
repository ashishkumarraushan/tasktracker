require('dotenv').config();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const register = async (req, res) => {
    try {  
        const { username, password, role } = req.body;
        
        console.log("=== REGISTER REQUEST ===");
        console.log("Username:", username);
        console.log("Role:", role);
        
        // Check if user already exists
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            console.log("Username already taken:", username);
            return res.status(400).json({ message: "Username already taken" });
        }
        
        console.log("Username available, hashing password...");
        const hashpassword = await bcrypt.hash(password, 10);
        
        const user = new User({
            username,
            password: hashpassword,
            role
        });
        
        await user.save();
        console.log("User saved successfully:", username);
        console.log("=== REGISTER RESPONSE ===");
        res.status(201).json({ message: `User registered with username ${username}` });
    } catch (error) {
        console.error("=== REGISTER ERROR ===");
        console.error("Error message:", error.message);
        console.error("Full error:", error);
        res.status(500).json({ message: error.message || "Error registering user" });
    }
};

const login = async (req, res) => {
    try {
        const { username, password } = req.body;
        
        console.log("=== LOGIN REQUEST ===");
        console.log("Username:", username);
        
        if (!username || !password) {
            console.log("Missing username or password");
            return res.status(400).json({ message: "Username and password are required" });
        }
        
        const user = await User.findOne({ username });
        if (!user) {
            console.log("User not found:", username);
            return res.status(400).json({ message: `User with username ${username} not found` });
        }
        
        console.log("User found, checking password...");
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            console.log("Invalid password for user:", username);
            return res.status(400).json({ message: "Invalid password" });
        }
        
        console.log("Password matched, generating token...");
        const token = jwt.sign(
            { id: user._id, username: user.username, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );
        
        const userObj = {
            _id: user._id.toString(),
            username: user.username,
            role: user.role,
            createdAt: user.createdAt || new Date()
        };
        
        const responseData = {
            message: "Login successful",
            token: token,
            user: userObj
        };
        
        console.log("=== LOGIN RESPONSE ===");
        console.log("User object:", userObj);
        console.log("Full response:", responseData);
        
        return res.status(200).json(responseData);
    } catch (error) {
        console.error("=== LOGIN ERROR ===");
        console.error("Error message:", error.message);
        console.error("Full error:", error);
        res.status(500).json({ message: error.message || "Error logging in" });
    }
};

module.exports = {
  register,
  login,
};