import { getFirestore } from "firebase/firestore";
import { initializeApp } from "firebase/app";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDpozq6TjPhlKUdrHhm18jy1H-JILAyMmE",
  authDomain: "house-marketplace-app-d5762.firebaseapp.com",
  projectId: "house-marketplace-app-d5762",
  storageBucket: "house-marketplace-app-d5762.appspot.com",
  messagingSenderId: "855784375680",
  appId: "1:855784375680:web:1d8a298b220bf5bf042d65"
};

// Initialize Firebase
initializeApp(firebaseConfig);

export const db = getFirestore();
