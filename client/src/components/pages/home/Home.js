import { Link } from "react-router-dom";
import Products from "../../products";

function Home() {
  return (
    <div id="home-container">
      <Link id="logout" to="/">
        Logout
      </Link>
      <img id="small-logo" src="" alt="Berries Project Logo" />
      <Products />
    </div>
  );
}

export default Home;
