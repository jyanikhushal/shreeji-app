
//this func maintains the notification histroy for 30 days
const { db, admin } = require('../../firebase'); // adjust import to match your actual firebase.js export

async function writeHistoryEntry(malikPhone, customerPhone, type, content, createdAt = null) {
  const historyRef = db.collection(
    `maliks/${malikPhone}/customers/${customerPhone}/notifications`
  );
  await historyRef.add({
    type,
    title: content.title,
    body: content.body,
    createdAt: createdAt || admin.firestore.FieldValue.serverTimestamp(),
  });
}

async function pruneOldHistory(malikPhone, customerPhone) {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 30);

  const historyRef = db.collection(
    `maliks/${malikPhone}/customers/${customerPhone}/notifications`
  );
  const oldDocs = await historyRef.where('createdAt', '<', cutoff).get();

  if (oldDocs.empty) return;

  const batch = db.batch();
  oldDocs.forEach((doc) => batch.delete(doc.ref));
  await batch.commit();
}

module.exports = { writeHistoryEntry, pruneOldHistory };