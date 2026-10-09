import { useEffect } from "react";

export function useEscapeKey(onEscape, active = true) {
    useEffect(() => {
        if (!active) return;
        const handleKeyDown = (e) => {
            if (e.key === "Escape") onEscape();
        };
        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [onEscape, active]);
}