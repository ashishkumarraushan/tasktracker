const express = require('express');
const verifytoken = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");
const adminMiddleware = require("../middleware/admin");
const User = require("../models/userModel");


const router = express.Router();

//only admin can access this route
router.get("/admin", verifytoken, authorizeRoles("admin"), (req, res) => {
  res.json({ message: "welcome admin" });
});



//both admin and manager can access this route
router.get("/manager", verifytoken, authorizeRoles("admin", "manager"), (req, res) => {
  res.json({ message: "welcome manager" });
});


//all can access this route
router.get("/user", verifytoken, authorizeRoles("admin", "manager", "user"), (req, res) => {
  res.json({ message: "welcome user" });

});

// ADMIN: GET ALL USERS
router.get("/all/users", verifytoken, adminMiddleware, async (req, res) => {
  try {
    console.log("Admin fetching all users");
    const users = await User.find().select("-password");
    console.log("Users fetched:", users.length);
    res.json(users);
  } catch (err) {
    console.error("Error fetching all users:", err);
    res.status(500).json({ message: "Error fetching users" });
  }
});

// ADMIN: DELETE ANY USER
router.delete("/all/users/:id", verifytoken, adminMiddleware, async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    console.log("User deleted by admin:", req.params.id);
    res.json({ message: "User deleted successfully", userId: req.params.id });
  } catch (err) {
    console.error("Error deleting user:", err);
    res.status(500).json({ message: "Error deleting user" });
  }
});

module.exports = router;
