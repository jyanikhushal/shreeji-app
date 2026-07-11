const { db } = require('../firebase');
// this func is called one edit/delete entry case
// this func works on 2 customer parameters that are currentBalance and lastdepositat when any of this 2 change this func is called and it update the customer obj accordingly
async function recomputeCustomerSummary(malikPhone, customerPhone) {
    const khataRef = db
        .collection('maliks').doc(malikPhone)
        .collection('customers').doc(customerPhone)
        .collection('entries');

    // Latest entry overall -> current balance
    const lastEntrySnap = await khataRef.orderBy('entryNo', 'desc').limit(1).get();
    const currentBalance = lastEntrySnap.empty ? 0 : lastEntrySnap.docs[0].data().total;

    // Latest deposit entry -> last deposit date
    const lastDepositSnap = await khataRef
        .where('type', '==', 'deposit')
        .orderBy('entryNo', 'desc')
        .limit(1)
        .get();
    const lastDepositAt = lastDepositSnap.empty ? null : lastDepositSnap.docs[0].data().date;

    const customerRef = db
        .collection('maliks').doc(malikPhone)
        .collection('customers').doc(customerPhone);

    await customerRef.update({ currentBalance, lastDepositAt });
}

module.exports = { recomputeCustomerSummary };