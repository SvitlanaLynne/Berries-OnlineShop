import { redirect } from "react-router-dom";
import { useAuth } from "./AuthProvider";

function Logout() {
  const authContext = useAuth();

  authContext.logout();
  return redirect("/login");
}
export default Logout;
