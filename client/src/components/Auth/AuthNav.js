import { useAuth } from "./AuthProvider";
import { Link } from "react-router-dom";
import berriesImg from "../../assets/Logo-Berries.png";

function AuthNav() {
  const authContext = useAuth();

  return (
    <div id="landing-page-container">
      <div id="canvas">
        <img className="layer" id="berries-bg" src={berriesImg} alt="Logo" />
        <img
          className="layer"
          id="company-name"
          // src={berriesImg}
          alt="Company name"
        />
      </div>
      <nav>
        {authContext.currentUser ? (
          <Link to="/logout">Logout</Link>
        ) : (
          <Link to="/login">Login</Link>
        )}
        {authContext.currentUser ? null : <Link to="/signup"> SignUp </Link>}
      </nav>
    </div>
  );
}

export default AuthNav;
