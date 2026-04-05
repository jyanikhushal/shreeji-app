const {db}=require("./firebase");


async function editGrahakName(malikPhone,customerPhone,newName){
    const malikSnap=await db.collection("maliks").doc(malikPhone).get();
    if(!malikSnap.exists)throw Error("Malik not found");

    const customerRef=db.collection("maliks").doc(malikPhone).collection("customers").doc(customerPhone);

    const customerSnap=await customerRef.get();
    if(!customerSnap.exists)throw new Error("Customer not found");

    await customerRef.update({name:newName});
    console.log("Customer name updated successfully");
}


async function editGrahakPhone(malikPhone,oldPhone,newPhone) {
    const malikSnap = await db.collection("maliks").doc(malikPhone).get();
    if (!malikSnap.exists) throw new Error("Malik not found");

    // check old customer exists
    const oldCustomerRef = db.collection("maliks").doc(malikPhone)
        .collection("customers").doc(oldPhone);
    const oldCustomerSnap = await oldCustomerRef.get();
    if (!oldCustomerSnap.exists) throw new Error("Customer not found");

    // check new phone not already taken
    const newCustomerSnap = await db.collection("maliks").doc(malikPhone)
        .collection("customers").doc(newPhone).get();
    if (newCustomerSnap.exists) throw new Error("New phone already belongs to another customer");

    //1. create new customer
    const newCustomerRef=db.collection("maliks").doc(malikPhone).collection("customers").doc(newPhone);
    await newCustomerRef.set({
        name:oldCustomerSnap.data().name,
        phone:newPhone,
        addedAt:oldCustomerSnap.data().addedAt,
    });

    //2. now copy all khata entries to new doc one by one
    const khataSnap=await oldCustomerRef.collection("entries").get();
    if(!khataSnap.empty){
        const copyBatch=db.batch();
        khataSnap.forEach(doc=>{
            copyBatch.set(newCustomerRef.collection("entries").doc(doc.id),doc.data());
        });
        await copyBatch.commit();
    }


    //3.delete old khata entries
    if(!khataSnap.empty){
        const deleteBatch=db.batch();
        khataSnap.forEach(doc=>{
            deleteBatch.delete(oldCustomerRef.collection("entries").doc(doc.id));
        });
        await deleteBatch.commit();
    }

    //4. delete old customer doc
    await oldCustomerRef.delete();
}

module.exports={editGrahakName,editGrahakPhone};