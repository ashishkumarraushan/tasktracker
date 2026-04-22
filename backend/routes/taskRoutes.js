const express = require("express");
const router = express.Router();

const Task = require("../models/task");
const verifytoken = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/admin");

//  CREATE TASK
router.post("/create", verifytoken, async (req, res) => {
    try {
        const { title, description } = req.body;
        
        if (!title) {
            return res.status(400).json({ message: "Title is required" });
        }
        
        const task = await Task.create({
            title,
            description: description || "",
            createdBy: req.user.id,
            status: "open"
        });
        
        await task.populate("createdBy", "username role");
        console.log("Task created:", task);
        res.status(201).json(task);
    } catch (err) {
        console.error("Error creating task:", err);
        res.status(500).json({ message: "Error creating task" });
    }
});

//  ADMIN: GET ALL TASKS (must come before GET /:id)
router.get("/all", verifytoken, adminMiddleware, async (req, res) => {
    try {
        console.log("Admin fetching all tasks, user role:", req.user.role);
        const tasks = await Task.find().populate("createdBy", "username role");
        console.log("Admin fetched tasks:", tasks.length);
        res.json(tasks);
    } catch (err) {
        console.error("Error fetching all tasks:", err);
        res.status(500).json({ message: "Error fetching all tasks" });
    }
});

//  GET USER TASKS
router.get("/", verifytoken, async (req, res) => {
    try {
        console.log("Fetching tasks for user:", req.user.id);
        const tasks = await Task.find({ createdBy: req.user.id }).populate("createdBy", "username role");
        console.log("Found tasks:", tasks.length);
        res.json(tasks);
    } catch (err) {
        console.error("Error fetching tasks:", err);
        res.status(500).json({ message: "Error fetching tasks" });
    }
});

//  UPDATE TASK (user updates own task, admin updates any task)
router.put("/:id", verifytoken, async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);
        
        if (!task) {
            return res.status(404).json({ message: "Task not found" });
        }

        // Check if user is owner or admin
        const isOwner = task.createdBy.toString() === req.user.id;
        const isAdmin = req.user.role === "admin";

        if (!isOwner && !isAdmin) {
            return res.status(403).json({ message: "Not authorized to update this task" });
        }

        const updatedTask = await Task.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        ).populate("createdBy", "username role");

        console.log("Task updated:", updatedTask);
        res.json(updatedTask);
    } catch (err) {
        console.error("Error updating task:", err);
        res.status(500).json({ message: "Error updating task" });
    }
});

// DELETE TASK (user deletes own task, admin deletes any task)
router.delete("/:id", verifytoken, async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);
        
        if (!task) {
            return res.status(404).json({ message: "Task not found" });
        }

        // Check if user is owner or admin
        const isOwner = task.createdBy.toString() === req.user.id;
        const isAdmin = req.user.role === "admin";

        if (!isOwner && !isAdmin) {
            return res.status(403).json({ message: "Not authorized to delete this task" });
        }

        await Task.findByIdAndDelete(req.params.id);
        console.log("Task deleted:", req.params.id);
        res.json({ message: "Task deleted successfully", taskId: req.params.id });
    } catch (err) {
        console.error("Error deleting task:", err);
        res.status(500).json({ message: "Error deleting task" });
    }
});

module.exports = router;