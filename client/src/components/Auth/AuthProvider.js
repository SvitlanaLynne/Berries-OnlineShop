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
function useAuth() {
  return useContext(AuthContext);
}

// provider
function AuthContextProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const value = { currentUser, logout, login, signup, isAuthenticated };

  // LOGIN
  function login(usr, pwd) {
    return signInWithEmailAndPassword(auth, usr, pwd);
  }

  // LOGOUT
  function logout() {
    return signOut(auth);
  }

  // SIGNUP
  async function signup(usr, pwd) {
    return createUserWithEmailAndPassword(auth, usr, pwd);
  }

  useEffect(() => {
    // onAuthStateChanged returns a unsubscribe function
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      try {
        if (user && user.uid) {
          setCurrentUser((user) => setCurrentUser(user));
          setIsAuthenticated(true);
        } else {
          console.log("No logged in users.");
          setCurrentUser(null);
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.log("Error in onAuthStateChanged:", error);
      }
    });

    return () => unsubscribe();
  }, []);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export { AuthContextProvider, useAuth };
