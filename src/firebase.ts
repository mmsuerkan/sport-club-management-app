import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: 'AIzaSyCGMDxXRbCwHMFuhmOsMbtlnOUaMNu7_TA',
  authDomain: 'sportclubmanagement-447fe.firebaseapp.com',
  databaseURL: 'https://sportclubmanagement-447fe-default-rtdb.firebaseio.com',
  projectId: 'sportclubmanagement-447fe',
  storageBucket: 'sportclubmanagement-447fe.appspot.com',
  messagingSenderId: '468862978902',
  appId: '1:468862978902:web:1b28b1cf5fcceb0acb64f7',
  measurementId: 'G-3DPCSCQ9HK'
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
export const auth = getAuth(app);