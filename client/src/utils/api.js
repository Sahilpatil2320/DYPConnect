import axios from "axios";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem("dypconnect_token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// If the server says our token is invalid or expired, log out and go to login.
api.interceptors.response.use(
    (response) => response,
    (error) => {
        const hadToken = !!localStorage.getItem("dypconnect_token");
        if (error.response && error.response.status === 401 && hadToken) {
            localStorage.removeItem("dypconnect_token");
            localStorage.removeItem("dypconnect_current_user");
            if (!window.location.pathname.startsWith("/login")) {
                window.location.href = "/login";
            }
        }
        return Promise.reject(error);
    }
);

export default api;