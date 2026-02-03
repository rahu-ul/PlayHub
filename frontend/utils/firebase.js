// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
import {getAuth, GoogleAuthProvider} from "firebase/auth"
// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_APIKEY,
  authDomain: "auth-6c33c.firebaseapp.com",
  projectId: "auth-6c33c",
  storageBucket: "auth-6c33c.firebasestorage.app",
  messagingSenderId: "982579695538",
  appId: "1:982579695538:web:e997c944792f135d10deab"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const auth = getAuth(app)
const provider = new GoogleAuthProvider()

export {auth,provider}



// // Import the functions you need from the SDKs you need
// import { initializeApp } from "firebase/app";
// // TODO: Add SDKs for Firebase products that you want to use
// // https://firebase.google.com/docs/web/setup#available-libraries

// // Your web app's Firebase configuration
// const firebaseConfig = {
//   apiKey: import.meta.env.VITE_FIREBASE_APIKEY,
//   authDomain: "playhublogin-87e95.firebaseapp.com",
//   projectId: "playhublogin-87e95",
//   storageBucket: "playhublogin-87e95.firebasestorage.app",
//   messagingSenderId: "780219142944",
//   appId: "1:780219142944:web:d3c3e5f4a9fae6555afd45"
// };

// // Initialize Firebase
// const app = initializeApp(firebaseConfig);

// const auth = getAuth(app)
// const provider = new GoogleAuthProvider()

// export {auth,provider}