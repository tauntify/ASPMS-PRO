import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// Hardcoded config for testing - NEW API KEY
const firebaseConfig = {
  apiKey: "AIzaSyBMdnPoo4HW8uNNdt2lbmjEbZ7vtbOwH1M",
  authDomain: "aspms-pro.firebaseapp.com",
  projectId: "aspms-pro",
  storageBucket: "aspms-pro.firebasestorage.app",
  messagingSenderId: "308846770044",
  appId: "1:308846770044:web:dca42fc84b8e79295996f9",
  measurementId: "G-5D1Q22B0YL",
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
