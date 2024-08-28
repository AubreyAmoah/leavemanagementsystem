// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCse7Nz0tmh_4_5qWGCDXjRqxC35e5Q77I",
  authDomain: "remotown-project.firebaseapp.com",
  projectId: "remotown-project",
  storageBucket: "remotown-project.appspot.com",
  messagingSenderId: "1084175387295",
  appId: "1:1084175387295:web:860f0c2dc7ebf64fb4b0aa",
  measurementId: "G-CTR6D5LHFP",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const googlProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
