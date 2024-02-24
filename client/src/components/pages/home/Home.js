import { Link } from "react-router-dom";
import Products from "../../products";
import LogoImg from "../../../assets/logo-berries-small-bottom.png";

function Home() {
  return (
    <div id="home-container">
      <nav id="logo-group">
        <Link id="logout" to="/">
          Logout
        </Link>
        <div class="logo">
          <img id="small-logo" src={LogoImg} alt="Berries Project Logo" />
          <div class="leaf"></div>
          <div class="leaf"></div>
          <div class="leaf"></div>
        </div>
      </nav>
      <Products />
    </div>
  );
}

export default Home;
