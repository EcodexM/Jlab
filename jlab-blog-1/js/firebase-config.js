// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyC0BgGCYIP6U8kAl_ktfgXmRwY8glCuKZ4",
    authDomain: "jlab-ebe8d.firebaseapp.com",
    projectId: "jlab-ebe8d",
    storageBucket: "jlab-ebe8d.appspot.com",
    messagingSenderId: "214847292598",
    appId: "1:214847292598:web:6a8a14bea75f3734531217"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize Firestore
const db = firebase.firestore();

// Export for use in other files
window.db = db;
