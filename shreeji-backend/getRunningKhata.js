const {db}=require('./firebase');

async function getRunningKhata(malikPhone,customerPhone) {

  const khataRef=db
    .collection('maliks')
    .doc(malikPhone)
    .collection('customers')
    .doc(customerPhone)
    .collection('entries');

    const snap=await khataRef.orderBy('entryNo').get();

    if(snap.empty){
        return [];
    }

    const entries = snap.docs.map(doc => {
    const d = doc.data();

    let formattedDate = "";

    if (d.date && typeof d.date.toDate === "function") {
        formattedDate = d.date.toDate().toLocaleDateString("en-GB");
    }

    return {
        ...d,
        date: formattedDate
    };
});

    return entries;
}

module.exports={getRunningKhata};