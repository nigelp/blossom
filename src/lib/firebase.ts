import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDKMsiq-R2Jk8guwLEFFZaS8GKTfz0ZBX4",
  authDomain: "farm-run-7e546.firebaseapp.com",
  projectId: "farm-run-7e546",
  storageBucket: "farm-run-7e546.appspot.com",
  messagingSenderId: "955869614315",
  appId: "1:955869614315:web:3fdd59aad1bc4794a2aeae"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication
export const auth = getAuth(app);

// Initialize Cloud Firestore
export const db = getFirestore(app);

// Enable offline persistence
enableIndexedDbPersistence(db).catch((err) => {
  if (err.code === 'failed-precondition') {
    console.warn('Multiple tabs open, persistence can only be enabled in one tab at a time.');
  } else if (err.code === 'unimplemented') {
    console.warn('The current browser does not support offline persistence.');
  }
});

// Collection references
export const carsCollection = 'cars';
export const ridesCollection = 'rides';
export const rideRequestsCollection = 'rideRequests';
export const usersCollection = 'users';

export default app;