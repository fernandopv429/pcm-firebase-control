import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyCZ1f-zNkRRQTGAScbUhY15IImJf91VY54",
  authDomain: "controle-de-manutencao-46fd5.firebaseapp.com",
  projectId: "controle-de-manutencao-46fd5",
  storageBucket: "controle-de-manutencao-46fd5.firebasestorage.app",
  messagingSenderId: "844353622767",
  appId: "1:844353622767:web:6a15e1a9dcf27485de811a",
  measurementId: "G-4NYYX06272"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const analytics = getAnalytics(app);

export default app;