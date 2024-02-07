import { useState } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "./firebase/firebaseSetUp";
import { useNavigate } from "react-router-dom";

function ResetPassword() {
  const navigate = useNavigate();
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
    <>
      <input
        placeholder="Enter your email"
        onChange={handleEmailInput}
        disabled={linkSent} // Disable input if the link has been sent
      ></input>

      <button onClick={sendEmail} disabled={linkSent}>
        Restore password
      </button>

      {linkSent && <p>Password reset link sent to your email.</p>}

      <button className="backBtn" onClick={() => navigate("/")}>
        Back
      </button>
    </>
  );
}

export default ResetPassword;
