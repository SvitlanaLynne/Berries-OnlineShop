import { useAuth } from "./AuthProvider";
import { Link } from "react-router-dom";
import berriesImg from "../../assets/Main_Logo_Berries.png";
import berriesTxt from "../../assets/Main_Logo_Text.png";

function AuthNav() {
  const authContext = useAuth();

  return (
    <div id="landing-page-container">
      <div id="canvas">
        <img
          className="layer"
          id="logo-text"
          src={berriesTxt}
          alt="Company name"
        />
        <img className="layer" id="logo-berries" src={berriesImg} alt="Logo" />
        <div className="layer" id="flare"></div>
        <div className="layer" id="flare1"></div>
      </div>
      <nav id="login-links">
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
