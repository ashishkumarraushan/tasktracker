const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        index: true
    },

    description: {
        type: String,
        default: ""
    },

    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    status: {
        type: String,
        enum: ["todo", "in-progress", "completed"],
        default: "todo"
    },

    priority: {
        type: Number,
        min: 1,
        max: 5,
        required: true
    },

    duration: {
        type: Number,
        required: true,
        min: 1,
        max: 10
    },

    startDate: {
        type: Date
    },

    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    comments: [
        {
            text: {
                type: String,
                required: true
            },
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User"
            },
            createdAt: {
                type: Date,
                default: Date.now
            }
        }
    ],

    file: {
        type: String,
        default: null
    },

    isOverdue: {
        type: Boolean,
        default: false
    }

}, {
    timestamps: true
});

module.exports = mongoose.model("Task", taskSchema);