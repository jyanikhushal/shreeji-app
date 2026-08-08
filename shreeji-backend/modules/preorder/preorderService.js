const { db } = require('../../firebase');

async function createPreorder(malikPhone, guestPhone, items) {
  const guestDoc = await db.doc(`preorderGuests/${guestPhone}`).get();
  const guestName = guestDoc.exists ? guestDoc.data().name : null;

  const ref = db.collection(`maliks/${malikPhone}/preorders`).doc();
  const now = new Date().toISOString();
  const preorderData = {
    id: ref.id,
    malikId: malikPhone,
    guestPhone,
    guestName,
    items,
    status: 'pending',
    createdAt: now,
    updatedAt: now,
    readyAt: null,
    collectedAt: null,
    savedAs: null,
    savedNames: null,
  };
  await ref.set(preorderData);
  return preorderData;
}

async function getQueue(malikPhone) {
  const snapshot = await db
    .collection(`maliks/${malikPhone}/preorders`)
    .where('status', 'in', ['pending', 'in_progress'])
    .orderBy('createdAt', 'desc')
    .get();
  return snapshot.docs.map((doc) => doc.data());
}

async function updateStatus(malikPhone, preorderId, newStatus) {
  const ref = db.doc(`maliks/${malikPhone}/preorders/${preorderId}`);
  const doc = await ref.get();
  if (!doc.exists) {
    throw new Error('Preorder not found');
  }
  const now = new Date().toISOString();
  const updates = { status: newStatus, updatedAt: now };
  if (newStatus === 'ready') {
    updates.readyAt = now;
  }
  await ref.update(updates);
  return { ...doc.data(), ...updates };
}

async function findKhataMatch(malikPhone, guestPhone) {
  const customerDoc = await db.doc(`maliks/${malikPhone}/customers/${guestPhone}`).get();
  if (!customerDoc.exists) {
    return null;
  }
  const data = customerDoc.data();
  return { khataRegisteredName: data.name || data.customerName || null };
}

async function finalizeSave(malikPhone, preorderId, savedAs, savedNames) {
  const ref = db.doc(`maliks/${malikPhone}/preorders/${preorderId}`);
  const doc = await ref.get();
  if (!doc.exists) {
    throw new Error('Preorder not found');
  }
  const now = new Date().toISOString();
  const updates = {
    status: 'collected',
    collectedAt: now,
    updatedAt: now,
    savedAs,
    savedNames: savedAs === 'khata' ? savedNames : null,
  };
  await ref.update(updates);
  return { ...doc.data(), ...updates };
}

async function getGuestPreorderStatus(malikPhone, guestPhone) {
  const snapshot = await db
    .collection(`maliks/${malikPhone}/preorders`)
    .where('guestPhone', '==', guestPhone)
    .where('status', 'in', ['pending', 'in_progress', 'ready'])
    .orderBy('createdAt', 'desc')
    .limit(1)
    .get();
  if (snapshot.empty) {
    return null;
  }
  return snapshot.docs[0].data();
}

async function getGuestOrderHistory(malikPhone, guestPhone) {
  const snapshot = await db
    .collection(`maliks/${malikPhone}/preorders`)
    .where('guestPhone', '==', guestPhone)
    .orderBy('createdAt', 'desc')
    .get();
  return snapshot.docs.map((doc) => doc.data());
}

module.exports = {
  createPreorder,
  getQueue,
  updateStatus,
  findKhataMatch,
  finalizeSave,
  getGuestPreorderStatus,
  getGuestOrderHistory,
};