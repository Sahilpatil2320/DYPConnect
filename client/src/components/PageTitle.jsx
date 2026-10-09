import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const TITLES = [
    ["/dashboard", "Home"],
    ["/network", "My Network"],
    ["/opportunities", "Opportunities"],
    ["/messages", "Messaging"],
    ["/notifications", "Notifications"],
    ["/profile", "Profile"],
    ["/daily-challenge", "Daily Challenge"],
    ["/leaderboard", "Leaderboard"],
    ["/signup", "Sign Up"],
    ["/login", "Log In"],
    ["/forgot-password", "Forgot Password"],
    ["/reset-password", "Reset Password"],
];

function PageTitle() {
    const { pathname } = useLocation();

    useEffect(() => {
        if (pathname === "/") {
            document.title = "DYPConnect | College Networking Platform";
            return;
        }
        const match = TITLES.find(([prefix]) => pathname.startsWith(prefix));
        document.title = match ? `${match[1]} | DYPConnect` : "Page not found | DYPConnect";
    }, [pathname]);

    return null;
}

export default PageTitle;