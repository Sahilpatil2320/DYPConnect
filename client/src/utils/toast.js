let counter = 0;

function emit(type, message) {
    window.dispatchEvent(
        new CustomEvent("app-toast", { detail: { id: ++counter, type, message } })
    );
}

export const toast = {
    error: (message) => emit("error", message),
    success: (message) => emit("success", message),
    info: (message) => emit("info", message),
};