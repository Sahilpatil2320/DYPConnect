import { Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import DashboardNavbar from "./components/DashboardNavbar";

import LandingPage from "./pages/LandingPage";

import SignupRoleSelection from "./pages/auth/SignupRoleSelection";
import StudentSignup from "./pages/auth/StudentSignup";
import TeacherSignup from "./pages/auth/TeacherSignup";
import AlumniSignup from "./pages/auth/AlumniSignup";
import LoginRoleSelection from "./pages/auth/LoginRoleSelection";
import StudentLogin from "./pages/auth/StudentLogin";
import TeacherLogin from "./pages/auth/TeacherLogin";
import AlumniLogin from "./pages/auth/AlumniLogin";

import Dashboard from "./pages/app/Dashboard";
import Network from "./pages/app/Network";
import Opportunities from "./pages/app/Opportunities";
import Messages from "./pages/app/Messages";
import Notifications from "./pages/app/Notifications";

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
        <Route path="/messages" element={<Messages />} />
        <Route path="/notifications" element={<Notifications />} />
      </Routes>
      {!isDashboardRoute && <Footer />}
    </>
  );
}

export default App;