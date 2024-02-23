import { useAuth } from "./AuthProvider";
import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

function SignUp() {
  const authContext = useAuth();
  const userRef = useRef();
  const pwdRef = useRef();
  const navigate = useNavigate();

  const onAttemptSignUp = async (e) => {
    e.preventDefault();

    try {
      // Sign Up
      await authContext.signup(userRef.current.value, pwdRef.current.value);

      // Redirect after successful sign-up
      navigate("/login");
    } catch (error) {
      const errorCode = error.code;
      const errorMessage = error.message;
      console.error(
        `Error during Sign Up. Code: ${errorCode}, Error Message: ${errorMessage}`
      );

      // Check the server response message
      if (errorMessage.includes("auth/email-already-in-use")) {
        // Show an alert for email already in use
        alert("Email is already in use. Please use a different email.");
      } else if (errorMessage.includes("auth/weak-password")) {
        // Show an alert for weak password
        alert("Password should be at least 6 characters.");
      } else {
        // Show a generic alert for other errors
        alert("An error occurred during sign-up. Please try again.");
      }

      // Do not redirect in case of an error
    }
  };

  return (
    <div className="login-container">
      <Link className="back-link" to="/">
        &#8592; Back
      </Link>
      <form className="form-login">
        <span>Sign Up please</span>
        <input
          className="form-input"
          placeholder="youremail@email.com"
          type="text"
          ref={userRef}
        ></input>
        <input
          className="form-input"
          type="text"
          placeholder="password"
          ref={pwdRef}
        ></input>
        <button className="large-log-button" onClick={onAttemptSignUp}>
          Sign Up
        </button>
      </form>
    </div>
  );
}

export default SignUp;
