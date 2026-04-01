const { db } = require('./firebase');

const def_malik_phone = '9276807790';

async function deleteKhataEntry(malikPhone,customerPhone, entryNo) {

    if (!malikPhone || !customerPhone) {
        throw new Error("Missing malik or customer");
    }
    const khataRef = db
        .collection('maliks')
        .doc(malikPhone)
        .collection('customers')
        .doc(customerPhone)
        .collection('entries');

    // get entry to delete
    const entryRef = khataRef.doc(String(entryNo));
    const entrySnap = await entryRef.get();

    if(!entrySnap.exists){
        throw new Error("Entry not found");
    }

    const entryData = entrySnap.data();
    const deletedAmount = Number(entryData.amount);

    // delete the entry
    await entryRef.delete();

    // get all future entries
    const futureSnap = await khataRef
        .where('entryNo','>',entryNo)
        .orderBy('entryNo')
        .get();

    const batch = db.batch();

    futureSnap.docs.forEach(doc => {

        const data = doc.data();

        const entryNoNum=Number(data.entryNo);
        const totalNum=Number(data.total);
        const amountNum=Number(data.amount);

        const newEntryNo = entryNoNum - 1;
        const newTotal = totalNum - deletedAmount;

        if(!newEntryNo||newEntryNo<1){
            throw new Error("Invalid newEntryNo during delete");
        }
        const newRef = khataRef.doc(String(newEntryNo));

        batch.set(newRef,{
            ...data,
            entryNo:newEntryNo,
            total:newTotal
        });

        batch.delete(doc.ref);

    });

    await batch.commit();

    console.log("Entry deleted and ledger corrected");
}

module.exports = { deleteKhataEntry };