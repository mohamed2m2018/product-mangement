// src/firebaseConfig.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyCqsd1VawimgTDL56sPFUcOik6RPNup42M",
  authDomain: "manager-e825a.firebaseapp.com",
  databaseURL: "https://manager-e825a.firebaseio.com",
  projectId: "manager-e825a",
  storageBucket: "manager-e825a.appspot.com",
  messagingSenderId: "966714417198",
  appId: "1:966714417198:android:74483baf86c82c837c7fbf",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { auth, db, storage };
