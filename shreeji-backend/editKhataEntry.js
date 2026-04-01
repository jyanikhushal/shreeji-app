const {db}=require('./firebase');

const def_malik_phone='9276807790';

async function editKhataEntry(malikPhone,customerPhone,entryNo,newAmount,newDescription) {
  console.log("Edit inp:" ,malikPhone,customerPhone,entryNo,newAmount,newDescription);

  if(!malikPhone||!customerPhone){
    throw new Error("Missing malik or customer");
  }

  newAmount=Number(newAmount);
    const khataRef=db.collection('maliks').doc(malikPhone).collection('customers').doc(customerPhone).collection('entries');

    // getting the entry to be edited
    const entryRef=khataRef.doc(String(entryNo));
    const entrySnap=await entryRef.get();

    if(!entrySnap.exists){
        throw new Error('Entry not found');
    }

    // algo to change the wrong amt to correct amt
    const entryData=entrySnap.data();
    const oldAmount=entryData.amount;

    // for purchase and deposit its respective newAmount should be >0 and <0 by default
    const entryType=entryData.type;
    let finalAmount = newAmount;

if (entryType === 'purchase') {
  if (newAmount <= 0) {
    throw new Error('Purchase amount must be greater than zero');
  }
}

if (entryType === 'deposit') {
  if (newAmount <= 0) {
    throw new Error('Deposit amount must be greater than zero');
  }
  finalAmount = -newAmount; // 🔥 convert here
}



    const delta=finalAmount-oldAmount;

    // updating the wrong row only first
    let finalDescription;
    if(entryType==='deposit'){
      finalDescription=`Deposit(${newAmount})`;
    }else{
      finalDescription=newDescription??entryData.description;
    }
    await entryRef.update({
          amount:finalAmount,
          description:finalDescription,
          total:entryData.total+delta,
    });

    // now update all the further rows by db query     Learn to write the query

    const futureSnap=await khataRef.where('entryNo','>',entryNo).orderBy('entryNo').get();

    const batch=db.batch();

    futureSnap.docs.forEach(doc=> {
        const data=doc.data();
        const newTotal=data.total+delta;
        batch.update(doc.ref,{total:newTotal});
    });

    await batch.commit();
    console.log('khata entry edited and totals updated');



}

module.exports={editKhataEntry};

    // (
    //     async ()=>{
    //          try{
    //              await editKhataEntry('8888888888',2,8,'Rice corrected');
    //          }catch(e){
    //                  console.error(e.message);
    //          }
    //     }
    // )();    