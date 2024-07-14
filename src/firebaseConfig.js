// src/firebaseConfig.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: 'AIzaSyAyUySmW5SuCnf3mWVb7cArUhjX8ZeoZcw',
  authDomain: 'auto-guide-2.firebaseapp.com',
  projectId: 'auto-guide-2',
  storageBucket: 'auto-guide-2.appspot.com',
  messagingSenderId: '324873906598',
  appId: '1:324873906598:android:cc2f92ffe350faa18bc767',
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { auth, db, storage };
