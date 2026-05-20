TaskTracker – Advanced Task Management System
📌 Overview

TaskTracker is a full-stack Advanced Task Management System built using the MERN Stack. The application provides secure role-based task management for Admin, Manager, and User roles with advanced workflow control, overdue tracking, comments, and file upload support.

The platform is designed to improve team collaboration, task monitoring, and workflow management through responsive UI and scalable REST APIs.

🚀 Tech Stack
Frontend: React.js, Tailwind CSS, Axios
Backend: Node.js, Express.js
Database: MongoDB
File Uploads: Multer
Authentication & Authorization: JWT, Role-Based Access Control
✨ Features
🔐 Authentication & Authorization
Secure Login & Registration
JWT-based Authentication
Role-Based Access Control (Admin, Manager, User)
📋 Task Management
Create, Update, Delete Tasks
Assign Tasks to Users
Task Priority Management
Forward-only Status Transitions
Priority Locking System
⏰ Task Tracking
Countdown-based Due Tracking
Automated Overdue Detection
Task Status Monitoring
💬 Collaboration Features
Task Comments System
Activity Tracking
File Upload Support using Multer
🔎 Advanced Functionalities
Search Tasks
Filter Tasks
Pagination
Responsive Dashboard UI
🛠️ Installation & Setup
1️⃣ Clone Repository
git clone https://github.com/your-username/tasktracker.git
2️⃣ Navigate to Project Folder
cd tasktracker
Backend Setup
3️⃣ Install Backend Dependencies
cd backend
npm install
4️⃣ Create .env File
PORT=5000
MONGO_URI=your_mongodb_connection
JWT_SECRET=your_secret_key
5️⃣ Start Backend Server
npm run dev
Frontend Setup
6️⃣ Install Frontend Dependencies
cd frontend
npm install
7️⃣ Start Frontend
npm run dev
📂 Project Structure
TaskTracker/
│
├── backend/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── uploads/
│   └── server.js
│
├── frontend/
│   ├── src/
│   ├── components/
│   ├── pages/
│   ├── context/
│   └── App.jsx
│
└── README.md
🔗 API Features
RESTful API Architecture
CRUD Operations for Tasks
Authentication APIs
Role-Based Protected Routes
File Upload APIs
Task Filtering & Pagination APIs
🎯 Key Highlights
Built using MERN Stack Architecture
Secure Role-Based Access System
Optimized Task Lifecycle Workflow
Scalable REST APIs
Fully Responsive UI using Tailwind CSS
Efficient File Upload Management with Multer
📸 Future Enhancements
Realtime Notifications
Email Reminders
Team Chat Integration
Task Analytics Dashboard
Drag & Drop Kanban Board
👨‍💻 Author

Ashish Kumar Raushan

GitHub: https://github.com/your-username

LinkedIn: https://linkedin.com/in/your-linkedin-id
