const bcrypt=require('bcryptjs');
const {db}=require('./firebase');


async function loginMalik(phone,password){
    
const malikRef=db.collection('maliks').doc(phone);
const snap=await malikRef.get();

if(!snap.exists){
    throw new Error('Malik account not found');
}

const malik=snap.data();



const isMatch=await bcrypt.compare(password,malik.passwordHash);

if(!isMatch){
    throw new Error('Inavlid passowrd');
}

console.log("LOGIN SUCCESS: ",phone);
return {
    role:'malik',
    name:malik.name,
    phone:malik.phone,
    shopName:malik.shopName
};
}
module.exports={loginMalik};

// test the login by the below func

// (
//     async ()=>{
//         try{
//             const result=await loginMalik('9276807790','3569909700');
//             console.log('login successful:',result);

//         }
//         catch(err){
//             console.error('login fail:',err.message);
//         }
//     }
// )();