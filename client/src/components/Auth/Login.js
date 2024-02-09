import { useAuth } from "./AuthProvider";
import { useRef } from "react";
import { useNavigate } from "react-router-dom";
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

      // Wait for the authentication state to be updated
      // await new Promise((resolve) => setTimeout(resolve, 1000)); // Adjust the delay as needed

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
        <button className="backBtn" onClick={() => navigate("/reset-password")}>
          Forgot my password
        </button>
      </form>
    </div>
  );
}

export default Login;
