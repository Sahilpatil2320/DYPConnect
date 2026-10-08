import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_API_URL
    ? import.meta.env.VITE_API_URL.replace("/api", "")
    : "http://localhost:5000";

const socket = io(SOCKET_URL, {
    autoConnect: false,
    // Reads the token fresh on every connect attempt
    auth: (cb) => cb({ token: localStorage.getItem("dypconnect_token") }),
});

export default socket;