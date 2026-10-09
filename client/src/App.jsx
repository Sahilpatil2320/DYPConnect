import { Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import DashboardNavbar from "./components/DashboardNavbar";
import ProtectedRoute from "./components/ProtectedRoute";
import ScrollToTop from "./components/ScrollToTop";
import PageTitle from "./components/PageTitle";
import ToastHost from "./components/ToastHost";

import LandingPage from "./pages/LandingPage";
import NotFound from "./pages/NotFound";

import SignupRoleSelection from "./pages/auth/SignupRoleSelection";
import StudentSignup from "./pages/auth/StudentSignup";
import TeacherSignup from "./pages/auth/TeacherSignup";
import AlumniSignup from "./pages/auth/AlumniSignup";
import LoginRoleSelection from "./pages/auth/LoginRoleSelection";
import StudentLogin from "./pages/auth/StudentLogin";
import TeacherLogin from "./pages/auth/TeacherLogin";
import AlumniLogin from "./pages/auth/AlumniLogin";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";

import Dashboard from "./pages/app/Dashboard";
import Network from "./pages/app/Network";
import Opportunities from "./pages/app/Opportunities";
import Messages from "./pages/app/Messages";
import Notifications from "./pages/app/Notifications";
import Profile from "./pages/app/Profile";
import DailyChallenge from "./pages/app/DailyChallenge";
import Leaderboard from "./pages/app/Leaderboard";

function App() {
    const location = useLocation();

    const appRoutes = [
        "/dashboard",
        "/network",
        "/opportunities",
        "/messages",
        "/notifications",
        "/profile",
        "/daily-challenge",
        "/leaderboard",
    ];
    const isDashboardRoute = appRoutes.some((route) => location.pathname.startsWith(route));

    return (
        <>
            <ScrollToTop />
            <PageTitle />
            <ToastHost />
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

                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password/:token" element={<ResetPassword />} />

                <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/network" element={<ProtectedRoute><Network /></ProtectedRoute>} />
                <Route path="/opportunities" element={<ProtectedRoute><Opportunities /></ProtectedRoute>} />
                <Route path="/messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
                <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
                <Route path="/profile/:id" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                <Route path="/daily-challenge" element={<ProtectedRoute><DailyChallenge /></ProtectedRoute>} />
                <Route path="/leaderboard" element={<ProtectedRoute><Leaderboard /></ProtectedRoute>} />

                <Route path="*" element={<NotFound />} />
            </Routes>

            {!isDashboardRoute && <Footer />}
        </>
    );
}

export default App;