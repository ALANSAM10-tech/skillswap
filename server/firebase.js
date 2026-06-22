/* global process */
import admin from 'firebase-admin';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env configuration from server/.env
dotenv.config({ path: path.join(__dirname, '.env') });

const { FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY } = process.env;

let firestoreDb = null;
let isFirebaseConnected = false;

if (FIREBASE_PROJECT_ID && FIREBASE_CLIENT_EMAIL && FIREBASE_PRIVATE_KEY) {
  try {
    const privateKey = FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n');
    
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: FIREBASE_PROJECT_ID,
        clientEmail: FIREBASE_CLIENT_EMAIL,
        privateKey: privateKey
      })
    });
    
    firestoreDb = admin.firestore();
    isFirebaseConnected = true;
    console.log('Successfully connected to Firebase Firestore!');
  } catch (error) {
    console.error('Failed to initialize Firebase Admin SDK:', error.message);
    console.log('Falling back to local JSON database.');
  }
} else {
  console.log('Firebase environment credentials not fully configured in server/.env.');
  console.log('Using local JSON files (products.json / orders.json) for database persistence.');
}

export { firestoreDb, isFirebaseConnected };
export default firestoreDb;
