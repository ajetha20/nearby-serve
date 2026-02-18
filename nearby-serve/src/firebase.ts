import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAnaxdnJ7ZM8fWlXVTMXLrlSp-UVOsvzCs",
  authDomain: "nearby-serve.firebaseapp.com",
  projectId: "nearby-serve",
  storageBucket: "nearby-serve.firebasestorage.app",
  messagingSenderId: "711028084455",
  appId: "1:711028084455:web:f7e865af84fcd791f01c42"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
