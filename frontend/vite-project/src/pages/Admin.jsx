import { useEffect, useState } from "react";
import API from "../axios";
import "../styles/Admin.css";

function Admin() {
    const [tasks, setTasks] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState("tasks");
    const [editingTasks, setEditingTasks] = useState({});
    const [error, setError] = useState("");
// new change 
// / ==================== GET ALL TASKS ====================

    const getAllTasks = async () => {
        try {
            setError("");
            setLoading(true);
            console.log("🔍 Admin fetching all tasks...");
            
            const res = await API.get("/tasks/all-tasks");
            console.log("✅ Tasks response:", res.data);
            
            if (Array.isArray(res.data)) {
                setTasks(res.data);
                console.log(`✅ Loaded ${res.data.length} tasks`);
            } else {
                console.error("❌ Response is not an array:", res.data);
                setTasks([]);
                setError("Invalid response format from server");
            }
        } catch (error) {
            const errorMsg = error.response?.data?.message || error.message || "Error fetching tasks";
            console.error("❌ Error fetching tasks:", errorMsg);
            setError(errorMsg);
            setTasks([]);
        } finally {
            setLoading(false);
        }
    };

    // ==================== GET ALL USERS ====================
    const getAllUsers = async () => {
        try {
            setError("");
            setLoading(true);
            console.log("🔍 Admin fetching all users...");
            
            const res = await API.get("/users/all/users");
            console.log("✅ Users response:", res.data);
            
            if (Array.isArray(res.data)) {
                setUsers(res.data);
                console.log(`✅ Loaded ${res.data.length} users`);
            } else {
                console.error("❌ Response is not an array:", res.data);
                setUsers([]);
                setError("Invalid response format from server");
            }
        } catch (error) {
            const errorMsg = error.response?.data?.message || error.message || "Error fetching users";
            console.error("❌ Error fetching users:", errorMsg);
            setError(errorMsg);
            setUsers([]);
        } finally {
            setLoading(false);
        }
    };

    // ==================== EDIT TASK ====================
    const startEditTask = (task) => {
        setEditingTasks({
            ...editingTasks,
            [task._id]: {
                title: task.title,
                description: task.description || "",
                status: task.status,
                priority: task.priority
            }
        });
    };

    // ==================== UPDATE TASK ====================
    const updateTask = async (taskId) => {
        const editData = editingTasks[taskId];
        if (!editData.title.trim()) {
            alert("Please enter a task title");
            return;
        }
        try {
            setLoading(true);
            console.log("📝 Updating task:", taskId, editData);
            
            await API.put(`/tasks/${taskId}`, {
                title: editData.title,
                description: editData.description,
                status: editData.status,
                priority: editData.priority
            });
            
            setEditingTasks({
                ...editingTasks,
                [taskId]: null
            });
            
            await getAllTasks();
            console.log("✅ Task updated successfully!");
            alert("Task updated successfully!");
        } catch (err) {
            const errorMsg = err.response?.data?.message || "Error updating task";
            console.error("❌ Error updating task:", errorMsg);
            alert(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    // ==================== CANCEL EDIT ====================
    const cancelEdit = (taskId) => {
        setEditingTasks({
            ...editingTasks,
            [taskId]: null
        });
    };

    // ==================== DELETE TASK ====================
    const deleteTask = async (id, title) => {
        if (confirm(`Are you sure you want to delete task "${title}"?`)) {
            try {
                setLoading(true);
                console.log("🗑 Deleting task:", id);
                
                await API.delete(`/tasks/${id}`);
                
                await getAllTasks();
                console.log("✅ Task deleted successfully!");
                alert("Task deleted successfully!");
            } catch (err) {
                const errorMsg = err.response?.data?.message || "Error deleting task";
                console.error("❌ Error deleting task:", errorMsg);
                alert(errorMsg);
            } finally {
                setLoading(false);
            }
        }
    };

    // ==================== DELETE USER ====================
    const deleteUser = async (id, username) => {
        if (confirm(`Are you sure you want to delete user "${username}"?`)) {
            try {
                setLoading(true);
                console.log("🗑 Deleting user:", id);
                
                await API.delete(`/users/all/users/${id}`);
                
                await getAllUsers();
                await getAllTasks();
                console.log("✅ User deleted successfully!");
                alert("User deleted successfully!");
            } catch (err) {
                const errorMsg = err.response?.data?.message || "Error deleting user";
                console.error("❌ Error deleting user:", errorMsg);
                alert(errorMsg);
            } finally {
                setLoading(false);
            }
        }
    };

    // ==================== USE EFFECTS ====================
    useEffect(() => {
        getAllTasks();
        getAllUsers();
    }, []);

    useEffect(() => {
        if (activeTab === "tasks") {
            getAllTasks();
        } else if (activeTab === "users") {
            getAllUsers();
        }
    }, [activeTab]);

    return (
        <div className="admin-container">
            <div className="admin-content">
                <h1>👨‍💼 Admin Dashboard</h1>
                
                {/* ERROR DISPLAY */}
                {error && (
                    <div className="error-message">
                        <p>❌ {error}</p>
                        <button onClick={() => setError("")}>Dismiss</button>
                    </div>
                )}
                
                {/* TABS */}
                <div className="admin-tabs">
                    <button 
                        className={`tab-button ${activeTab === "tasks" ? "active" : ""}`}
                        onClick={() => setActiveTab("tasks")}
                    >
                        📋 Tasks ({tasks.length})
                    </button>
                    <button 
                        className={`tab-button ${activeTab === "users" ? "active" : ""}`}
                        onClick={() => setActiveTab("users")}
                    >
                        👥 Users ({users.length})
                    </button>
                </div>

                {/* LOADING */}
                {loading && (
                    <div className="loading">⏳ Loading...</div>
                )}

                {/* TASKS TAB */}
                {activeTab === "tasks" && !loading && (
                    <div className="admin-section">
                        <h2>📋 All Tasks Management</h2>
                        {tasks.length === 0 ? (
                            <div className="no-tasks">No tasks in the system.</div>
                        ) : (
                            <div className="tasks-table">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Title</th>
                                            <th>Description</th>
                                            <th>Status</th>
                                            <th>Priority</th>
                                            <th>Created By</th>
                                            <th>Date</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {tasks.map((t) => (
                                            <tr key={t._id} className={editingTasks[t._id] ? "editing" : ""}>
                                                {editingTasks[t._id] ? (
                                                    <>
                                                        <td>
                                                            <input 
                                                                type="text"
                                                                value={editingTasks[t._id].title}
                                                                onChange={(e) => setEditingTasks({
                                                                    ...editingTasks,
                                                                    [t._id]: {...editingTasks[t._id], title: e.target.value}
                                                                })}
                                                                className="edit-input"
                                                            />
                                                        </td>
                                                        <td>
                                                            <textarea 
                                                                value={editingTasks[t._id].description}
                                                                onChange={(e) => setEditingTasks({
                                                                    ...editingTasks,
                                                                    [t._id]: {...editingTasks[t._id], description: e.target.value}
                                                                })}
                                                                className="edit-textarea"
                                                                rows="2"
                                                            />
                                                        </td>
                                                        <td>
                                                            <select 
                                                                value={editingTasks[t._id].status}
                                                                onChange={(e) => setEditingTasks({
                                                                    ...editingTasks,
                                                                    [t._id]: {...editingTasks[t._id], status: e.target.value}
                                                                })}
                                                                className="edit-select"
                                                            >
                                                                <option value="todo">ToDo</option>
                                                                <option value="in-progress">In Progress</option>
                                                                <option value="completed">Completed</option>
                                                            </select>
                                                        </td>
                                                        <td>
                                                            <select 
                                                                value={editingTasks[t._id].priority}
                                                                onChange={(e) => setEditingTasks({
                                                                    ...editingTasks,
                                                                    [t._id]: {...editingTasks[t._id], priority: e.target.value}
                                                                })}
                                                                className="edit-select"
                                                            >
                                                                <option value="1">1 (High)</option>
                                                                <option value="2">2</option>
                                                                <option value="3">3</option>
                                                                <option value="4">4</option>
                                                                <option value="5">5 (Low)</option>
                                                            </select>
                                                        </td>
                                                        <td colSpan="2" className="edit-actions">
                                                            <button onClick={() => updateTask(t._id)} className="btn-save">✓ Save</button>
                                                            <button onClick={() => cancelEdit(t._id)} className="btn-cancel">✕ Cancel</button>
                                                        </td>
                                                    </>
                                                ) : (
                                                    <>
                                                        <td className="task-title">{t.title}</td>
                                                        <td className="task-desc">{t.description || "N/A"}</td>
                                                        <td className="task-status">
                                                            <span className={`status-badge ${t.status}`}>
                                                                {t.status}
                                                            </span>
                                                        </td>
                                                        <td className="task-priority">
                                                            <span className={`priority-badge p${t.priority}`}>
                                                                {t.priority}/5
                                                            </span>
                                                        </td>
                                                        <td className="user-name">{t.createdBy?.username || "Unknown"}</td>
                                                        <td className="task-date">{new Date(t.createdAt).toLocaleDateString()}</td>
                                                        <td className="action-buttons">
                                                            <button 
                                                                onClick={() => startEditTask(t)} 
                                                                className="btn-edit"
                                                                title="Edit task"
                                                            >
                                                                ✎ Edit
                                                            </button>
                                                            <button 
                                                                onClick={() => deleteTask(t._id, t.title)} 
                                                                className="btn-delete"
                                                                title="Delete task"
                                                            >
                                                                🗑 Delete
                                                            </button>
                                                        </td>
                                                    </>
                                                )}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}

                {/* USERS TAB */}
                {activeTab === "users" && !loading && (
                    <div className="admin-section">
                        <h2>👥 User Management</h2>
                        {users.length === 0 ? (
                            <div className="no-tasks">No users in the system.</div>
                        ) : (
                            <div className="users-table">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Username</th>
                                            <th>Email</th>
                                            <th>Role</th>
                                            <th>Joined Date</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {users.map((u) => (
                                            <tr key={u._id}>
                                                <td className="user-name">{u.username}</td>
                                                <td className="user-email">{u.username}</td>
                                                <td className="user-role">
                                                    <span className={`role-badge ${u.role}`}>
                                                        {u.role.charAt(0).toUpperCase() + u.role.slice(1)}
                                                    </span>
                                                </td>
                                                <td className="join-date">{new Date(u.createdAt).toLocaleDateString()}</td>
                                                <td className="action-buttons">
                                                    <button 
                                                        onClick={() => deleteUser(u._id, u.username)} 
                                                        className="btn-delete"
                                                        title="Delete user"
                                                    >
                                                        🗑 Delete
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default Admin;