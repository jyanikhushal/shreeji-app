const { db } = require('./firebase');
const { resolveTranslation } = require('./modules/productLanguage/productLanguageService');

async function addPurchaseEntry(malikPhone, customerPhone, itemName, price) {
  if (price <= 0) {
    throw new Error('Purchase should always be positive.');
  }

  const { gu: itemName_gu, hi: itemName_hi } = await resolveTranslation(itemName);

  const khataRef = db.collection('maliks').doc(malikPhone).collection('customers').doc(customerPhone).collection('entries');
  const lastSnap = await khataRef.orderBy('entryNo', 'desc').limit(1).get();

  let nextEntryNo = 1;
  let previousTotal = 0;
  if (!lastSnap.empty) {
    const last = lastSnap.docs[0].data();
    nextEntryNo = last.entryNo + 1;
    previousTotal = last.total;
  }

  const newTotal = previousTotal + price;
  const entryDate = new Date();

  await khataRef.doc(String(nextEntryNo)).set({
    entryNo: nextEntryNo,
    date: entryDate,
    type: 'purchase',
    description: itemName,
    description_gu: itemName_gu,
    description_hi: itemName_hi,
    amount: price,
    total: newTotal,
  });

  await db.collection('maliks').doc(malikPhone).collection('customers').doc(customerPhone)
    .update({ currentBalance: newTotal });

  return {
    entryNo: nextEntryNo,
    date: entryDate,
    description: itemName,
    description_gu: itemName_gu,
    description_hi: itemName_hi,
    amount: price,
    total: newTotal,
  };
}

module.exports = { addPurchaseEntry };