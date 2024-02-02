import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { useRef } from "react";
import { redirect } from "react-router-dom";

function Login() {
  const auth = getAuth();
  const userRef = useRef();
  const pwdRef = useRef();

  const onAttemptLogin = (e) => {
    e.preventDefault();

    signInWithEmailAndPassword(
      //signInWithEmailAndPassword(auth, email, password)
      auth,
      userRef.current.value,
      pwdRef.current.value
    )
      .then((userCredential) => {
        // Signed in
        const user = userCredential.user;
        console.log("USER", user);
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.error(
          `Error Code: ${errorCode}, Error Message: ${errorMessage}`
        );
      });

    redirect("/home");
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
