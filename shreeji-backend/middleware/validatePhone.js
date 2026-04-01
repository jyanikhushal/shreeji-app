const {isValidPhone}=require("../utils/validators");


const validatePhone=(req,res,next)=>{
    const{phone,malikPhone,customerPhone}=req.body||{};
    
    //check all possible phone fields
    if(phone && !isValidPhone(phone)){
        return res.status(400).json({message:"Invalid phone number"});
    }

    if(malikPhone && !isValidPhone(malikPhone)){
        return res.status(400).json({message:"Invalid malik phone number"});
    }

    if(customerPhone && !isValidPhone(customerPhone)){
        return res.status(400).json({message:"Invalid customer phone number"});
    }

    // sometimes phone also comes from query params like url
    const queryMalik=req.query?.malikPhone;
    const paramCustomer=req.params?.customerphone;

    if(queryMalik && !isValidPhone(queryMalik)){
        return res.status(400).json({ message: "Invalid malik phone (query)" });
    }

    if(paramCustomer &&!isValidPhone(paramCustomer)){
        return res.status(400).json({ message: "Invalid malik phone (param)" });
    }

    next(); // move back to actual api 
};

module.exports=validatePhone;