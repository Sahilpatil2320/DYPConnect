const NAVBAR_OFFSET = 80;

function animateScrollTo(targetY) {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        window.scrollTo(0, targetY);
        return;
    }

    const startY = window.scrollY;
    const distance = targetY - startY;
    if (Math.abs(distance) < 2) return;

    // Longer distance = longer animation (between 400ms and 1400ms)
    const duration = Math.min(1400, Math.max(400, Math.abs(distance) * 0.5));
    const startTime = performance.now();

    const easeInOutCubic = (t) =>
        t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

    const step = (now) => {
        const progress = Math.min((now - startTime) / duration, 1);
        window.scrollTo(0, startY + distance * easeInOutCubic(progress));
        if (progress < 1) requestAnimationFrame(step);
    };

    requestAnimationFrame(step);
}

export function scrollToTop() {
    animateScrollTo(0);
}

export function scrollToSection(id) {
    const el = document.getElementById(id);
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY - NAVBAR_OFFSET;
    animateScrollTo(Math.max(0, top));
}