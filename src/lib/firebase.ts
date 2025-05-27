// src/lib/firebase.ts
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBz7k52x2yNrq3pwJ9uT-nNCR4mRYO_hmQ",
  authDomain: "carteira-ia-63b85.firebaseapp.com",
  projectId: "carteira-ia-63b85",
  storageBucket: "carteira-ia-63b85.appspot.com",
  messagingSenderId: "481329153553",
  appId: "1:481329153553:web:2a17372ea519672bf113b0",
  measurementId: "G-RNTZLNPMK7",
};

// ✅ só inicializa se ainda não estiver inicializado
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);
