import { useState, useEffect } from "react";
import API from "../axios";
import "../styles/Home.css";

function Home() {
    const [tasks, setTasks] = useState([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [users, setUsers] = useState([]);
    const [userRole, setUserRole] = useState("");

    // Add Task Form
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [priority, setPriority] = useState("");
    const [duration, setDuration] = useState("");
    const [taskStatus, setTaskStatus] = useState("");
    const [file, setFile] = useState(null);
    const [assignedTo, setAssignedTo] = useState("");

    // Filter Form
    const [status, setStatus] = useState("");
    const [search, setSearch] = useState("");
    const [filterPriority, setFilterPriority] = useState("");
    const [due, setDue] = useState("");

    // Edit Mode
    const [editingId, setEditingId] = useState(null);
    const [editTitle, setEditTitle] = useState("");
    const [editDescription, setEditDescription] = useState("");
    const [editAssignedTo, setEditAssignedTo] = useState("");

    const [commentText, setCommentText] = useState({});
    const canManageAssignments = userRole === "manager" || userRole === "admin";

    // Get current user role
    useEffect(() => {
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        setUserRole(user.role || "");
    }, []);

    const getStatusTextStyle = (task) => {
        if (task.status === "todo") return { color: "#e74c3c", fontWeight: "bold" };
        if (task.status === "in-progress") return { color: "#3498db", fontWeight: "bold" };
        if (task.status === "completed") return { color: "#2ecc71", fontWeight: "bold" };
        return {};
    };

    const getCardStyle = (task) => {
        if (task.isOverdue) {
            return { backgroundColor: "#ffe6e6", borderLeft: "6px solid red" };
        }
        if (task.status === "todo") return { borderLeft: "6px solid #e74c3c" };
        if (task.status === "in-progress") return { borderLeft: "6px solid #3498db" };
        if (task.status === "completed") return { borderLeft: "6px solid #2ecc71" };
        return {};
    };

    const getTasks = async () => {
        try {
            const params = new URLSearchParams();
            if (status) params.append("status", status);
            if (search) params.append("search", search);
            if (filterPriority) params.append("priority", filterPriority);
            if (due) params.append("due", due);
            params.append("page", page);
            params.append("limit", 5);

            const url = `/tasks${params.toString() ? "?" + params.toString() : ""}`;
            const res = await API.get(url);

            const data = Array.isArray(res.data) ? res.data : res.data.tasks || [];
            setTasks(data);
            setTotalPages(res.data.totalPages || 1);
        } catch (err) {
            console.error("Error fetching tasks:", err.response?.data || err.message);
            setTasks([]);
        }
    };

    const getUsers = async () => {
        try {
            const res = await API.get("/users/all/users");
            setUsers(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        getTasks();
        if (canManageAssignments) {
            getUsers();
        }
    }, [status, search, filterPriority, due, page, canManageAssignments]);

    const addTask = async () => {
        if (!title.trim()) return alert("Enter title");
        if (!priority) return alert("Select priority");
        if (!duration) return alert("Enter duration");

        try {
            const formData = new FormData();
            formData.append("title", title);
            formData.append("description", description);
            formData.append("priority", priority);
            formData.append("duration", duration);
            formData.append("status", taskStatus || "todo");
            if (canManageAssignments && assignedTo) formData.append("assignedTo", assignedTo);
            if (file) formData.append("file", file);

            await API.post("/tasks/create", formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });

            setTitle("");
            setDescription("");
            setPriority("");
            setDuration("");
            setTaskStatus("");
            setFile(null);
            setAssignedTo("");
            getTasks();
        } catch (err) {
            console.error("Error adding task:", err.response?.data || err.message);
            alert("Error: " + (err.response?.data?.message || err.message));
        }
    };

    const startEdit = (task) => {
        setEditingId(task._id);
        setEditTitle(task.title);
        setEditDescription(task.description);
        setEditAssignedTo(task.assignedTo?._id || "");
    };

    const updateTask = async () => {
        try {
            const updateData = {
                title: editTitle,
                description: editDescription
            };

            // Manager and Admin can assign tasks
            if (canManageAssignments && editAssignedTo) {
                updateData.assignedTo = editAssignedTo;
            }

            await API.put(`/tasks/${editingId}`, updateData);
            setEditingId(null);
            getTasks();
        } catch (err) {
            console.error(err);
            alert("Error: " + (err.response?.data?.message || err.message));
        }
    };

    const updateStatus = async (task) => {
        try {
            let next = "";
            if (task.status === "todo") next = "in-progress";
            else if (task.status === "in-progress") next = "completed";
            if (!next) return;

            await API.put(`/tasks/${task._id}`, { status: next });
            getTasks();
        } catch (err) {
            console.error("Error updating status:", err.response?.data?.message);
            alert("Failed to update task status");
        }
    };

    const updateAssignment = async (taskId, newAssignedTo) => {
        if (!newAssignedTo) return;

        try {
            await API.put(`/tasks/${taskId}`, { assignedTo: newAssignedTo });
            getTasks();
        } catch (err) {
            console.error("Assignment update error:", err.response?.data || err.message);
            alert("Error updating assignment");
        }
    };

    const deleteTask = async (taskId) => {
        if (window.confirm("Delete this task?")) {
            try {
                await API.delete(`/tasks/${taskId}`);
                getTasks();
            } catch (err) {
                console.error(err);
                alert("Error deleting task");
            }
        }
    };

    const addComment = async (taskId) => {
        const text = commentText[taskId];
        if (!text?.trim()) return;

        try {
            await API.post(`/tasks/${taskId}/comment`, { text });
            setCommentText({ ...commentText, [taskId]: "" });
            getTasks();
        } catch (err) {
            console.error("Comment error:", err.response?.data || err.message);
            alert("Error adding comment");
        }
    };

    const getRemainingDays = (task) => {
        if (!task.startDate) return "Not Started";
        const start = new Date(task.startDate);
        const now = new Date();
        const daysPassed = Math.floor((now - start) / (1000 * 60 * 60 * 24));
        const remaining = Number(task.duration) - daysPassed;
        return remaining < 0 ? `${remaining} days (Overdue)` : `${remaining} days remaining`;
    };

    return (
        <div className="home-container">

            <div className="add-task-section">
                <h2>Add Task</h2>

                <input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
                <input placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />

                <select value={priority} onChange={(e) => setPriority(e.target.value)}>
                    <option value="">Select Priority</option>
                    <option value="1">1 (High)</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4">4</option>
                    <option value="5">5 (Low)</option>
                </select>

                <select value={duration} onChange={(e) => setDuration(e.target.value)}>
                    <option value="">Select Duration (days)</option>
                    {[...Array(10)].map((_, i) => (
                        <option key={i} value={i + 1}>{i + 1} day</option>
                    ))}
                </select>
                

        <select value={taskStatus} onChange={(e) => setTaskStatus(e.target.value)}>
            <option value="">Select Status</option>
            <option value="todo">ToDo</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
        </select>

        {/* ✅ Assign dropdown अलग होना चाहिए */}
        {canManageAssignments && (
            <select value={assignedTo} onChange={(e) => setAssignedTo(e.target.value)}>
                <option value="">Assign to (optional)</option>
                {users.map((u) => (
                    <option key={u._id} value={u._id}>
                        {u.username}
                    </option>
                ))}
            </select>
        )}

        <input type="file" onChange={(e) => setFile(e.target.files[0])} />
        <button onClick={addTask}>Add Task</button>
            </div>

            {canManageAssignments && (
                <div className="manager-role-panel">
                    <h3>Manager Controls</h3>
                    <div className="manager-permissions">
                        <span>Assign tasks</span>
                        <span>Update task assignments</span>
                        <span>Comment on all tasks</span>
                    </div>
                </div>
            )}

            <div className="filter-section">
                <h3>Filter Tasks</h3>

                <select value={status} onChange={(e) => setStatus(e.target.value)}>
                    <option value="">All</option>
                    <option value="todo">ToDo</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                </select>

                <input placeholder="Search by title..." value={search} onChange={(e) => setSearch(e.target.value)} />

                <select value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)}>
                    <option value="">All Priority</option>
                    <option value="1">1 (High)</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4">4</option>
                    <option value="5">5 (Low)</option>
                </select>

                <select value={due} onChange={(e) => setDue(e.target.value)}>
                    <option value="">All Tasks</option>
                    <option value="active">Active</option>
                    <option value="overdue">Overdue</option>
                </select>
            </div>

            <div className="tasks-section">
                <h2>{canManageAssignments ? "All Tasks" : "Tasks"}</h2>

                {tasks.length === 0 && (
                    <div className="no-tasks">
                        No tasks found. Add a task above to assign it and start comments.
                    </div>
                )}

                {(tasks || []).map((task) => (
                    <div key={task._id} className="task-card" style={getCardStyle(task)}>
                        <h3>{task.title}</h3>
                        <p>{task.description}</p>

                        <p style={getStatusTextStyle(task)}>Status: {task.status}</p>
                        <p>Assigned To: {task.assignedTo?.username || "N/A"}</p>

                        {canManageAssignments && (
                            <div className="manager-task-controls">
                                <label>Update Assignment</label>
                                <select
                                    value={task.assignedTo?._id || ""}
                                    onChange={(e) => updateAssignment(task._id, e.target.value)}
                                >
                                    <option value="" disabled>Select user</option>
                                    {users.map((u) => (
                                        <option key={u._id} value={u._id}>
                                            {u.username}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        <p>Time: {getRemainingDays(task)}</p>

                        {task.file && (
                            <a href={`http://localhost:5000/${task.file}`} target="_blank">
                                View File
                            </a>
                        )}

                        <div style={{ marginTop: "10px" }}>
                            <strong>Comments:</strong>

                            {task.comments?.length > 0 ? (
                                task.comments.map((c, i) => (
                                    <div key={i}>• {c.text}</div>
                                ))
                            ) : (
                                <p>No comments</p>
                            )}

                            <div className="comment-form">
                                <input placeholder="Add comment" value={commentText[task._id] || ""} onChange={(e) => setCommentText({...commentText, [task._id]: e.target.value})} />
                                <button onClick={() => addComment(task._id)}>Add Comment</button>
                            </div>
                        </div>

                        <div style={{ marginTop: "10px" }}>
                            <button onClick={() => startEdit(task)}>Edit</button>

                            {task.status === "todo" && (
                                <button onClick={() => updateStatus(task)}>→ In Progress</button>
                            )}

                            {task.status === "in-progress" && (
                                <button onClick={() => updateStatus(task)}>→ Completed</button>
                            )}
                        </div>
                    </div>
                ))}

                {/* ✅ Pagination UI */}
                <div style={{ marginTop: "20px" }}>
                    <button disabled={page === 1} onClick={() => setPage(page - 1)}>Prev</button>
                    <span style={{ margin: "0 10px" }}>Page {page} of {totalPages}</span>
                    <button disabled={page === totalPages} onClick={() => setPage(page + 1)}>Next</button>
                </div>
            </div>

{editingId && (
    <>
        <div className="edit-box">
            <h3>Edit Task</h3>

            <input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} />
            <input value={editDescription} onChange={(e) => setEditDescription(e.target.value)} />

            {canManageAssignments && (
                <select
                    value={editAssignedTo}
                    onChange={(e) => setEditAssignedTo(e.target.value)}
                >
                    <option value="">Assign User</option>
                    {users.map((u) => (
                        <option key={u._id} value={u._id}>
                            {u.username}
                        </option>
                    ))}
                </select>
            )}

            <button onClick={updateTask}>Update</button>
            <button onClick={() => setEditingId(null)}>Cancel</button>
        </div>
    </>
)}
        </div>
    );
}

export default Home;
