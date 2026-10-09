import { useState, useEffect, useRef } from "react";
import "./ToastHost.css";

const DURATION = 4000;
const ICONS = {
    error: "ti-alert-circle",
    success: "ti-circle-check",
    info: "ti-info-circle",
};

function ToastHost() {
    const [toasts, setToasts] = useState([]);
    const timersRef = useRef({});

    const dismiss = (id) => {
        clearTimeout(timersRef.current[id]);
        delete timersRef.current[id];
        setToasts((prev) => prev.filter((t) => t.id !== id));
    };

    useEffect(() => {
        const handleToast = (e) => {
            const incoming = e.detail;
            setToasts((prev) => {
                // The same message isn't stacked twice while it's still visible
                if (prev.some((t) => t.message === incoming.message)) return prev;
                return [...prev, incoming].slice(-3);
            });
            timersRef.current[incoming.id] = setTimeout(() => dismiss(incoming.id), DURATION);
        };

        window.addEventListener("app-toast", handleToast);
        return () => {
            window.removeEventListener("app-toast", handleToast);
            Object.values(timersRef.current).forEach(clearTimeout);
            timersRef.current = {};
        };
    }, []);

    return (
        <div className="toast-container" aria-live="polite">
            {toasts.map((t) => (
                <button key={t.id} className={`toast toast-${t.type}`} onClick={() => dismiss(t.id)}>
                    <i className={`ti ${ICONS[t.type]}`} aria-hidden="true"></i>
                    <span>{t.message}</span>
                </button>
            ))}
        </div>
    );
}

export default ToastHost;