const {db}=require('./firebase');

// const def_malik_phone='9276807790';

async function addGrahak(malikPhone,name,customerPhone){
    const malikSnap=await db.collection('maliks').doc(malikPhone).get();

    if(!malikSnap.exists){
        throw new Error('Malik not found');
    }

    // now if malik is found successfully then i need to open the customer register and then go to malik page and then in that new register i need to add a page of new customer
    // but also first check whether the customer which is being added already exist or not

    const customerRef=db.collection('maliks').doc(malikPhone).collection('customers').doc(customerPhone)
    const customerSnap=await customerRef.get();

    if(customerSnap.exists){
        throw new Error('Grahak already exists');
    }

    await customerRef.set({
        name:name,
        phone:customerPhone,
        addedAt:new Date(),
    });

    console.log('customer added successfully');
}

module.exports={addGrahak};

// test fucntion for above code

// (async ()=>{
//     try{
//         await addGrahak('Rameshbhai','7894661230');

//     } catch(err){
//         console.error('Failed to add customer:',err.message);
//     }
// }

// )();