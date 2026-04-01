const {db} =require("./firebase");

// const def_malik_phone='9276807790';

async function getGrahakList(malikPhone) {
    
    const ref=db.collection('maliks').doc(malikPhone).collection('customers');
    const snap=await ref.get();
    // const snap=await db
    // .collection('customer')
    // .doc(def_malik_phone)
    // .collection('list')
    // .get();
   console.log("FETCHING FROM:",malikPhone);
    if(snap.empty)return [];
    const customers=snap.docs.map(doc=>doc.data());
    console.log("Customer snap:",customers);
    // snap.forEach(doc=>{
    //     customers.push(doc.data());
    // });

    return customers;
}

module.exports={getGrahakList};