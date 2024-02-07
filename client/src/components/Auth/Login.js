import { useAuth } from "./AuthProvider";
import { useRef } from "react";
import { useNavigate } from "react-router-dom";

function Login() {
  const authContext = useAuth();
  const navigate = useNavigate();

  const userRef = useRef();
  const pwdRef = useRef();

  const onAttemptLogin = async (e) => {
    e.preventDefault();

    try {
      // Log in
      const userCredential = await authContext.login(
        userRef.current.value,
        pwdRef.current.value
      );

      // Check if successful before accessing credentials
      if (userCredential && userCredential.user) {
        const user = userCredential.user;
        const email = user.email;
        const emailVerified = user.emailVerified;
        console.log("EMAIL", email);
        console.log("emailVerified", emailVerified);

        // Redirect after successful login
        navigate("/home");
      } else {
        console.error("Unexpected response from Firebase:", userCredential);
        alert("An unexpected error occurred during login. Please try again.");
      }
    } catch (error) {
      const errorCode = error.code;
      const errorMessage = error.message;
      console.error(
        `Error during Logging In. Code: ${errorCode}, Error Message: ${errorMessage}`
      );

      // Handle specific errors
      if (
        errorCode === "auth/invalid-email" ||
        errorCode === "auth/invalid-credential"
      ) {
        alert("Invalid credentials. Please check your credentials again.");
      } else {
        alert("An error occurred during login. Please try again.");
      }
    }
  };

  return (
    <div id="loginContainer">
      <button onClick={() => navigate("/")}>Back</button>
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
        <button  className="backBtn" onClick={() => navigate("/reset-password")}>
          Forgot my password
        </button>
      </form>
    </div>
  );
}

export default Login;
