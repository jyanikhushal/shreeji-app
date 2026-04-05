


// create API server
const express = require("express");
const cors = require("cors");
const {db}=require('./firebase'); //this was first required when i built api end point to get the list of shops in which grahak has khata in
const validatePhone=require("./middleware/validatePhone");
const validateAmount = require("./middleware/validateAmount");
// by all this i will be able to fetch the info from database not in frontend 
// by creating the server my frontend will be able to talk to database direclty via api endpoints
const { getRunningKhata } = require("./getRunningKhata");
const { addPurchaseEntry } = require("./addPurchaseEntry");
const { addDepositEntry } = require("./addDepositEntry");
const { editKhataEntry } = require("./editKhataEntry");
const {deleteKhataEntry}=require("./deleteKhataEntry");
const {loginMalik} =require("./authMalik"); // authGrahak is the file name in the backend folder and login grahak is the function name inside that file
const {addGrahak} = require("./addGrahak");
const {getGrahakList}=require("./getGrahakList");
const {loginGrahak}=require("./authGrahak");
const {signupMalik}=require("./signupMalik");
const {editGrahakName,editGrahakPhone}=require("./editGrahak");
const testImport=require("./signupMalik");
const { messaging } = require("firebase-admin");
console.log("IMPORT CHECK:",testImport);
const app = express();

app.use(cors());
app.use(express.json());
app.use((req,res,next)=>{
  console.log("REQUEST:", req.method, req.url);
  next();
});

// the below are the http get , put , push and delete functions . It means these functions calls the backend 

// API for sending server is on to uptimeRobot 
app.get('/health',(req,res)=>{
    res.status(200).json({status:'ok'});
});

// API : get ledger
app.get("/khata/:phone",validatePhone,async(req,res)=>{
    try{
        const {malikPhone}=req.query;
        const phone=req.params.phone;
        if(!malikPhone){
            return res.status(400).json({
                success:false,
                message:"MISSING MALIKPHONE"});
        }
        const data=await getRunningKhata(malikPhone,phone);

        return res.status(200).json({
            success:true,
            message:"Khata fetched successfuly",
            data:data
        }) // here my backend returns an array so front end code should have exactly "data" and not data.entries--> this is obj type 
         

    } catch(err){
        console.error("khata fetch error: ",err);
        return res.status(500).json({
            success:false,
            message:"Internal server error"
        });
        
    }
});


// API : add purchase --> i will change the handle enter function in the running khata page and so that on pressing enter -->post /khata/addPurchase-->backend calculates entryNo+total-->firestore updated-->frontend reloads ledger
app.post("/khata/addPurchase",validatePhone,validateAmount,async(req,res)=>{
    try{
        const{malikPhone,phone,item,amount}=req.body; // extract data from frontend and calls the business logic file addPurchaseEntry

        if(!malikPhone || !phone){
            return res.status(400).json({
                success:false,
                message:"Missing malikPhone or customerPhone"
            });
        }
       const result= await addPurchaseEntry(malikPhone,phone,item,amount);

        // res.json({message:"Purchase added",entry:result});

        return res.status(200).json({
            success:true,
            message:"Purchase entry added",
            data:result
        });

    }
    catch(err){
        console.error("purchase entry addition error",err);
        // res.status(500).json({error:err.message});
        return res.status(500).json({
            success:false,
            message:"Internal server error"
        });
    }
});

// API: add deposit

app.post("/khata/addDeposit",validatePhone,validateAmount,async(req,res)=>{
    try{
        console.log("DEPOSIT ROUTE HIT",req.body);
        const{malikPhone,phone,amount}=req.body;
        if(!malikPhone||!phone){
            return res.status(400).json({success:false,message:"MISSING MALIKPHONE OR CUSTOMER PHONE"});
        }
        await addDepositEntry(malikPhone,phone,amount);

        return res.status(200).json({success:true,message:"Deposit entry added"});
    }
    catch(err){
        console.error("Deposit entry not added",err);
        return res.status(500).json({success:false,message:"Internal server error"});
    }
});


// API : edit entry

app.put("/khata/edit",validatePhone,validateAmount,async(req,res)=>{
    try{

        console.log("EDIT ROUTE HIT", req.body);
        const{malikPhone,phone,entryNo,amount,description}=req.body;
        if(!malikPhone||!phone){
            return res.status(400).json({success:false,message:"missing malikPhone or customerPhone"});
        }
        await editKhataEntry(malikPhone,phone,entryNo,amount,description);

        return res.status(200).json({success:true,message:"Entry updated"});
    }
    catch(err){
        console.error("EDIT ERROR",err);
        res.status(500).json({success:false,message:"Internal server error"});
    }
});


//API : delete entry

app.delete("/khata/delete",validatePhone,async(req,res)=>{
    try{
        console.log("DELETE ROUTE HIT",req.body);
        const {malikPhone,phone,entryNo}=req.body;
        if (!malikPhone || !phone) {
            return res.status(400).json({ success:false,message: "Missing malikPhone or customerPhone" });
        }
        await deleteKhataEntry(malikPhone,phone,entryNo);

       return res.status(200).json({success:true,message:"Entry deleted"});

    }catch(err){
        console.error("DELETE ERROR",err);
        return res.status(500).json({success:false,message:err.message});}
});


// API : authMalik
app.post("/auth/malik",validatePhone, async (req,res)=>{

    console.log("AUTH API HIT", req.body);
    const { phone, password } = req.body;

    if(!phone){
        return res.status(400).json({
            success:false,
            message:"Missing malikPhone"
        })
    }
    try{
        

        const malik = await loginMalik(phone,password);

        res.status(200).json({
            success:true,
            message:"Login successful",
            data:malik
        });

    }catch(err){
        console.error("LOGIN ERROR:",err);

    // optional: if you add NOT_FOUND later
    if(err.message === "NOT_FOUND"){
        return res.status(400).json({
            success:false,
            message:"Invalid credentials"
        });
    }

    return res.status(500).json({
        success:false,
        message:"Internal server error"
    });
    }
});

// all the server API's are req,res type and all use async functions and all call the backend functions for fetching or updating or deleting the data from the database

// API: get grahak list
app.get("/grahak",validatePhone,async(req,res)=>{
    try{
         const {malikPhone}=req.query;
         if(!malikPhone){
            return res.status(400).json({success:false,message:"MISSING MALIKPHONE"});
         }

         const data=await getGrahakList(malikPhone);
        return res.status(200).json({
            success:true,
            message:"Grahak list fetch successful",
            data:data
        });
    }
    catch(err){
        console.error("Grahak list fetch error: ",err);
           res.status(500).json({success:false,message:"Internal server error"});
    }
});

// API: add grahak
app.post("/grahak/add",validatePhone,async(req,res)=>{
    try{
       const {malikPhone,name,phone}=req.body;
       console.log("REQ body: ",req.body);
       if (!malikPhone||!phone) {
            return res.status(400).json({success:false, message: "Missing malikPhone" });
        }
       await addGrahak(malikPhone,name,phone);

       return res.status(200).json({success:true,message:"Customer added",data:{phone,name}});
    }
    catch(err){
        console.error("Grahak addition error",err);
           return res.status(500).json({success:false,message:"Internal server error"});
    }
});

//API:editCustomerName
app.put("/grahak/editName",validatePhone,async(req,res)=>{
    try{
        const {malikPhone,phone,newName}=req.body;
        console.log("EDIT NAME ROUTE HIT:",req.body);
        if(!malikPhone||!phone){
            return res.status(400).json({success:false,message:"Missing malikphone or grahakphone"});
        }

        await editGrahakName(malikPhone,phone,newName);

        return res.status(200).json({success:true,message:"Customer Name changed success"});
    }
    catch(err){
        console.error("Customer Name change error",err);
        return res.status(500).json({success:false,message:"Internal Server error"});
    }
});

// API: edit customer phone (full khata migration)
app.put("/grahak/editPhone", validatePhone, async (req, res) => {
    try {
        const {malikPhone, oldPhone, newPhone} = req.body;
        console.log("EDIT PHONE ROUTE HIT", req.body);
        if (!malikPhone || !oldPhone || !newPhone) {
            return res.status(400).json({success: false, message: "Missing malikPhone, oldPhone or newPhone"});
        }
        await editGrahakPhone(malikPhone, oldPhone, newPhone);
        return res.status(200).json({success: true, message: "Customer phone updated"});
    } catch (err) {
        console.error("Edit phone error", err);
        return res.status(500).json({success: false, message: err.message || "Internal server error"});
    }
});



// API: authGrahak
app.post("/auth/grahak",validatePhone,async(req,res)=>{
    try{
        console.log("GRAHAK BODY:",req.body);
        const {phone}=req.body;
        if(!phone){
            return res.status(400).json({
                success:false,
                message:"Missing grahakPhone"
            });
        }
        const grahak = await loginGrahak(phone);

        res.status(200).json({
            success:true,
            message:"Grahak login Successful",
            data:grahak
        });
    }catch(err){
        console.error("Grahak Login ERROR:",err);
        // USER ERROR
        if(err.message==="NOT_FOUND"){
            return res.status(400).json({
            success:false,
            message:"Grahak not found"
        });}

        //Srever error
        return res.status(500).json({
            success:false,
            message:"Internal server error"
        });
    }
});


// API:SignupMalik

app.post("/signup/malik",validatePhone,async(req,res)=>{
    try{
        const{name,phone,password,shopName}=req.body;
        console.log("New malik's info",req.body);

        if(!phone){
           return res.status(400).json({
                success:false,
                message:"Missing malikPhone"
            });
        }
        await signupMalik(name,phone,password,shopName);

        res.status(200).json({
            success:true,
            message:"Signup successful",
            data:{
                name,
                phone,
                shopName
            }
        });
    }catch(err){
        console.error("signup error",err);
        res.status(400).json({
            success:false,
            message:err.message||"Signup failed"
        });
    }
});

// API: get shops in which a grahak has khata

app.get("/grahak/shops/:phone",validatePhone,async(req,res)=>{
    try{
        const phone=String(req.params.phone);

        if(!phone){
            return res.status(400).json({
                success:false,
                message:"Missing grahak phone"
            });
        }
        console.log("searching for grahak with phone:",phone);
        const maliksSnapshot=await db.collection("maliks").get();
        
        let shops=[];

        for(const malikDoc of maliksSnapshot.docs){ // loop all customers in all maliks then if in any malik's customer matches with our req customer phone then add that malik's name in the shops array to display it 
            const malikPhone=malikDoc.id;
            console.log("Checking malik:", malikPhone);
            console.log("Looking for customer:", phone);

            const customerDoc=await db.collection("maliks").doc(malikPhone).collection("customers").doc(phone).get();
             console.log("Exists?", customerDoc.exists);
            if(customerDoc.exists){
                const malikData=malikDoc.data();
                shops.push({
                    malikPhone,
                    shopName:malikData.shopName,
                    malikName:malikData.name
                });
            }
        }
        console.log("SHOPS FOUND:",shops);
        return res.status(200).json({
            success:true,
            message:"Shops fetch successful",
            data:shops
        });
    }catch(err){
        console.error("Error in shops API:",err);
        res.status(500).json({success:false,message:err.message});
    }
});


// // start server
// app.listen(5000,()=>{
//     console.log("Backend running on port 5000");
// });

// previously i used port 5000 as default but now as render assign ramdn free port ishould change code
const PORT=process.env.PORT || 5000;
app.listen(PORT,()=>{
    console.log(`Backend running on port${PORT}`);
});