import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import LandingPage from "./pages/LandingPage";
import SignupRoleSelection from "./pages/SignupRoleSelection";
import StudentSignup from "./pages/StudentSignup";
import TeacherSignup from "./pages/TeacherSignup";
import AlumniSignup from "./pages/AlumniSignup";

function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/signup" element={<SignupRoleSelection />} />
        <Route path="/signup/student" element={<StudentSignup />} />
        <Route path="/signup/teacher" element={<TeacherSignup />} />
        <Route path="/signup/alumni" element={<AlumniSignup />} />
      </Routes>
      <Footer />
    </>
  );
}

export default App;