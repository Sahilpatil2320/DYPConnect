const KEY = "dypconnect_search_history";
const MAX_ITEMS = 8;

export function getSearchHistory() {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
}

export function addSearchHistory(term) {
    if (!term.trim()) return;
    let history = getSearchHistory().filter((h) => h.toLowerCase() !== term.toLowerCase());
    history.unshift(term);
    history = history.slice(0, MAX_ITEMS);
    localStorage.setItem(KEY, JSON.stringify(history));
}

export function removeSearchHistoryItem(term) {
    const history = getSearchHistory().filter((h) => h !== term);
    localStorage.setItem(KEY, JSON.stringify(history));
}

export function clearSearchHistory() {
    localStorage.removeItem(KEY);
}