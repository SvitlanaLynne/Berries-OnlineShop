import { useEffect, useContext, useState, createContext } from "react";
import { auth } from "./firebase/firebaseSetUp";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";

// set up initial context
const AuthContext = createContext({ userId: "", email: "" });

// use the provider
export function useAuth() {
  return useContext(AuthContext);
}

// provider
function AuthContextProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);

  const value = { currentUser, logout, login, signup };

  function login(usr, pwd) {
    signInWithEmailAndPassword(auth, usr, pwd);
  }
  function logout() {
    signOut(auth);
  }

  function signup(usr, pwd) {
    createUserWithEmailAndPassword(auth, usr, pwd);
  }

  useEffect(() => {
    // onAuthStateChanged returns unsubscribe function
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      try {
        if (user && user.id) {
          setCurrentUser({ userId: user.id, email: user.email });
        } else {
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
