import { useState, useEffect } from "react";
import API from "../axios";
import "../styles/Home.css";

function Home() {
    const [tasks, setTasks] = useState([]);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [loading, setLoading] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [editTitle, setEditTitle] = useState("");
    const [editDescription, setEditDescription] = useState("");

    const getTasks = async () => {
        try {
            setLoading(true);
            const res = await API.get("/tasks");
            setTasks(res.data);
        } catch {
            console.error("Error fetching tasks:");
        } finally {
            setLoading(false);
        }
    };

    const addTask = async () => {
        if (!title.trim()) {
            alert("Please enter a task title");
            return;
        }
        try {
            await API.post("/tasks/create", { title, description });
            setTitle("");
            setDescription("");
            getTasks();
            alert("Task added successfully!");
        } catch {
            alert("Error adding task");
        }
    };

    const startEdit = (task) => {
        setEditingId(task._id);
        setEditTitle(task.title);
        setEditDescription(task.description || "");
    };

    const updateTask = async () => {
        if (!editTitle.trim()) {
            alert("Please enter a task title");
            return;
        }
        try {
            await API.put(`/tasks/${editingId}`, { 
                title: editTitle, 
                description: editDescription 
            });
            setEditingId(null);
            getTasks();
            alert("Task updated successfully!");
        } catch (err) {
            const errorMsg = err.response?.data?.message || "Error updating task";
            alert(errorMsg);
        }
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditTitle("");
        setEditDescription("");
    };

    const deleteTask = async (id) => {
        if (confirm("Are you sure you want to delete this task?")) {
            try {
                await API.delete(`/tasks/${id}`);
                getTasks();
                alert("Task deleted!");
            } catch {
                alert("Error deleting task");
            }
        }
    };

    useEffect(() => {
        getTasks();
    }, []);

    return (
        <div className="home-container">
            <div className="main-content">
                <div className="add-task-section">
                    <h2>Add New Task</h2>
                    <div className="input-group">
                        <input 
                            type="text"
                            placeholder="Task Title" 
                            value={title}
                            onChange={(e) => setTitle(e.target.value)} 
                            className="input-field"
                        />
                        <textarea 
                            placeholder="Task Description" 
                            value={description}
                            onChange={(e) => setDescription(e.target.value)} 
                            className="textarea-field"
                            rows="3"
                        />
                        <button onClick={addTask} className="btn-primary">+ Add Task</button>
                    </div>
                </div>

                <div className="tasks-section">
                    <h2>Your Tasks ({tasks.length})</h2>
                    {loading ? (
                        <div className="loading">Loading tasks...</div>
                    ) : tasks.length === 0 ? (
                        <div className="no-tasks">No tasks yet. Create one to get started!</div>
                    ) : (
                        <div className="tasks-grid">
                            {tasks.map((t) => (
                                <div key={t._id} className="task-card">
                                    {editingId === t._id ? (
                                        <div className="edit-form">
                                            <input 
                                                type="text"
                                                value={editTitle}
                                                onChange={(e) => setEditTitle(e.target.value)}
                                                className="input-field"
                                                placeholder="Task title"
                                            />
                                            <textarea 
                                                value={editDescription}
                                                onChange={(e) => setEditDescription(e.target.value)}
                                                className="textarea-field"
                                                rows="3"
                                                placeholder="Task description"
                                            />
                                            <div className="edit-actions">
                                                <button onClick={updateTask} className="btn-save">Save</button>
                                                <button onClick={cancelEdit} className="btn-cancel">Cancel</button>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="task-header">
                                                <h3>{t.title}</h3>
                                                <div className="task-actions">
                                                    <button 
                                                        className="btn-edit" 
                                                        onClick={() => startEdit(t)}
                                                        title="Edit task"
                                                    >
                                                        ✎
                                                    </button>
                                                    <button 
                                                        className="btn-delete" 
                                                        onClick={() => deleteTask(t._id)}
                                                        title="Delete task"
                                                    >
                                                        ✕
                                                    </button>
                                                </div>
                                            </div>
                                            <p className="task-description">{t.description || "No description"}</p>
                                            <small className="task-date">Created: {new Date(t.createdAt).toLocaleDateString()}</small>
                                        </>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Home;