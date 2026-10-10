import { useLayoutEffect } from "react";

// Items below the fold start hidden and fade up as you scroll to them.
// Items already on screen are never hidden, so nothing flashes.
export function useScrollReveal(selector) {
    useLayoutEffect(() => {
        if (typeof IntersectionObserver === "undefined") return;
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

        const viewportHeight = window.innerHeight;
        const timers = [];
        const hidden = [];

        document.querySelectorAll(selector).forEach((el) => {
            if (el.getBoundingClientRect().top < viewportHeight) return;

            const siblingIndex = Array.prototype.indexOf.call(el.parentElement.children, el);
            el.style.setProperty("--reveal-delay", `${Math.min(siblingIndex, 5) * 90}ms`);
            el.classList.add("reveal");
            hidden.push(el);
        });

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (!entry.isIntersecting) return;

                    const el = entry.target;
                    observer.unobserve(el);
                    el.classList.remove("reveal");
                    el.classList.add("reveal-in");

                    // Drop the animation class afterwards so hover effects work normally again
                    timers.push(
                        setTimeout(() => {
                            el.classList.remove("reveal-in");
                            el.style.removeProperty("--reveal-delay");
                        }, 1300)
                    );
                });
            },
            { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
        );

        hidden.forEach((el) => observer.observe(el));

        return () => {
            observer.disconnect();
            timers.forEach(clearTimeout);
            hidden.forEach((el) => {
                el.classList.remove("reveal", "reveal-in");
                el.style.removeProperty("--reveal-delay");
            });
        };
    }, []);
}