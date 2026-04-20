// Firebase configuration and initialization
import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification,
  fetchSignInMethodsForEmail,
  updateProfile,
} from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyC0jPNJwAXtIAFLTdaXsy1v-r6ok6F2vHE",
  authDomain: "plantcareai108.firebaseapp.com",
  projectId: "plantcareai108",
  storageBucket: "plantcareai108.firebasestorage.app",
  messagingSenderId: "717699106850",
  appId: "1:717699106850:web:4f1ed072aaa0998452227b",
  measurementId: "G-GLY3B7LSYP",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth
export const auth = getAuth(app);

// Google provider
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });

// Sign in with Google popup
export const signInWithGoogle = () => signInWithPopup(auth, googleProvider);

// Sign out
export const logOut = () => signOut(auth);

// Email + password sign-in
export const signInWithEmail = (email: string, password: string) =>
  signInWithEmailAndPassword(auth, email, password);

// Create account with email + password, then send verification email
export const createAccountWithEmail = async (
  email: string,
  password: string,
  displayName: string
) => {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(cred.user, { displayName });
  await sendEmailVerification(cred.user);
  return cred;
};

// Resend verification email to current user
export const resendVerificationEmail = async () => {
  if (auth.currentUser && !auth.currentUser.emailVerified) {
    await sendEmailVerification(auth.currentUser);
  }
};

// Check if an email already has an account
export const checkEmailExists = (email: string) =>
  fetchSignInMethodsForEmail(auth, email);

export default app;
