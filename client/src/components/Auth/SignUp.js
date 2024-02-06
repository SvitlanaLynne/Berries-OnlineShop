import { useAuth } from "./AuthProvider";
import { useRef } from "react";
import { redirect } from "react-router-dom";

function SignUp() {
  const authContext = useAuth();
  const userRef = useRef();
  const pwdRef = useRef();

  const onAttemptSignUp = (e) => {
    e.preventDefault();

    // Sign up with firebase
    authContext
      .signup(userRef.current.value, pwdRef.current.value)
      .then((userCredential) => {
        const user = userCredential.user;
        console.log("USER credentials", user);
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.error(
          `Error during Signing Up. Code: ${errorCode}, Error Message: ${errorMessage}`
        );
      });

    redirect("/");
  };

  return (
    <div id="loginContainer">
      <span id="loginLabel">Sign Up</span>
      <form>
        <input
          placeholder="youremail@email.com"
          type="text"
          ref={userRef}
        ></input>
        <input type="text" placeholder="password" ref={pwdRef}></input>
        <button className="loginBtn" onClick={onAttemptSignUp}>
          Sign Up
        </button>
      </form>
    </div>
  );
}

export default SignUp;
