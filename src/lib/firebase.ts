import { initializeApp } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";

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

// Only initialize analytics in production
let analytics = null;
if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
  import('firebase/analytics').then(({ getAnalytics }) => {
    analytics = getAnalytics(app);
  });
}

export { analytics };
export default app;