import { useAuth } from "./AuthProvider";
import { Link } from "react-router-dom";

function AuthNav() {
  const authContext = useAuth();

  return (
    <div id="auth-menu">
      {authContext.currentUser ? (
        <Link to="/logout">Logout</Link>
      ) : (
        <Link to="/login">Login</Link>
      )}
      {authContext.currentUser ? null : <Link to="/signup"> SignUp </Link>}
    </div>
  );
}

export default AuthNav;
