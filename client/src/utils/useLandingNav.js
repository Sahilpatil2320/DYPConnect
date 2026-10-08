import { useNavigate, useLocation } from "react-router-dom";
import { scrollToSection, scrollToTop } from "./scroll";

export function useLandingNav() {
    const navigate = useNavigate();
    const location = useLocation();
    const onLanding = location.pathname === "/";

    const goToTop = () => {
        if (onLanding) scrollToTop();
        else navigate("/", { state: { scrollTo: "home" } });
    };

    const goToSection = (id) => {
        if (id === "home") return goToTop();
        if (onLanding) scrollToSection(id);
        else navigate("/", { state: { scrollTo: id } });
    };

    return { goToSection, goToTop };
}