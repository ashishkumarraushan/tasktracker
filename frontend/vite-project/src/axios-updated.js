import axios from "axios";

const API = axios.create({
    baseURL: "https://tasktracker-backend-usnw.onrender.com"
});

API.interceptors.request.use((req) => {
    const token = localStorage.getItem("token");
    console.log("API request - Token exists:", !!token);

    if (token) {
        req.headers.Authorization = `Bearer ${token}`;
        console.log("Authorization header set");
    }

    return req;
}, (error) => {
    console.error("Request interceptor error:", error);
    return Promise.reject(error);
});

API.interceptors.response.use(
    (res) => {
        console.log("API response - Status:", res.status);
        return res;
    },
    (error) => {
        console.error("API error - Status:", error.response?.status, "Message:", error.message);
        if (error.response?.status === 401) {
            console.log("401 Unauthorized - clearing localStorage");
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            window.location.href = "/";
        }
        return Promise.reject(error);
    }
);

export default API;
