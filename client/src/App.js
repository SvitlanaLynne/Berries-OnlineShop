import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import AuthContextProvider from "./components/Auth/AuthProvider";
import Home from "./components/pages/home/Home";
import AuthNav from "./components/Auth/AuthNav";
import Login from "./components/Auth/Login";
import SignUp from "./components/Auth/SignUp";
import Logout from "./components/Auth/LogOut";
import ResetPassword from "./components/Auth/ResetPassword";

function App() {
  return (
    <BrowserRouter>
      <AuthContextProvider>
        <Routes>
          <Route path="/" element={<AuthNav />}></Route>
          <Route path="/home" element={<Home />}></Route>
          <Route path="/login" element={<Login />}></Route>
          <Route path="/logout" element={<Logout />}></Route>
          <Route path="/signup" element={<SignUp />}></Route>
          <Route path="/reset-password" element={<ResetPassword />}></Route>
        </Routes>
      </AuthContextProvider>
    </BrowserRouter>
  );
}

export default App;
