const { db } = require('../../firebase');

async function getGuest(phone) {
  const doc = await db.doc(`preorderGuests/${phone}`).get();
  return doc.exists ? doc.data() : null;
}

async function createGuestIfNotExists(phone) {
  const ref = db.doc(`preorderGuests/${phone}`);
  const doc = await ref.get();
  if (doc.exists) {
    return doc.data();
  }
  const guestData = {
    phone,
    name: null,
    createdAt: new Date().toISOString(),
  };
  await ref.set(guestData);
  return guestData;
}

async function setGuestName(phone, name) {
  const ref = db.doc(`preorderGuests/${phone}`);
  const doc = await ref.get();
  if (!doc.exists) {
    throw new Error('Guest not found');
  }
  if (doc.data().name) {
    // Name already set once — never overwritten again
    return doc.data();
  }
  await ref.update({ name });
  return { ...doc.data(), name };
}

module.exports = { getGuest, createGuestIfNotExists, setGuestName };