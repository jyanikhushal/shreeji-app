require('dotenv').config();
const { db } = require('./firebase');

const COLLECTION = 'productLanguage';
const BATCH_SIZE = 400;

async function deleteAll() {
  let totalDeleted = 0;

  while (true) {
    const snap = await db.collection(COLLECTION).limit(BATCH_SIZE).get();

    if (snap.empty) break;

    const batch = db.batch();
    snap.docs.forEach(doc => batch.delete(doc.ref));
    await batch.commit();

    totalDeleted += snap.size;
    console.log(`Deleted ${totalDeleted} so far...`);
  }

  console.log(`Done. Total deleted: ${totalDeleted}`);
}

deleteAll().catch(err => console.error('Delete failed:', err));