import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import LandingPage from "./pages/LandingPage";
import SignupRoleSelection from "./pages/SignupRoleSelection";
import StudentSignup from "./pages/StudentSignup";

function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/signup" element={<SignupRoleSelection />} />
        <Route path="/signup/student" element={<StudentSignup />} />
      </Routes>
      <Footer />
    </>
  );
}

export default App;