import { useAuth } from "./AuthProvider";
import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import Url from "../../config";

function Login() {
  const authContext = useAuth();
  const navigate = useNavigate();

  const userRef = useRef();
  const pwdRef = useRef();

  // ID token to the server
  async function includeIdTokenInRequest(user) {
    if (user) {
      try {
        // Retrieve the ID token
        const idToken = await user.getIdToken(/* forceRefresh */ true);

        // Include the ID token in the request to the server
        const serverResponse = await fetch(`${Url}/auth`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${idToken}`,
          },
        });
        if (!serverResponse.ok) {
          const errorMessage = await serverResponse.text();
          console.error(
            `Error during sending the  ID Token. Status: ${serverResponse.status}, Message: ${errorMessage}`
          );
          window.alert(errorMessage);
          return;
        }
      } catch (error) {
        console.error("Error including ID token in the request:", error);
      }
    }
  }

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

        includeIdTokenInRequest(userCredential.user); // Include ID token after successful login
        navigate("/home"); // Redirect after successful login
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
    <div className="login-container">
      <Link className="back-link" to="/">
        &#8592; Back
      </Link>
      <form className="form-login">
        <span>Login please</span>
        <input
          className="form-login-input"
          placeholder="youremail@email.com"
          type="text"
          ref={userRef}
        ></input>
        <input
          className="form-login-input"
          type="text"
          placeholder="password"
          ref={pwdRef}
        ></input>
        <button className="large-log-button" onClick={onAttemptLogin}>
          Login
        </button>
      </form>
      <Link to="/reset-password">Forgot my password</Link>
    </div>
  );
}

export default Login;
