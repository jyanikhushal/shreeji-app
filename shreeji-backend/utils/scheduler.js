// its schedular that computes the current total for each customer in every 14 days and calls the sendSMS fucntion to sent the message

const cron=require('node-cron');
const {db}=require('../firebase');
const {sendSMS} =require('./smsService');
const test_mode=true;
const test_phone='9727691003';
const scheduler_enabled=false;

const startScheduler=()=>{

    if(!scheduler_enabled){
        console.log('[Scheduler] SMS scheduler is currently disabled.');
        return;
    }

    cron.schedule('0 10 */14 * *',async()=>{ // sms every 14 days at 10 am 
          console.log('[Scheduler] Running bi-weekly sms reminder....');

          try{
            const maliksSnap=await db.collection('maliks').get();

            for(const malikDoc of maliksSnap.docs){ // for every malik
                const malikPhone=malikDoc.id;
                const malikData=malikDoc.data();
                const shopName=malikData.shopName || 'Shreeji';

                const customerSnap=await db.collection("maliks").doc(malikPhone).collection('customers').get();

                for(const customerDoc of customerSnap.docs){ // for every customer
                    const customerPhone=customerDoc.id;
                     
                    if(test_mode && customerPhone!==test_phone)continue;
                    //get last entry by querying the entries section
                    const entriesSnap=await db.collection('maliks').doc(malikPhone).collection('customers').doc(customerPhone).collection('entries').orderBy('entryNo','desc').limit(1).get();

                    if(entriesSnap.empty)continue; // no entries added for that grahak yet

                    const rem=entriesSnap.docs[0].data().total || 0;

                    if(rem<=0)continue; //no dues

                    const message =
                                `શુભ સવાર ગ્રાહક !!\n` +
                                `${shopName}\n\n` +
                                `*** બિલ બાકી : ₹${rem} ***\n\n` +
                                `કૃપા કરી જલ્દી જમા કરાવો\n` +
                                `ધન્યવાદ\n` +
                                `${shopName}`;

                     try{
                        await sendSMS(customerPhone,message);
                        console.log(`[scheduler] SMS sent to ${customerPhone}`);
                     } catch(smsErr){
                        console.error(`[Schedular] SMS failed for ${customerPhone}:`,smsErr.message);
                     }
                                
        
                }

            }
            console.log('[Scheduler] Bi-weekly SMS run complete.');
          } catch(err){
            console.error('[Scheduler] fatal error during SMS run:',err.message);
          }
    });

    console.log('[Scheduler] Bi-weekly SMS scheduler started.');
};

module.exports={startScheduler};