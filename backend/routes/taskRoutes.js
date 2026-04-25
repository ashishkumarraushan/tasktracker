const express = require("express");
const router = express.Router();
const Task = require("../models/task");
const verifytoken = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/admin");
const mongoose = require("mongoose");
const multer = require("multer");

console.log("TASK ROUTES INITIALIZED");

// MULTER SETUP
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, "uploads/"),
    filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname)
});
const upload = multer({ storage });

// TEST ENDPOINT
router.get("/test", (req, res) => {
    res.status(200).json({ message: "TEST ROUTE WORKS" });
});

// CREATE TASK
router.post("/create", verifytoken, upload.single("file"), async (req, res) => {
    try {
        const { title, description, priority, duration, status } = req.body;
        const canAssignTask = req.user.role === "admin" || req.user.role === "manager";
        
        if (!title || !priority || !duration) {
            return res.status(400).json({ message: "Title, priority and duration are required" });
        }

        const task = await Task.create({
            title,
            description: description || "",
            createdBy: req.user.id,
            assignedTo: canAssignTask && req.body.assignedTo ? req.body.assignedTo : req.user.id,
            priority: Number(priority),
            duration: Number(duration),
            status: status || "todo",
            file: req.file ? req.file.path : null
        });

        await task.populate("createdBy assignedTo", "username role");
        res.status(201).json(task);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error creating task" });
    }
});

// ADMIN: GET ALL TASKS
router.get("/all-tasks", verifytoken, adminMiddleware, async (req, res) => {
    try {
        const tasks = await Task.find()
            .populate("createdBy assignedTo", "username role")
            .sort({ createdAt: -1 });
        res.json(tasks);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error fetching tasks" });
    }
});

// GET USER TASKS
router.get("/", verifytoken, async (req, res) => {
    try {
        const { search, status, priority, page = 1, limit = 10 } = req.query;
        const userId = new mongoose.Types.ObjectId(req.user.id);

        let query = req.user.role === "admin" || req.user.role === "manager"
            ? {} 
            : { $or: [{ createdBy: userId }, { assignedTo: userId }] };

        if (search) query.title = { $regex: search, $options: "i" };
        if (status) query.status = status;
        if (priority) query.priority = Number(priority);

        const tasks = await Task.find(query)
            .populate("createdBy assignedTo", "username role")
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        const total = await Task.countDocuments(query);

        res.json({ tasks, total, page: Number(page), totalPages: Math.ceil(total / limit) });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error fetching tasks" });
    }
});

// UPDATE TASK
router.put("/:id", verifytoken, async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);
        if (!task) return res.status(404).json({ message: "Task not found" });

        const userId = req.user.id.toString ? req.user.id.toString() : String(req.user.id);
        const isOwner = task.createdBy?.toString() === userId;
        const isAssigned = task.assignedTo?.toString() === userId;
        const isAdmin = req.user.role === "admin";
        const isManager = req.user.role === "manager";

        if (!isOwner && !isAssigned && !isAdmin && !isManager) {
            return res.status(403).json({ message: "Not authorized" });
        }

        const updateObj = {};
        if (req.body.title !== undefined) updateObj.title = req.body.title;
        if (req.body.description !== undefined) updateObj.description = req.body.description;
        if (req.body.status !== undefined) updateObj.status = req.body.status;
        if (req.body.priority !== undefined) updateObj.priority = req.body.priority;
        if (req.body.duration !== undefined) updateObj.duration = req.body.duration;
        if (req.body.assignedTo !== undefined) {
            if (!isAdmin && !isManager) {
                return res.status(403).json({ message: "Only admin or manager can update task assignments" });
            }
            updateObj.assignedTo = req.body.assignedTo || userId;
        }

        const updated = await Task.findByIdAndUpdate(req.params.id, { $set: updateObj }, { new: true })
            .populate("createdBy assignedTo", "username role");

        res.json(updated);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error updating task" });
    }
});

// DELETE TASK
router.delete("/:id", verifytoken, async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);
        if (!task) return res.status(404).json({ message: "Task not found" });

        const userId = req.user.id.toString ? req.user.id.toString() : String(req.user.id);
        const isOwner = task.createdBy?.toString() === userId;
        const isAssigned = task.assignedTo?.toString() === userId;
        const isAdmin = req.user.role === "admin";


        if (!isOwner && !isAssigned && !isAdmin) {
            return res.status(403).json({ message: "Not authorized" });
        }

        await Task.findByIdAndDelete(req.params.id);
        res.json({ message: "Task deleted successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error deleting task" });
    }
});

// ADD COMMENT
router.post("/:id/comment", verifytoken, async (req, res) => {
    try {
        const { text } = req.body;
        if (!text) return res.status(400).json({ message: "Comment text is required" });

        const task = await Task.findById(req.params.id);
        if (!task) return res.status(404).json({ message: "Task not found" });

        const userId = req.user.id.toString ? req.user.id.toString() : String(req.user.id);
        const isOwner = task.createdBy?.toString() === userId;
        const isAssigned = task.assignedTo?.toString() === userId;
        const isAdmin = req.user.role === "admin";
        const isManager = req.user.role === "manager";

        if (!isOwner && !isAssigned && !isAdmin && !isManager) {
            return res.status(403).json({ message: "Not authorized" });
        }

        task.comments.push({ text, user: req.user.id });
        await task.save();

        const updated = await Task.findById(task._id)
            .populate("createdBy assignedTo", "username role")
            .populate("comments.user", "username");
        res.json(updated);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error adding comment" });
    }
});

module.exports = router;
