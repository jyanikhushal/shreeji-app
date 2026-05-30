const { db } = require('./firebase');

const def_malik_phone = '9276807790';

async function loginGrahak(customerPhone) {
  const cleanedPhone = customerPhone.replace(/\D/g, '').slice(0, 10);
    console.log("Looking for:", cleanedPhone);
  const malikSnap = await db.collection('maliks').doc(def_malik_phone).get();

  if (!malikSnap.exists) {
    throw new Error('shop not available');
  }

  // ✅ direct lookup
  const customerRef = db.collection('maliks').doc(def_malik_phone).collection('customers').doc(cleanedPhone);
  const customerSnap = await customerRef.get();
console.log("Exists:", customerSnap.exists);
  if (!customerSnap.exists) {
    throw new Error('no customer exist');
  }

  const customer = customerSnap.data();

  return {
    role: 'grahak',
    name: customer.name,
    phone: customer.phone,
    
  };
}

module.exports = { loginGrahak };