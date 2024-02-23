import { useState } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "./firebase/firebaseSetUp";
import { Link } from "react-router-dom";

function ResetPassword() {
  const [email, setEmail] = useState("");
  const [linkSent, setLinkSent] = useState(false);

  const handleEmailInput = (e) => {
    e.preventDefault();
    setEmail(e.target.value);
  };

  async function sendEmail() {
    if (email) {
      try {
        await sendPasswordResetEmail(auth, email);
        setLinkSent(true);
      } catch (error) {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.error(
          `Error during Password Reset. Code: ${errorCode}, Error Message: ${errorMessage}`
        );
      }
    } else {
      alert("Please enter your email");
    }
  }

  return (
    <div className="login-container">
      <Link className="back-link" to="/">
        &#8592; Back
      </Link>
      <form id="form-forgot-password">
        <input
          className="form-input"
          placeholder="Enter your email"
          onChange={handleEmailInput}
          disabled={linkSent} // Disable input if the link has been sent
        ></input>
        <button id="restore-pwd-button" onClick={sendEmail} disabled={linkSent}>
          Restore password
        </button>
      </form>

      {linkSent && <p>Password reset link sent to your email.</p>}
    </div>
  );
}

export default ResetPassword;
