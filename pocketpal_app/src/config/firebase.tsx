// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { GoogleAuthProvider } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAuSgIWBIvOH3UoKDIHeM540zIaJOQDkH8",
    authDomain: "pocketpal-b94d0.firebaseapp.com",
    projectId: "pocketpal-b94d0",
    storageBucket: "pocketpal-b94d0.appspot.com",
    messagingSenderId: "977498474908",
    appId: "1:977498474908:web:bfaf7ca17c7288aa1a2059"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();