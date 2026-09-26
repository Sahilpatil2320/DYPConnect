import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import LandingPage from "./pages/LandingPage";
import SignupRoleSelection from "./pages/SignupRoleSelection";
import StudentSignup from "./pages/StudentSignup";
import TeacherSignup from "./pages/TeacherSignup";
import AlumniSignup from "./pages/AlumniSignup";
import LoginRoleSelection from "./pages/LoginRoleSelection";
import StudentLogin from "./pages/StudentLogin";
import TeacherLogin from "./pages/TeacherLogin";
import AlumniLogin from "./pages/AlumniLogin";
import Dashboard from "./pages/Dashboard";
import { useLocation } from "react-router-dom";
import DashboardNavbar from "./components/DashboardNavbar";
import Network from "./pages/Network";
import Opportunities from "./pages/Opportunities";

function App() {
    const location = useLocation();
    const appRoutes = ["/dashboard", "/network", "/opportunities", "/messages", "/notifications"];
    const isDashboardRoute = appRoutes.some((route) => location.pathname.startsWith(route));

    return (
        <>
            {isDashboardRoute ? <DashboardNavbar /> : <Navbar />}
            <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/signup" element={<SignupRoleSelection />} />
                <Route path="/signup/student" element={<StudentSignup />} />
                <Route path="/signup/teacher" element={<TeacherSignup />} />
                <Route path="/signup/alumni" element={<AlumniSignup />} />
                <Route path="/login" element={<LoginRoleSelection />} />
                <Route path="/login/student" element={<StudentLogin />} />
                <Route path="/login/teacher" element={<TeacherLogin />} />
                <Route path="/login/alumni" element={<AlumniLogin />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/network" element={<Network />} />
                <Route path="/opportunities" element={<Opportunities />} />
            </Routes>
            {!isDashboardRoute && <Footer />}
        </>
    );
}
export default App;