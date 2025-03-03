const admin = require('firebase-admin');
const dotenv = require('dotenv');

dotenv.config();

// Initialize the Firebase Admin SDK
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: `https://${process.env.FIREBASE_PROJECT_ID}.firebaseio.com`
});

// Export the Firestore database and auth for use in other files
const db = admin.firestore();
const auth = admin.auth();

module.exports = { admin, db, auth };