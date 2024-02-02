import { initializeApp } from "firebase/app";
import firebaseConfig from "./firebaseConfig";
import firebaseui from "firebaseui";

const firebase = initializeApp(firebaseConfig);
const ui = new firebaseui.auth.AuthUI(firebase.auth());
