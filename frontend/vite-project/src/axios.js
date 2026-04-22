import axios from "axios";

const API = axios.create({
    baseURL: "http://localhost:5000/api"
});

// Request interceptor to add token
API.interceptors.request.use((req) => {
    const token = localStorage.getItem("token");

    if (token) {
        req.headers.Authorization = `Bearer ${token}`;
        console.log(`[API] ${req.method?.toUpperCase()} ${req.url} - Token attached`);
    } else {
        console.log(`[API] ${req.method?.toUpperCase()} ${req.url} - No token`);
    }

    return req;
});

// Response interceptor for error handling
API.interceptors.response.use(
    (res) => {
        console.log(`[API] Response: ${res.status} from ${res.config.url}`);
        return res;
    },
    (error) => {
        if (error.response?.status === 401) {
            console.log("[API] 401 Unauthorized - Clearing auth and redirecting");
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            window.location.href = "/";
        } else if (error.response?.status === 403) {
            console.log("[API] 403 Forbidden - Access denied");
        } else if (error.response) {
            console.error(`[API] Error ${error.response.status}:`, error.response.data);
        } else if (error.request) {
            console.error("[API] No response from server:", error.request);
        } else {
            console.error("[API] Request error:", error.message);
        }
        return Promise.reject(error);
    }
);

export default API;