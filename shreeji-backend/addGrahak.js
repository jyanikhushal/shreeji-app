const {db}=require('./firebase');

async function addGrahak(malikPhone, name, customerPhone){
    const malikSnap=await db.collection('maliks').doc(malikPhone).get();

    if(!malikSnap.exists){
        throw new Error('Malik not found');
    }

    const customerRef=db.collection('maliks').doc(malikPhone).collection('customers').doc(customerPhone)
    const customerSnap=await customerRef.get();

    if(customerSnap.exists){
        throw new Error('Grahak already exists');
    }

    await customerRef.set({
        name:name,
        
        phone:customerPhone,
        addedAt:new Date(),
        currentBalance:0,
        lastDepositAt:null,
    });

    console.log('customer added successfully');
}

module.exports={addGrahak};