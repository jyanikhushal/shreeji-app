const {db}=require('./firebase');
const {sendSMS}=require('./utils/smsService');

// const def_malik_phone='9276807790';



async function addDepositEntry(malikPhone,customerPhone,depositAmount) {

    if(!malikPhone ||!customerPhone){
        throw new Error("MISSING MALIK OR CUSTOMER");
    }
     
    depositAmount=Number(depositAmount); // as sometimes frontend sends string
        if(depositAmount<=0){
            throw new Error('deposit amount must be positive');
        }

        // const khataRef=db.collection('running_khata').doc(def_malik_phone).collection(customerPhone);

        const khataRef=db.collection('maliks').doc(malikPhone).collection('customers').doc(customerPhone).collection('entries');  // collections are always in inverted commas

        const lastSnap=await khataRef.orderBy('entryNo','desc').limit(1).get();

        let nextEntryNo=1;
        let previousTotal=0;

        if(!lastSnap.empty){
            const last=lastSnap.docs[0].data();

            nextEntryNo=last.entryNo+1;
            previousTotal=last.total;
        }

        const newTotal=previousTotal-depositAmount;

        await khataRef.doc(String(nextEntryNo)).set({
            entryNo:nextEntryNo,
            date:new Date(),
            type:'deposit',
            description:`Deposit (${depositAmount})`,
            amount:-depositAmount,
            total:newTotal,
        });

        const depositDate=new Date();

        await db.collection('maliks').doc(malikPhone)
         .collection('customers').doc(customerPhone)
         .update({ currentBalance: newTotal, lastDepositAt: depositDate });

        console.log('Deposit entry added');

        
        const malikSnap=await db.collection("maliks").doc(malikPhone).get();
        const shopName=malikSnap.data()?.shopName || malikPhone;
        const depositMessage=  // this feature is not in use 
                 `નમસ્તે ગ્રાહક !!\n` +
                  `${shopName}\n\n` +
                  `*** જમા :- ₹${depositAmount} *** \n\n` +
                  `બિલ બાકી :- ₹${newTotal} \n\n` +
                  `કૃપા કરી જલ્દી જમા કરાવો\n` +
                  `ધન્યવાદ\n` +
                  `${shopName}`;

                  sendSMS(customerPhone,depositMessage).catch(err=>
                    console.error('[SMS] Deposit SMS failed:',err.message)
                  );
}
module.exports={addDepositEntry};

// test function 

// (
//     async()=>{
//             try{
//                 await addDepositEntry('8888888888',3);

//             }
//             catch(e){
//                 console.error(e.message);
//             }
//     }
// )();