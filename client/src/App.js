import "./App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthContextProvider, useAuth } from "./components/Auth/AuthProvider";

import Home from "./components/pages/home/Home";
import Login from "./components/Auth/Login";
import Logout from "./components/Auth/LogOut";
import SignUp from "./components/Auth/SignUp";
import ResetPassword from "./components/Auth/ResetPassword";
import AuthNav from "./components/Auth/AuthNav";

const ProtectedRoute = ({ element }) => {
  const { isAuthenticated } = useAuth(); // Use useAuth hook to access isAuthenticated
  return isAuthenticated ? (
    element
  ) : (
    <Navigate to="/login" replace state={{ from: window.location.pathname }} />
  );
};

function App() {
  return (
    <BrowserRouter>
      <AuthContextProvider>
        <Routes>
          <Route path="/" element={<AuthNav />} />
          {/* <Route path="/home" element={<ProtectedRoute element={<Home />} />} /> */}
          <Route path="/home" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/logout" element={<Logout />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/reset-password" element={<ResetPassword />} />
        </Routes>
      </AuthContextProvider>
    </BrowserRouter>
  );
}

export default App;
