
import { initializeApp } from "firebase/app";
import {getFirestore} from "firebase/firestore";
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import firestore from 'firebase/firestore'
//web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBhWZT1uKiXppxNNEOAJLZVBfD3jVak18M",
  authDomain: "nireekshanam-73a70.firebaseapp.com",
  databaseURL: "https://nireekshanam-73a70-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "nireekshanam-73a70",
  storageBucket: "nireekshanam-73a70.appspot.com",
  messagingSenderId: "731085512034",
  appId: "1:731085512034:web:b5023aeec797aca303e03b"
};

//Initialize Firebase
const app = initializeApp(firebaseConfig);

const auth = initializeAuth(app, {
    persistence: getReactNativePersistence(ReactNativeAsyncStorage)    
  });
const db=getFirestore(app);
export {auth,db}