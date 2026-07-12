const { db } = require('../../firebase'); // adjust import to match your actual firebase.js export

async function getAvgDepositGapDays(malikPhone, customerPhone) {
  const entriesRef = db.collection(
    `maliks/${malikPhone}/customers/${customerPhone}/entries`
  );
  const snap = await entriesRef.where('type', '==', 'deposit').orderBy('date', 'asc').get();

  if (snap.empty) return null; // never deposited

  const dates = snap.docs.map((d) => d.data().date.toDate());
  if (dates.length === 1) return null; // only one deposit ever — no gap to average yet

  let totalGapDays = 0;
  for (let i = 1; i < dates.length; i++) {
    totalGapDays += (dates[i] - dates[i - 1]) / (1000 * 60 * 60 * 24);
  }
  return totalGapDays / (dates.length - 1);
}

module.exports = { getAvgDepositGapDays };