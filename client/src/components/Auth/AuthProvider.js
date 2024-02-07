import { useEffect, useContext, useState, createContext } from "react";
import { auth } from "./firebase/firebaseSetUp";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";

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

  function login(usr, pwd) {
    return signInWithEmailAndPassword(auth, usr, pwd);
  }

  function logout() {
    return signOut(auth);
  }

  function signup(usr, pwd) {
    return createUserWithEmailAndPassword(auth, usr, pwd);
  }

  useEffect(() => {
    // onAuthStateChanged returns unsubscribe function
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      try {
        if (user && user.id) {
          setCurrentUser((user) => setCurrentUser(user));
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
