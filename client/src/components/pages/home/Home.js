import { useNavigate } from "react-router-dom";
import Products from "../../products";

function Home() {
  const navigate = useNavigate();
  return (
    <div>
      <button onClick={() => navigate("/logout")}>Logout</button>
      <Products />
    </div>
  );
}

export default Home;
