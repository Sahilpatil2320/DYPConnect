import api from "./api";

export async function registerUser(role, formData) {
    try {
        await api.post("/auth/register", { ...formData, role });
        return { success: true };
    } catch (err) {
        const message = err.response?.data?.message || "Registration failed. Please try again.";
        return { success: false, message };
    }
}

export async function loginUser(role, email, password) {
    try {
        const res = await api.post("/auth/login", { email, password, role });
        localStorage.setItem("dypconnect_token", res.data.token);
        localStorage.setItem("dypconnect_current_user", JSON.stringify(res.data.user));
        return { success: true, user: res.data.user };
    } catch (err) {
        const message = err.response?.data?.message || "Login failed. Please try again.";
        return { success: false, message };
    }
}

export function getCurrentUser() {
    const raw = localStorage.getItem("dypconnect_current_user");
    return raw ? JSON.parse(raw) : null;
}

export function logoutUser() {
    localStorage.removeItem("dypconnect_token");
    localStorage.removeItem("dypconnect_current_user");
}