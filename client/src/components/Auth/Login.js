import { useAuth } from "./AuthProvider";
import { useRef } from "react";
// import { redirect } from "react-router-dom";
import { useNavigate } from "react-router-dom";

function Login() {
  const authContext = useAuth();
  const navigate = useNavigate();

  const userRef = useRef();
  const pwdRef = useRef();

  const onAttemptLogin = async (e) => {
    e.preventDefault();

    try {
      // Sign In with Firebase
      const userCredential = await authContext.login(
        userRef.current.value,
        pwdRef.current.value
      );

      const user = userCredential.user;
      console.log("USER credentials", user);

      // Redirect after successful login
      navigate("/");
    } catch (error) {
      const errorCode = error.code;
      const errorMessage = error.message;
      console.error(
        `Error during Logging In. Code: ${errorCode}, Error Message: ${errorMessage}`
      );

      // Handle specific errors if needed
      if (
        errorCode === "auth/invalid-email" ||
        errorCode === "auth/invalid-credential"
      ) {
        // Show an alert for invalid email
        alert("Invalid credentials. Please check your credentials again.");
      } else {
        // Show a generic alert for other errors
        alert("An error occurred during login. Please try again.");
      }
    }
  };

  return (
    <div id="loginContainer">
      <span id="loginLabel">Login</span>
      <form>
        <input
          placeholder="youremail@email.com"
          type="text"
          ref={userRef}
        ></input>
        <input type="text" placeholder="password" ref={pwdRef}></input>
        <button className="loginBtn" onClick={onAttemptLogin}>
          Login
        </button>
      </form>
    </div>
  );
}

export default Login;
