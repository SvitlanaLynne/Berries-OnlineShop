import { useEffect, useContext, useState, createContext } from "react";
import { auth } from "./firebase/firebaseSetUp";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import Url from "../../config";

// set up initial context
const AuthContext = createContext(null);

// use the provider
export function useAuth() {
  return useContext(AuthContext);
}

// provider
function AuthContextProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);

  const value = { currentUser, logout, login, signup };

  // ID token to the server
  async function includeIdTokenInRequest(user) {
    if (user) {
      try {
        // Retrieve the ID token
        const idToken = await user.getIdToken(/* forceRefresh */ true);

        // Include the ID token in the request to the server
        const response = await fetch(`${Url}/auth`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${idToken}`,
          },
        });
        const data = await response.json();
        console.log("Server response:", data);
      } catch (error) {
        console.error("Error including ID token in the request:", error);
      }
    }
  }

  // LOGIN
  // function login(usr, pwd) {
  //   return signInWithEmailAndPassword(auth, usr, pwd);
  // }
  async function login(usr, pwd) {
    return signInWithEmailAndPassword(auth, usr, pwd).then((userCredential) => {
      includeIdTokenInRequest(userCredential.user); // Include ID token after successful login
    });
  }

  // LOGOUT
  function logout() {
    return signOut(auth);
  }

  // SIGNUP
  async function signup(usr, pwd) {
    return createUserWithEmailAndPassword(auth, usr, pwd).then(
      (userCredential) => {
        includeIdTokenInRequest(userCredential.user); // Include ID token after successful signup
      }
    );
  }

  useEffect(() => {
    // onAuthStateChanged returns a unsubscribe function
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      try {
        if (user && user.id) {
          setCurrentUser((user) => setCurrentUser(user));
          includeIdTokenInRequest(user);
        } else {
          console.log("No logged in users.");
          setCurrentUser(null);
        }
      } catch (error) {
        console.log("Error in onAuthStateChanged:", error);
      }
    });

    return () => unsubscribe();
  }, []);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthContextProvider;
