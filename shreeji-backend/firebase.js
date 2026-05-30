const admin = require('firebase-admin');

// 🔍 DEBUG LOG
console.log("ENV CHECK:", {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKeyExists: !!process.env.FIREBASE_PRIVATE_KEY,
});

const rawKey = process.env.FIREBASE_PRIVATE_KEY;
const privateKey = rawKey
  .replace(/^"|"$/g, '')      // removes leading and trailing quote if present
  .replace(/\\n/g, '\n');     // converts \n literals to real newlines

admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: privateKey,
  }),
});

console.log("KEY START:", process.env.FIREBASE_PRIVATE_KEY.substring(0, 50));
console.log("HAS REAL NEWLINES:", process.env.FIREBASE_PRIVATE_KEY.includes('\n'));
console.log("HAS LITERAL \\n:", process.env.FIREBASE_PRIVATE_KEY.includes('\\n'));

const db = admin.firestore();

module.exports = { admin, db };