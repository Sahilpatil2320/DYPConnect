const KEY = "dypconnect_theme";

export function getTheme() {
    return localStorage.getItem(KEY) || "light";
}

export function setTheme(theme) {
    localStorage.setItem(KEY, theme);
    document.documentElement.setAttribute("data-theme", theme);
}

export function applyStoredTheme() {
    const theme = getTheme();
    document.documentElement.setAttribute("data-theme", theme);
}

export function toggleTheme() {
    const current = getTheme();
    const next = current === "dark" ? "light" : "dark";
    setTheme(next);
    return next;
}