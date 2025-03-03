import firebase from 'firebase/app';
import 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'YOUR_API_KEY',
  authDomain: 'YOUR_AUTH_DOMAIN',
  projectId: 'YOUR_PROJECT_ID',
  storageBucket: 'YOUR_STORAGE_BUCKET',
  messagingSenderId: 'YOUR_MESSAGING_SENDER_ID',
  appId: 'YOUR_APP_ID',
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
} else {
  firebase.app();
}

const db = firebase.firestore();

export const saveData = async (collection, data) => {
  try {
    const docRef = await db.collection(collection).add(data);
    console.log('Document written with ID: ', docRef.id);
  } catch (error) {
    console.error('Error adding document: ', error);
  }
};

// Example usage
saveData('exampleCollection', { name: 'John Doe', age: 30 });