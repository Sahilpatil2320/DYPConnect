import axios from "axios";
import { toast } from "./toast";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
});

// Requests that should never pop up an error message
const SILENT_URL_PARTS = [
    "/auth/", // login, signup and reset forms show their own messages
    "/mark-visited",
    "/challenge/pause",
    "unread-count",
    "unseen",
    "invitations-count",
];

// Free hosts put the server to sleep when idle. If the first request is slow, say why.
let serverAwake = false;
let wakeTimer = null;

function startWakeTimer() {
    if (serverAwake || wakeTimer) return;
    wakeTimer = setTimeout(() => {
        toast.info("Waking up the server. This can take up to a minute the first time.");
    }, 4000);
}

function stopWakeTimer(responded) {
    if (responded) serverAwake = true;
    clearTimeout(wakeTimer);
    wakeTimer = null;
}

function shouldToast(error) {
    const config = error.config || {};
    const url = config.url || "";
    const status = error.response?.status;

    if (config.silent) return false;
    if (status === 401) return false; // handled by the logout redirect below
    if (SILENT_URL_PARTS.some((part) => url.includes(part))) return false;
    if (error.response?.data?.timedOut) return false; // the Daily Challenge page explains it

    const isGet = (config.method || "get").toLowerCase() === "get";
    if (!isGet) return true; // something the user did: always tell them
    return !error.response || status >= 500; // page loads: only real outages
}

function errorMessage(error) {
    if (!error.response) {
        return "Can't reach the server. Check your connection and try again.";
    }
    return error.response.data?.message || "Something went wrong. Please try again.";
}

api.interceptors.request.use((config) => {
    const token = localStorage.getItem("dypconnect_token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    startWakeTimer();
    return config;
});

api.interceptors.response.use(
    (response) => {
        stopWakeTimer(true);
        return response;
    },
    (error) => {
        stopWakeTimer(!!error.response);

        const status = error.response?.status;
        const hadToken = !!localStorage.getItem("dypconnect_token");

        if (status === 401 && hadToken) {
            // Token expired or invalid: log out and go to login
            localStorage.removeItem("dypconnect_token");
            localStorage.removeItem("dypconnect_current_user");
            if (!window.location.pathname.startsWith("/login")) {
                window.location.href = "/login";
            }
        } else if (shouldToast(error)) {
            toast.error(errorMessage(error));
        }

        return Promise.reject(error);
    }
);

export default api;