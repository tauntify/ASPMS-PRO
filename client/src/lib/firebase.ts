import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// Firebase config for NEW project (aspms-pro-v1)
const firebaseConfig = {
  apiKey: "AIzaSyCe_YMLorbVaqIfuolxh9ymYq5nF7KuGxk",
  authDomain: "aspms-pro-v1.firebaseapp.com",
  projectId: "aspms-pro-v1",
  storageBucket: "aspms-pro-v1.firebasestorage.app",
  messagingSenderId: "208076547094",
  appId: "1:208076547094:web:42e2a09624620a8ff58137",
  measurementId: "G-S6MXL58KP0",
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
