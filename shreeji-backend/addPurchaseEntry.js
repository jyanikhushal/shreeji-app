// const { Model } = require('firebase-admin/machine-learning');
const {db}=require('./firebase');

// const def_malik_phone='9276807790';

async function addPurchaseEntry(malikPhone,customerPhone,itemName,price) {

    if(price<=0){
        throw new Error('Purchase should always be positive.');
    }
    // const khataRef=db.collection('running_khata').doc(def_malik_phone).collection(customerPhone);

    const khataRef=db.collection('maliks').doc(malikPhone).collection('customers').doc(customerPhone).collection('entries');
    

    const lastSnap=await khataRef.orderBy('entryNo','desc').limit(1).get();

    let nextEntryNo=1;
    let previousTotal=0;

    if(!lastSnap.empty){
        const last=lastSnap.docs[0].data();
        nextEntryNo=last.entryNo+1;
        previousTotal=last.total;
    }

    const newTotal=previousTotal+price;

    await khataRef.doc(String(nextEntryNo)).set({
        entryNo:nextEntryNo,
        date:new Date(),
        type:'purchase',
        description:itemName,
        amount:price,
        total:newTotal,
    });

    console.log('Purchase entry added');

}

module.exports={addPurchaseEntry};