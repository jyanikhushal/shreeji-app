const bcrypt=require('bcryptjs');
const {db}=require('./firebase');

async function signupMalik(name,phone,password,shopName){
    const malikRef=db.collection('maliks').doc(phone);
    const snap=await malikRef.get();
    console.log("SNAP EXISTS:",snap.exists);
    if(snap.exists){
        throw new Error('Malik already exist');
        
    }
    const passwordHash= await bcrypt.hash(password,10);

    await malikRef.set({
        name:name,
        phone:phone,
        passwordHash:passwordHash,
        shopName:shopName,
        createdAt:new Date(),
    });

    console.log('malik account created successfully');
}

module.exports={signupMalik};
/* ---- temporary test ---- */
// signupMalik('Shreeji Provision', '9276807790', '3569909700')
//   .catch(err => console.error(err.message));