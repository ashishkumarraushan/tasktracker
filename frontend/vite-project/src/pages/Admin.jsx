import { useEffect, useState } from "react";
import API from "../axios";
import "../styles/Admin.css";

function Admin() {
    const [tasks, setTasks] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState("tasks");
    const [editingTasks, setEditingTasks] = useState({});

    const getAllTasks = async () => {
        try {
            setLoading(true);
            console.log("Admin fetching all tasks...");
            const res = await API.get("/tasks/all");
            console.log("Admin tasks fetched:", res.data.length);
            setTasks(res.data);
        } catch (error) {
            const errorMsg = error.response?.data?.message || error.message || "Error fetching tasks";
            console.error("Error fetching tasks:", errorMsg);
            alert(errorMsg);
            setTasks([]);
        } finally {
            setLoading(false);
        }
    };

    const getAllUsers = async () => {
        try {
            setLoading(true);
            console.log("Admin fetching all users...");
            const res = await API.get("/users/all/users");
            console.log("Admin users fetched:", res.data.length);
            setUsers(res.data);
        } catch (error) {
            const errorMsg = error.response?.data?.message || error.message || "Error fetching users";
            console.error("Error fetching users:", errorMsg);
            alert(errorMsg);
            setUsers([]);
        } finally {
            setLoading(false);
        }
    };

    const startEditTask = (task) => {
        setEditingTasks({
            ...editingTasks,
            [task._id]: {
                title: task.title,
                description: task.description || ""
            }
        });
    };

    const updateTask = async (taskId) => {
        const editData = editingTasks[taskId];
        if (!editData.title.trim()) {
            alert("Please enter a task title");
            return;
        }
        try {
            await API.put(`/tasks/${taskId}`, { 
                title: editData.title, 
                description: editData.description 
            });
            setEditingTasks({
                ...editingTasks,
                [taskId]: null
            });
            getAllTasks();
            alert("Task updated successfully!");
        } catch (err) {
            const errorMsg = err.response?.data?.message || "Error updating task";
            alert(errorMsg);
        }
    };

    const cancelEdit = (taskId) => {
        setEditingTasks({
            ...editingTasks,
            [taskId]: null
        });
    };

    const deleteTask = async (id) => {
        if (confirm("Are you sure you want to delete this task?")) {
            try {
                await API.delete(`/tasks/${id}`);
                getAllTasks();
                alert("Task deleted successfully!");
            } catch (err) {
                const errorMsg = err.response?.data?.message || "Error deleting task";
                alert(errorMsg);
            }
        }
    };

    const deleteUser = async (id, username) => {
        if (confirm(`Are you sure you want to delete user "${username}"? This will also delete all their tasks.`)) {
            try {
                await API.delete(`/users/all/users/${id}`);
                getAllUsers();
                getAllTasks();
                alert("User deleted successfully!");
            } catch (err) {
                const errorMsg = err.response?.data?.message || "Error deleting user";
                alert(errorMsg);
            }
        }
    };

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
                <h1>Admin Dashboard</h1>
                
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

                {loading ? (
                    <div className="loading">Loading...</div>
                ) : activeTab === "tasks" ? (
                    <div className="admin-section">
                        <h2>All Tasks</h2>
                        {tasks.length === 0 ? (
                            <div className="no-tasks">No tasks in the system.</div>
                        ) : (
                            <div className="tasks-table">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Title</th>
                                            <th>Description</th>
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
                                                        <td colSpan="3" className="edit-actions">
                                                            <button onClick={() => updateTask(t._id)} className="btn-save">Save</button>
                                                            <button onClick={() => cancelEdit(t._id)} className="btn-cancel">Cancel</button>
                                                        </td>
                                                    </>
                                                ) : (
                                                    <>
                                                        <td className="task-title">{t.title}</td>
                                                        <td className="task-desc">{t.description || "N/A"}</td>
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
                                                                onClick={() => deleteTask(t._id)} 
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
                ) : (
                    <div className="admin-section">
                        <h2>All Users</h2>
                        {users.length === 0 ? (
                            <div className="no-tasks">No users in the system.</div>
                        ) : (
                            <div className="users-table">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Username</th>
                                            <th>Role</th>
                                            <th>Joined Date</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {users.map((u) => (
                                            <tr key={u._id}>
                                                <td className="user-name">{u.username}</td>
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
                                                        🗑 Delete User
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