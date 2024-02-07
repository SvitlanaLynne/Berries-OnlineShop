import { useNavigate } from "react-router-dom";
import { useAuth } from "./AuthProvider";

function Logout() {
  const authContext = useAuth();
  const navigate = useNavigate();

  try {
    authContext.logout().then(() => {
      // Logout successful
      navigate("/login");
    });
  } catch (error) {
    console.log("Unexpected error during loggin out", error);
  }
}
export default Logout;
