// Fast2SMS wrapper 
const sms_enabled=false; // set true when i am ready to spent on message service
const sendSMS=async(phone,message)=>{

    if(!sms_enabled){
        console.log(`[SMS DISABLED] To: ${phone} | Message: ${message}`);
        return { return: true };
    }

    const response=await fetch('https://www.fast2sms.com/dev/bulkV2',{ //my backend is calling fast2sms's backend saying pls send this message to this phone num
        method:'POST',
        headers:{
            'authorization':process.env.FAST2SMS_API_KEY, //  secret key for me from fast2sms which proves that req is coming from me
            'Content-Type':'application/json',
        },
        body:JSON.stringify({
            route:'v3',
            message:message,
            language:'unicode',
            flash:0,
            numbers:phone,
        }),
    });

    const data=await response.json();
    if(!data.return)throw new Error(data.message || 'SMS sending failed');
    return data;
};

module.exports={sendSMS};