import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
    apiKey: "AIzaSyC0BgGCYIP6U8kAl_ktfgXmRwY8glCuKZ4",
    authDomain: "jlab-ebe8d.firebaseapp.com",
    projectId: "jlab-ebe8d",
    storageBucket: "jlab-ebe8d.appspot.com",
    messagingSenderId: "214847292598",
    appId: "1:214847292598:web:6a8a14bea75f3734531217"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);

export const getBlogs = async () => {
    const response = await fetch(`https://YOUR_PROJECT_ID.firebaseio.com/blogs.json`);
    const data = await response.json();
    return data;
};

export const addBlog = async (blog) => {
    const response = await fetch(`https://YOUR_PROJECT_ID.firebaseio.com/blogs.json`, {
        method: 'POST',
        body: JSON.stringify(blog),
        headers: {
            'Content-Type': 'application/json'
        }
    });
    return response.json();
};