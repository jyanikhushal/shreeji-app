const {db}=require('./firebase');

async function test() {
    await db.collection('test').doc('ping').set({
        msg:'firebase connected',
        time:new Date(),
    });
    console.log('firestore write successful');
}

test();