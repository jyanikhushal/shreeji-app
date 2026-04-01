// REMEMBER ONE THING FRONTEND SHOULD ONLY RENDER THE DATA NOT DO ANY CALCULATION PART MY ALL THE HANDLER FUNCTIONS SHOULD ONLY CALL APIS. BACKEND SHOULD HANDLE ALL THE CALCULATIONS AND FRONEND SHOULD RERENDER THE DATA ONLY


/*
BACKEND WILL HANDLE -->
✔ purchase calculation
✔ deposit calculation
✔ edit recalculation
✔ delete recalculation
✔ entry numbering
*/

'use client';



import {useState,useRef,useEffect } from "react";
// useeffect is needed to load data from backend when page opens
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { useToast } from "@/app/context/ToastContext";
import {getData} from '@/app/utils/api';
type Customer = { // this is written for managing the strict typescript syntax
    name: string;
    phone: string;
};
type Entry = {
    entryNo: number;
    date: string;
    item: string;
    amount: string;
    total: number;
};
export default function RunningKhataPage(){
  const {showMessage}=useToast();
   const router=useRouter();
    useEffect(()=>{
    const malik = localStorage.getItem("malikPhone");

    if(!malik){
        router.push("/login/malik");
    }
},[]);


    const searchParams=useSearchParams();

    const customerPhone=searchParams.get('phone');

     // khata state
    const [entries,setEntries]=useState<Entry[]>([

        
        {
            entryNo:1,
            date:'01/02/2006',
            item:'',
            amount:'',
            total:0,
        },
    ]);
    
    const [loading,setLoading]=useState(false);
        const [error,setError]=useState('');
        const [isSubmitting,setIssubmitting]=useState(false); // add loading state so that when api is called that action cannot be done again to prevent duplicate action on twice clicking enter key quickly
    // fetch customer name from the db by using the phone number from the url
    const [customerName,setCustomerName]=useState('');


    const isValidAmount=(amount:string):boolean=>{
      if(!amount)return false;

      const num=Number(amount);

      if(isNaN(num))return false;
      if(num<=0)return false;
      if(num>100000)return false;

      return true;
    };

    useEffect(()=>{
        const fetchCustomer=async()=>{
            const malikPhone=localStorage.getItem("malikPhone");

            try{
                const res=await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL}/grahak?malikPhone=${malikPhone}`
                );
                const data = await getData<Customer[]>(res, { expectArray: true });

const customer = data.find((c) => c.phone === customerPhone);

if (customer) {
  setCustomerName(customer.name);
} else {
  showMessage("error", "Customer not found");
}
            }catch(err){
                console.error(err);
                if (err instanceof Error) {
                  showMessage("error", err.message);
                     } else {
                          showMessage("error", "Something went wrong");
                      }
            }
        };
        fetchCustomer();
    },[customerPhone]);

   // load ledger from backend when page opens
    async function loadKhata() { // load khata function
            try{
                const url = `${process.env.NEXT_PUBLIC_API_URL}/khata/${customerPhone}?malikPhone=${localStorage.getItem("malikPhone")}`;

console.log("FINAL URL:", url);

const res = await fetch(url);  

                type LedgerEntry = {
                  entryNo: number;
                  date: string|{ _seconds: number };
                  description: string;
                  amount: number|string;
                  total: number;
                };

                const data = await getData<LedgerEntry[]>(res, { expectArray: true });

                if(data.length>0){ // inintially when fetched the date comes like raw data send from firestore we need to convert it to DD/MM/YYYY
                   const formatted: Entry[] = data.map((entry: LedgerEntry) => {

    let formattedDate = "";

    if (typeof entry.date === "string") {
        formattedDate = entry.date;
    } 
    else if (entry.date && entry.date._seconds) {
        const jsDate = new Date(entry.date._seconds * 1000);

        const day = String(jsDate.getDate()).padStart(2, '0');
        const month = String(jsDate.getMonth() + 1).padStart(2, '0');
        const year = jsDate.getFullYear();

        formattedDate = `${day}/${month}/${year}`;
    }

    return {
        entryNo: entry.entryNo,
        date: formattedDate,   // 🔴 ALWAYS STRING
        item: entry.description || "",
        amount: String(entry.amount ?? ""),
        total: entry.total
    };
});

                    // also adding last empty row for new purchase addition
                    const last=formatted[formatted.length-1];
                    formatted.push({
                        entryNo:last.entryNo+1,
                        date:last.date,
                        item:'',
                        amount:'',
                        total:last.total
                    });
                    setEntries(formatted);
                }
                else{ 
                     const today = new Date();

            const day = String(today.getDate()).padStart(2,'0');
            const month = String(today.getMonth()+1).padStart(2,'0');
            const year = today.getFullYear();

            const todayStr = `${day}/${month}/${year}`;

            setEntries([
                {
                    entryNo: 1,
                    date: todayStr,
                    item: "",
                    amount: "",
                    total: 0
                }
            ]);
                }
            } catch(err){
                console.error("Error loading khata",err);
                showMessage("error","Error loading khata");
            }

        };
    useEffect(() => {

    if (!customerPhone) return;

    const fetchData = async () => {
        await loadKhata();
    };

    fetchData();

}, [customerPhone]);

   


    // deposit popup state
    const[showDeposit,setShowDeposit]=useState(false);  // declaring new variable showDeposit initially to false and using the useState hook to remember this varuiable and dynamically change the ui whenever the value of showDeposit changes and setshowDeposit is the function used to change the value of the showdeposit variab;e
    const[depositAmount,setDepositAmount]=useState('');



    // Row action state (onclicking on any row what should i get)
    const [selectedRow,setSelectedRow]=useState<number|null>(null);
    const [showRowMenu,setShowRowMenu]=useState(false);
    const[showDeleteConfirm,setShowDeleteConfirm]=useState(false);

    // Ref array for editing and editing state
    const itemInputRefs=useRef<(HTMLInputElement|null)[]>([]); //create a list of references to all rows (for items)
    const amountInputRefs=useRef<(HTMLInputElement|null)[]>([]); // ,,   ,,   ,,  ,,             ,,  ,,  (for amount)

    const[editingRow,setEditingRow]=useState<number  | null>(null);  // editingRow = null ->normal mode and editingRow=3 --> row 3 is in edit mode


   // handle typing in the item and amount cell (handleChange is a function that handle keystrokes from keyboard so we should not sent api call on each keystroke)
   const handleChange=(
    index:number,
    field:'item'|'amount',
    value:string
   ) =>{
    const updated=[...entries];
    updated[index][field]=value;
    setEntries(updated);
   };


   // handle enter key (add purchase) ( remember one thing when i just build the calculation algo locally then we write the logic directly in code but this logic doesnt call the backend so for calling the backend we need to have try and catch block )
   const handleEnter=async(index:number)=>{
    // if api is called then stop from recalling else set call to true
    if(isSubmitting)return;
    

    const current=entries[index];

    if(!current.item || !current.amount){
        showMessage("error",'Please fill item and amount');
        return;
    }
    const amountNum=Number(current.amount);
    if(!isValidAmount(current.amount)){
      showMessage('error',"Enter valid amount");
      return ;
    }
   setIssubmitting(true); // this function is for changing state to processing and should be activated after validation only in every place where needed
    try{
        setLoading(true);
        setError("");
        console.log("LOCAL STATE BEFORE API",entries);
       const res= await fetch(`${process.env.NEXT_PUBLIC_API_URL}/khata/addPurchase`,{
            method:"POST",
            headers:{
                "Content-Type":"application/json",
            },
            body:JSON.stringify({
                malikPhone:localStorage.getItem("malikPhone"),
                phone:customerPhone,
                item:current.item,
                amount:amountNum,
            }),
        });
        await getData(res);
        await loadKhata();
        // reload ledger from backend
        // const res=await fetch(`http://localhost:5000/khata/${customerPhone}`);
        // const data=await res.json();
        // setEntries(data);
    }
    catch(err){
        console.error(err);
        setError("failed to add purchase");
        showMessage("error","Failed to add purchase");
    }
    finally{
        setLoading(false);
        setIssubmitting(false);
    }
    
   };





/*  I HAVE KEPT ONE FUNCTION AS IT IS FOR LEARNING THAT WHENEVER WE BUILD FRONTEND AND CONNECTION TO BACKEND BY HHTP REQUEST IS NOT DONE THEN REACT LOCALLY DOES ALL THE CALCULATION WHICH IS LOST ON PAGE REFRESH SO WE CONNECT OUR FRONTEND TO THE BACKEND AND ASK BACKEND TO DO THE CALCULATION WORK BY REFERING TO THE DATA FROM DATABASE .. SO THE BACKEND DOES ALL THE CALCULATION PART AND UPDATE THE DATABASE AND FRONTEND BOTH REACT JUST DISPLAYS WHATEN=VER IS SENT BY THE SERVER NO CALCULATION PART



   // Deposit function logic
   const handleDepositConfirm=()=>{
    const dep=Number(depositAmount);

    if(isNaN(dep)||dep<=0){ // if deposit is not a numeric value or if its negative
        alert("Invalid deposit amount");
        return ;
    }

    const lastEntry=entries[entries.length-1]; // it finds last row of khata // still addition of new row is left
    const previousTotal=Number(lastEntry.total); // total that is written in the last row which is empty as of now but the grand total is written in the last 2 rows in our page at any time before enter is clicked
    const newTotal=previousTotal-dep;
    const updated=[...entries]; // creates a copy of entries(previous state)

    updated[updated.length-1]={ // updating and making the last empty row as deposit row
        entryNo:lastEntry.entryNo,
        date:'01/02/2006',
        item:`Deposit(${dep})`,
        amount:`-${dep}`,
        total:newTotal
    };

    updated.push({ // inserting new empty row
        entryNo:lastEntry.entryNo+1,
        date:'01/02/2026',
        item:'',
        amount:'',
        total:newTotal
    });

    setEntries(updated); // react now rerenders the table

    setDepositAmount(''); // making depositAmount null string again 
    setShowDeposit(false);  // closing of popup
   }



*/







// DEPOSIT LOGIC WITH BACKEND 
const handleDepositConfirm=async()=>{
   if(isSubmitting)return;
   
    const dep=Number(depositAmount);

   
 
    if (!isValidAmount(depositAmount)) {
  showMessage("error","Enter valid amount");
  setDepositAmount('');
  return;
}
setIssubmitting(true);
    try{
        setLoading(true);
        setError("");
       const res= await fetch(`${process.env.NEXT_PUBLIC_API_URL}/khata/addDeposit`,{
            method:"POST",
            headers:{
                "content-Type":"application/json"
            },
            body:JSON.stringify({
                malikPhone:localStorage.getItem("malikPhone"),
                phone:customerPhone,
               amount:dep
            })
        });
        await getData(res);
        await loadKhata();
        // const res=await fetch(`http://localhost:5000/khata/${customerPhone}`);
        // const data=await res.json();

        // setEntries(data);
        setDepositAmount(''); // making deposit amount null string again
        setShowDeposit(false); // clasing the popup of the deposit
    }catch(err){
        console.error(err);
        setError("deposit failed");
        showMessage("error","check your internet connection");
    }
    finally{
        setLoading(false);
        setIssubmitting(false);
    }
};



   // editing logic (handleEditAmount calls PUT/khata/edit and then backend recalculated totals and reload ledger  remember the backend calculatio pages are already written for all the functions now just we are removing the temporary frontend logic calculation we wrote while building the frontend and just connecting the frontend to backend logic page)
    const handleEditAmount=async(index:number,newAmount:string)=>{
      if (isSubmitting)return;
         
        console.log("edit triggered",index,newAmount);
         const row=entries[index];

         const amountNum=Number(newAmount);

         if (!isValidAmount(newAmount)) {
             showMessage("error","Enter valid amount");
              return;
             }
             setIssubmitting(true);

         try{
            setLoading(true);
            setError("");
           const res= await fetch(`${process.env.NEXT_PUBLIC_API_URL}/khata/edit`,{
                method:"PUT",
                headers:{"Content-Type":"application/json"},
                body:JSON.stringify({
                    malikPhone:localStorage.getItem("malikPhone"),
                    phone:customerPhone,
                    entryNo:row.entryNo,
                    amount:amountNum,
                    description:row.item
                })
            });
            await getData(res);
            await loadKhata();
            // reload ledger
            // const res=await fetch(`http://localhost:5000/khata/${customerPhone}`);
            // const data=await res.json();

            // setEntries(data);
         }catch(err){console.error(err); setError("Edit failed");}
         finally{setLoading(false); setIssubmitting(false);}
    };



    // deletion of row (calling backend not changing locally)
    const handleDeleteRow = async (index:number)=>{

    const row = entries[index];

    if(index===0){
        showMessage("error","First entry cannot be deleted");
        return;
    }

    if(index===entries.length-1){
        showMessage("error","Cannot delete active entry row");
        return;
    }

    try{
        setLoading(true);
        setError("");

       const res= await fetch(`${process.env.NEXT_PUBLIC_API_URL}/khata/delete`,{
            method:"DELETE",
            headers:{
                "Content-Type":"application/json"
            },
            body:JSON.stringify({
                malikPhone:localStorage.getItem("malikPhone"),
                phone:customerPhone,
                entryNo:row.entryNo
            })
        });
        await getData(res);
        await loadKhata();

        // reload ledger
        // const res = await fetch(`http://localhost:5000/khata/${customerPhone}`);
        // const data = await res.json();

        // setEntries(data);

    }catch(err){
        console.error(err);
        setError("Delete failed");
    }
    finally{
        setLoading(false);
    }
};

   // UI 
   useEffect(() => { // to freeze scrolling the back ledger when any of the popup are open
  if (showDeposit || showRowMenu || showDeleteConfirm) {
    document.body.style.overflow = 'hidden';
  } else {
    document.body.style.overflow = '';
  }
  return () => {
    document.body.style.overflow = '';
  };
}, [showDeposit, showRowMenu, showDeleteConfirm]);




 return (
  <div style={{
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #dbeafe 0%, #eff6ff 40%, #e0e7ff 100%)',
    padding: '1.25rem',
  }}>

    {/* ── PROCESSING / ERROR BANNER ── */}
    {loading && (
      <div style={{
        background: '#dbeafe', color: '#1e40af',
        borderRadius: 10, padding: '8px 16px',
        textAlign: 'center', fontSize: 14, fontWeight: 500,
        marginBottom: 12,
      }}>
        ⏳ Processing...
      </div>
    )}
    {error && (
      <div style={{
        background: '#fee2e2', color: '#dc2626',
        borderRadius: 10, padding: '8px 16px',
        textAlign: 'center', fontSize: 14, fontWeight: 500,
        marginBottom: 12,
      }}>
        {error}
      </div>
    )}

    {/* ── TOP BAR ── */}
    <div style={{
      background: 'rgba(255,255,255,0.88)',
      backdropFilter: 'blur(16px)',
      border: '0.5px solid rgba(200,210,240,0.7)',
      borderRadius: 20,
      padding: '1rem 1.25rem',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '1.25rem',
    }}>
      {/* Customer info */}
      <div style={{ display:'flex', alignItems:'center', gap: 12 }}>
        <div style={{
          width: 46, height: 46, borderRadius: '50%',
          background: '#dbeafe',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 18, fontWeight: 700, color: '#2563eb', flexShrink: 0,
        }}>
          {customerName.charAt(0).toUpperCase()}
        </div>
        <div>
          <p style={{ margin: 0, fontSize: 17, fontWeight: 600, color: '#1e3a8a' }}>
            {customerName}
          </p>
          <p style={{ margin: '2px 0 0', fontSize: 12, color: '#9ca3af' }}>
            {customerPhone}
          </p>
        </div>
      </div>

      {/* Right side: balance chip + deposit button */}
      <div style={{ display:'flex', alignItems:'center', gap: 10, flexShrink: 0 }}>

        {/* Current balance chip */}
        {entries.length > 0 && (
          <div style={{
            background: entries[entries.length-1].total > 0 ? '#fee2e2' : '#dcfce7',
            color: entries[entries.length-1].total > 0 ? '#dc2626' : '#16a34a',
            borderRadius: 20, padding: '5px 14px',
            fontSize: 13, fontWeight: 700,
          }}>
            ₹{entries[entries.length-1].total}
          </div>
        )}

        <button
          onClick={() => setShowDeposit(true)}
          style={{
            padding: '9px 18px',
            background: '#2563eb', color: 'white',
            border: 'none', borderRadius: 10,
            fontSize: 14, fontWeight: 600,
            cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 6,
          }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Deposit
        </button>
      </div>
    </div>

    {/* ── KHATA TABLE ── */}
    <div style={{
      background: 'rgba(255,255,255,0.88)',
      backdropFilter: 'blur(16px)',
      border: '0.5px solid rgba(200,210,240,0.7)',
      borderRadius: 20,
      overflow: 'hidden',
    }}>
      <table style={{ width:'100%', borderCollapse:'collapse', fontSize: 14 }}>
        <thead>
          <tr style={{ background: '#eff6ff' }}>
            {['#', 'Date', 'Item', 'Amount', 'Total'].map((h) => (
              <th key={h} style={{
                padding: '12px 10px',
                color: '#1e40af', fontWeight: 600, fontSize: 13,
                borderBottom: '1.5px solid #bfdbfe',
                textAlign: h === 'Amount' || h === 'Total' ? 'right' : 'center',
              }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {entries.map((row, index) => {
            const isEditing = editingRow === index;
            const isLastRow = index === entries.length - 1;
            const isDeposit = (row.item || '').startsWith('Deposit');
            const isDimmed = editingRow !== null && !isEditing;

            return (
              <tr
                key={row.entryNo}
                style={{
                  background: isEditing
                    ? '#fef9c3'
                    : isDeposit
                    ? '#f0fdf4'
                    : isLastRow
                    ? '#f8faff'
                    : 'white',
                  opacity: isDimmed ? 0.4 : 1,
                  borderBottom: '0.5px solid #e0e7ef',
                  transition: 'background 0.15s',
                }}
              >
                {/* Entry No */}
                <td
                  onClick={() => {
                    if (editingRow !== null) return;
                    if (isLastRow) return;
                    setSelectedRow(index);
                    setShowRowMenu(true);
                  }}
                  style={{
                    padding: '10px 10px',
                    textAlign: 'center',
                    cursor: isLastRow ? 'default' : 'pointer',
                    color: isLastRow ? '#d1d5db' : '#2563eb',
                    fontWeight: 600,
                    fontSize: 13,
                    userSelect: 'none',
                  }}
                >
                  {row.entryNo}
                </td>

                {/* Date */}
                <td style={{
                  padding: '10px 10px',
                  textAlign: 'center',
                  fontSize: 12,
                  color: '#9ca3af',
                  whiteSpace: 'nowrap',
                }}>
                  {row.date}
                </td>

                {/* Item */}
                <td style={{ padding: '6px 8px' }}>
                  <input
                    ref={(el) => { itemInputRefs.current[index] = el; }}
                    value={row.item}
                    disabled={isSubmitting||
                      (editingRow !== index &&
                        !(editingRow === null && isLastRow)) ||
                      isDeposit
                    }
                    onChange={(e) => handleChange(index, 'item', e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && editingRow === index) {
                        e.preventDefault();
                        amountInputRefs.current[index]?.focus();
                      }
                    }}
                    placeholder={isLastRow ? 'Type item...' : ''}
                    style={{
                      width: '100%',
                      border: 'none', outline: 'none',
                      background: 'transparent',
                      fontSize: 14,
                      color: isDeposit ? '#16a34a' : '#111827',
                      fontWeight: isDeposit ? 600 : 400,
                      padding: '6px 8px',
                      borderRadius: 6,
                    }}
                  />
                </td>

                {/* Amount */}
                <td style={{ padding: '6px 8px' }}>
                  <input
                    ref={(el) => { amountInputRefs.current[index] = el; }}
                    value={row.amount}
                    disabled={isSubmitting||
                      editingRow !== index &&
                      !(editingRow === null && isLastRow)
                    }
                    onChange={(e) => {
                        const value = e.target.value;

                          // allow only numbers + max 2 decimals
                          if (/^\d*\.?\d{0,2}$/.test(value)) {
                            handleChange(index, 'amount', value);
                        }
                         }}
                    onBlur={(e) => {
                      if (editingRow === index) handleEditAmount(index, e.target.value);
                    }}
                    onKeyDown={async (e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        if (editingRow === index) {
                          await handleEditAmount(index, e.currentTarget.value);
                          setEditingRow(null);
                        } else {
                          handleEnter(index);
                        }
                      }
                    }}
                    placeholder={isLastRow ? '0' : ''}
                    style={{
                      width: '100%',
                      border: 'none', outline: 'none',
                      background: 'transparent',
                      fontSize: 14, textAlign: 'right',
                      color: isDeposit ? '#16a34a' : '#111827',
                      fontWeight: isDeposit ? 600 : 400,
                      padding: '6px 8px',
                      borderRadius: 6,
                    }}
                  />
                </td>

                {/* Total */}
                <td style={{
                  padding: '10px 14px',
                  textAlign: 'right',
                  fontWeight: 700,
                  fontSize: 14,
                  color: row.total > 0 ? '#dc2626' : row.total < 0 ? '#16a34a' : '#9ca3af',
                  whiteSpace: 'nowrap',
                }}>
                  {row.total !== 0 || !isLastRow ? `₹${row.total}` : ''}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>

    {/* ── DEPOSIT POPUP ── */}
    {showDeposit && (
      <div style={{
        position:'fixed', inset:0, zIndex:9999,
        background:'rgba(0,0,0,0.45)',
        display:'flex', alignItems:'center', justifyContent:'center',
      }}>
        <div style={{
          background:'white', borderRadius:16, padding:28,
          width:300, boxShadow:'0 16px 48px rgba(0,0,0,0.2)',
        }}>
          {/* Icon */}
          <div style={{ display:'flex', justifyContent:'center', marginBottom:12 }}>
            <div style={{
              width:48, height:48, borderRadius:14,
              background:'#dcfce7',
              display:'flex', alignItems:'center', justifyContent:'center',
            }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
              </svg>
            </div>
          </div>

          <h2 style={{ fontWeight:700, marginBottom:4, textAlign:'center', color:'#111', fontSize:17 }}>
            Add Deposit
          </h2>
          <p style={{ textAlign:'center', color:'#9ca3af', fontSize:13, marginBottom:16 }}>
            Enter amount received from {customerName}
          </p>

          <input
            type="number"
            placeholder="₹ Enter amount"
            style={{
              width:'100%', marginBottom:16,
              padding:'11px 14px',
              border:'1.5px solid #bbf7d0', borderRadius:10,
              outline:'none', fontSize:16,
              color:'#111', boxSizing:'border-box',
            }}
            value={depositAmount}
            disabled={isSubmitting}
            onChange={(e) => setDepositAmount(e.target.value)}
            onWheel={(e) => e.currentTarget.blur()}
            onKeyDown={(e) => {
              if (e.key === 'ArrowUp' || e.key === 'ArrowDown') e.preventDefault();
            }}
          />

          <div style={{ display:'flex', gap:10 }}>
            <button
              onClick={() => setShowDeposit(false)}
              style={{
                flex:1, padding:'11px 0',
                border:'1px solid #e5e7eb', borderRadius:10,
                background:'white', color:'#6b7280',
                cursor:'pointer', fontSize:15, fontWeight:500,
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleDepositConfirm}
              style={{
                flex:1, padding:'11px 0',
                background:'#16a34a', color:'white',
                border:'none', borderRadius:10,
                cursor:'pointer', fontSize:15, fontWeight:700,
              }}
            >
              Confirm
            </button>
          </div>
        </div>
      </div>
    )}

    {/* ── ROW MENU POPUP ── */}
    {showRowMenu && (
      <div style={{
        position:'fixed', inset:0, zIndex:9999,
        background:'rgba(0,0,0,0.45)',
        display:'flex', alignItems:'center', justifyContent:'center',
      }}>
        <div style={{
          background:'white', borderRadius:16, padding:24,
          width:280, boxShadow:'0 16px 48px rgba(0,0,0,0.2)',
        }}>
          <h2 style={{ fontWeight:700, marginBottom:4, textAlign:'center', color:'#111', fontSize:16 }}>
            Row Options
          </h2>
          <p style={{ textAlign:'center', color:'#9ca3af', fontSize:12, marginBottom:16 }}>
            Entry #{selectedRow !== null ? entries[selectedRow]?.entryNo : ''}
          </p>

          <button
            onClick={() => {
              if (selectedRow !== null) {
                setEditingRow(selectedRow);
                setShowRowMenu(false);
                setTimeout(() => { itemInputRefs.current[selectedRow]?.focus(); }, 100);
              }
            }}
            style={{
              width:'100%', marginBottom:8, padding:'11px 0',
              border:'1.5px solid #bfdbfe', borderRadius:10,
              background:'#eff6ff', color:'#1e40af',
              cursor:'pointer', fontSize:15, fontWeight:600,
              display:'flex', alignItems:'center', justifyContent:'center', gap:8,
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
            Edit Row
          </button>

          <button
            onClick={() => {
              setShowRowMenu(false);
              setShowDeleteConfirm(true);
            }}
            style={{
              width:'100%', marginBottom:8, padding:'11px 0',
              border:'1.5px solid #fca5a5', borderRadius:10,
              background:'#fff1f2', color:'#dc2626',
              cursor:'pointer', fontSize:15, fontWeight:600,
              display:'flex', alignItems:'center', justifyContent:'center', gap:8,
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
              <path d="M10 11v6M14 11v6"/>
              <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
            </svg>
            Delete Row
          </button>

          <button
            onClick={() => setShowRowMenu(false)}
            style={{
              width:'100%', padding:'11px 0',
              border:'1px solid #e5e7eb', borderRadius:10,
              background:'white', color:'#6b7280',
              cursor:'pointer', fontSize:14, fontWeight:500,
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    )}

    {/* ── DELETE CONFIRM POPUP ── */}
    {showDeleteConfirm && (
      <div style={{
        position:'fixed', inset:0, zIndex:9999,
        background:'rgba(0,0,0,0.45)',
        display:'flex', alignItems:'center', justifyContent:'center',
      }}>
        <div style={{
          background:'white', borderRadius:16, padding:28,
          width:280, boxShadow:'0 16px 48px rgba(0,0,0,0.2)',
        }}>
          {/* Warning icon */}
          <div style={{ display:'flex', justifyContent:'center', marginBottom:12 }}>
            <div style={{
              width:48, height:48, borderRadius:14,
              background:'#fee2e2',
              display:'flex', alignItems:'center', justifyContent:'center',
            }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                <line x1="12" y1="9" x2="12" y2="13"/>
                <line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
            </div>
          </div>

          <h2 style={{ fontWeight:700, marginBottom:4, textAlign:'center', color:'#111', fontSize:17 }}>
            Delete Entry?
          </h2>
          <p style={{ textAlign:'center', color:'#9ca3af', fontSize:13, marginBottom:20 }}>
            This will permanently remove the entry and recalculate all totals.
          </p>

          <div style={{ display:'flex', gap:10 }}>
            <button
              onClick={() => setShowDeleteConfirm(false)}
              style={{
                flex:1, padding:'11px 0',
                border:'1px solid #e5e7eb', borderRadius:10,
                background:'white', color:'#6b7280',
                cursor:'pointer', fontSize:15, fontWeight:500,
              }}
            >
              Cancel
            </button>
            <button
              onClick={() => {
                if (selectedRow !== null) handleDeleteRow(selectedRow);
                setShowDeleteConfirm(false);
              }}
              style={{
                flex:1, padding:'11px 0',
                background:'#dc2626', color:'white',
                border:'none', borderRadius:10,
                cursor:'pointer', fontSize:15, fontWeight:700,
              }}
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    )}

  </div>
);
}








/*
some errors faced during testing of edit entry api(PUT/khata/edit)


During the testing of the **Edit Entry API (`PUT /khata/edit`)** in the Shreeji Provision Ledger System, several issues were encountered at both the **syntax level and the logical level**. The first error occurred due to a **variable name mismatch** inside `editKhataEntry.js`. The function parameters were defined as `newAmount` and `newDescription`, but inside the function the code attempted to log and use variables named `amount` and `description`. Since these variables were not defined in that scope, Node.js threw a **ReferenceError: amount is not defined**. This was fixed by replacing the incorrect variable names with the correct function parameters (`newAmount`, `newDescription`).

The second issue was a **request body mismatch between frontend and backend**. The frontend was sending `{ entry: row.entryNo }`, while the backend route expected `{ entryNo }`. As a result, `entryNo` became `undefined` in the backend, causing Firestore to attempt `doc("undefined")`, which produced the error **"Entry not found"**. This was corrected by changing the frontend request body to send `entryNo` instead of `entry`.

The third issue occurred during the Firestore update step. The backend attempted to update the document with `description: newDescription`, but the frontend did not always send a description value, causing `newDescription` to be `undefined`. Firestore does not allow `undefined` values in document updates, which produced the error **"Cannot use 'undefined' as a Firestore value"**. This was resolved by adding a safe fallback in the update logic:
`description: newDescription ?? entryData.description`, ensuring that if no new description is provided, the existing description is preserved.

After fixing these issues, the edit feature worked correctly: the API route was hit successfully, the entry was updated in Firestore, the **delta-based ledger recalculation logic updated the edited row and all subsequent totals using a batch update**, and the frontend reloaded the updated ledger without errors.






SOME MORE ERRORS FACED DATE AND USEFFECT ISSUES

During the development of the **Shreeji Provision Ledger System**, two additional frontend issues were encountered while integrating Firestore data with the Next.js ledger UI: **date formatting errors** and a **React useEffect warning related to state updates**.

The first issue appeared as **NaN/NaN/NaN** being displayed in the Date column of the ledger table. Investigation revealed that the frontend code assumed that the `date` field returned from Firestore would always be a **Firestore Timestamp object containing `_seconds`**, and the conversion logic used `new Date(entry.date._seconds * 1000)`. However, due to earlier development stages, some entries in the database stored the date as a **string (e.g., "05/03/2026")**, while newer entries stored it as a **Firestore Timestamp object**. When the code attempted to access `_seconds` on a string value, the result became `undefined`, which caused the JavaScript `Date` constructor to produce `NaN` values. The issue was resolved by implementing a **type guard check** before converting the date. The logic now checks whether `entry.date` is an object containing `_seconds`. If so, it converts the timestamp using `_seconds * 1000`; otherwise, it treats the value as a normal string date and constructs a Date object directly. Additionally, the TypeScript type definition for `date` was updated to support both formats (`{ _seconds: number } | string`). This ensured the UI could correctly render dates regardless of the stored format.

The second issue occurred in the **ledger loading mechanism**, where React displayed a warning: *“Calling setState synchronously within an effect can trigger cascading renders.”* This happened because the `loadKhata()` function, which internally called `setEntries()`, was being invoked directly inside the `useEffect` body. React flagged this pattern since repeated state updates inside an effect can potentially cause render loops. Although the logic itself was valid, the implementation needed to follow React’s recommended structure for asynchronous effects. The fix involved wrapping the asynchronous call inside an internal async function (or an async IIFE) within the `useEffect`. The updated structure ensures the effect initiates the async operation first and then updates the state only after the asynchronous data fetch completes. This removed the warning and aligned the component with React’s recommended side-effect pattern.

After applying these fixes, the ledger page successfully loads Firestore entries, formats dates consistently into `DD/MM/YYYY`, and synchronizes the UI state with the database without React lifecycle warnings.


*/