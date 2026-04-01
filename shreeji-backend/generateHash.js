const bcrypt=require("bcryptjs");

(async()=>{
    const password="mrkj05@IITISM";
    const hash=await bcrypt.hash(password,10);

    console.log("Your password:",password);
    console.log("Generated Hash:",hash);
})();