import { useState, useEffect } from "react";
import API from "../axios";
import "../styles/Home.css";

function Home() {
    const [tasks, setTasks] = useState([]);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const getTasks = async () => {
        try {
            setLoading(true);
            setError("");
            console.log("Fetching user tasks...");
            const res = await API.get("/tasks");
            console.log("Tasks fetched:", res.data);
            setTasks(res.data || []);
        } catch (err) {
            const errorMsg = err.response?.data?.message || err.message || "Error fetching tasks";
            console.error("Error fetching tasks:", errorMsg);
            setError(errorMsg);
            setTasks([]);
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
            console.log("Creating task:", { title, description });
            await API.post("/tasks/create", { title, description });
            setTitle("");
            setDescription("");
            getTasks();
            alert("Task added successfully!");
        } catch (err) {
            const errorMsg = err.response?.data?.message || err.message || "Error adding task";
            console.error("Error adding task:", errorMsg);
            alert(errorMsg);
        }
    };

    const deleteTask = async (id) => {
        if (confirm("Are you sure you want to delete this task?")) {
            try {
                console.log("Deleting task:", id);
                await API.delete(`/tasks/${id}`);
                getTasks();
                alert("Task deleted!");
            } catch (err) {
                const errorMsg = err.response?.data?.message || err.message || "Error deleting task";
                console.error("Error deleting task:", errorMsg);
                alert(errorMsg);
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
                    {error && <div className="error-message" style={{color: 'red', padding: '10px', marginBottom: '10px'}}>{error}</div>}
                    {loading ? (
                        <div className="loading">Loading tasks...</div>
                    ) : tasks.length === 0 ? (
                        <div className="no-tasks">No tasks yet. Create one to get started!</div>
                    ) : (
                        <div className="tasks-grid">
                            {tasks.map((t) => (
                                <div key={t._id} className="task-card">
                                    <div className="task-header">
                                        <h3>{t.title}</h3>
                                        <button 
                                            className="btn-delete" 
                                            onClick={() => deleteTask(t._id)}
                                            title="Delete task"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                    <p className="task-description">{t.description || "No description"}</p>
                                    <small className="task-date">Created: {new Date(t.createdAt).toLocaleDateString()}</small>
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
