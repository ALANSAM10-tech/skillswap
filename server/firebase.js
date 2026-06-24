/* global process */
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
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
    // Replace escaped newlines in private key
    const privateKey = FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n');

    // Avoid re-initializing if already initialized (e.g. hot reload)
    const app = getApps().length === 0
      ? initializeApp({
          credential: cert({
            projectId: FIREBASE_PROJECT_ID,
            clientEmail: FIREBASE_CLIENT_EMAIL,
            privateKey: privateKey,
          }),
        })
      : getApps()[0];

    firestoreDb = getFirestore(app);
    isFirebaseConnected = true;
    console.log('Successfully connected to Firebase Firestore!');
  } catch (error) {
    console.error('Failed to initialize Firebase Admin SDK:', error.message);
    console.log('Falling back to local SQLite database.');
  }
} else {
  console.log('Firebase environment credentials not fully configured in server/.env.');
  console.log('Using local SQLite database for database persistence.');
}

export { firestoreDb, isFirebaseConnected };
export default firestoreDb;
