
'use client';
export const dynamic = "force-dynamic";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/app/context/ToastContext";
import{getData} from "@/app/utils/api";
import { isSessionValid,clearSession } from "@/app/utils/session";
import {db} from '@/app/firebase';
import { onSnapshot,collection } from "firebase/firestore";

type Customer = {
    name: string;
    phone: string;
};
type Malik = {
    name: string;
    phone: string;
    shopName: string;
};
export default function MalikDashboardPage(){
  
  
    const {showMessage}=useToast();
    const router = useRouter();
    const [showAddCustomer, setShowAddCustomer] = useState(false);
   const [malik, setMalik] = useState<Malik | null>(null);
   useEffect(() => {
  const stored = localStorage.getItem("malik");

  if (stored && stored !== "undefined") {
    try {
      const parsed = JSON.parse(stored);

      // delay state update (avoids warning)
      setTimeout(() => {
        setMalik(parsed);
      }, 0);

    } catch {}
  }
}, []);
   
    // 🔐 Protect page
    useEffect(()=>{
        if(!isSessionValid("malik")){
          clearSession("malik");
          router.push("/login/malik");
        }
    },[]);

    //Periodic check for session expiry in every 1 minute
    useEffect(() => {
  const interval = setInterval(() => {
    if (!isSessionValid("malik")) {
      clearSession("malik");
      showMessage("error", "Session expired. Please login again.");
      router.push("/login/malik");
    }
  }, 60 * 1000); // check every 1 minute

  return () => clearInterval(interval);
}, []);

    // 📦 Customer list
    const [customers, setCustomers] = useState<Customer[]>([]);

     useEffect(() => { // ** replaced fetch customer useeffect with onsnapshot type eliminating try/catch block to ensure auto update of customer when new customer added
  const malikPhone = localStorage.getItem("malikPhone");
  if (!malikPhone) return;

  const customersRef = collection(db, 'maliks', malikPhone, 'customers');
  // No orderBy here — sort manually below
  const unsubscribe = onSnapshot(customersRef, (snapshot) => {
    const data = snapshot.docs.map(doc => ({
      ...doc.data()
    })) as unknown as Customer[];

    // Sort alphabetically in JS
    const sorted = data.sort((a, b) => a.name.localeCompare(b.name));
    setCustomers(sorted);
  }, (err) => {
    showMessage("error", err.message);
  });

  return () => unsubscribe();
}, []);

    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [searchText, setSearchText] = useState('');

    // usestate declarations for edit customer option 
    const [showRowMenu,setShowRowMenu]=useState(false);
    // const [showEditCustomer,setShowEditCustomer]=useState(false);
    const [selectedCustomer,setSelectedCustomer]=useState<Customer |null>(null);
    const [showEditName,setShowEditName]=useState(false);
    const [showEditPhone,setShowEditPhone]=useState(false);
    const [editPhone,setEditPhone]=useState('');
    const [editName,setEditName]=useState('');
    const [isEditing,setIsEditing]=useState(false);
    const resetForm=()=>{
      setName("");
      setPhone("");
    }
    // ➕ Add customer
    const addCustomer =async () => {
      
        if (!name || !phone) {
            showMessage("error",'Please fill all fields');
            return;
        }

        // phone no validation
        const isValidPhone=(phone:string):boolean=>{
          const cleaned=phone.trim();
          const phoneRegex=/^[6-9]\d{9}$/;
          return phoneRegex.test(cleaned);
        };

        if(!isValidPhone(phone)){
          showMessage("error","Enter valid phone number");
          return ;
        }

    try {
  const malikPhone = localStorage.getItem("malikPhone");

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/grahak/add`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      malikPhone,
      name,
      phone
    })
  });

  const addedCustomer = await getData<Customer>(res); // ✅ FIX

  if (!addedCustomer) {
    showMessage("error", "Invalid server response");
    return;
  }

  showMessage("success", "Customer added");

  resetForm();
  setShowAddCustomer(false);

  // as onsnapshot handles the auto update the list we can remove the manual code to refresh the list

  // // 🔄 refresh list
  // const updated = await fetch(
  //   `${process.env.NEXT_PUBLIC_API_URL}/grahak?malikPhone=${malikPhone}`
  // );

  // const updatedData = await getData<Customer[]>(updated, { expectArray: true });

  // const sorted = updatedData.sort((a, b) =>
  //   a.name.localeCompare(b.name)
  // );

  // setCustomers(sorted);

  router.push(`/dashboard/malik/khata?phone=${phone}`);

} catch (err: unknown) {
  console.error(err);

  if (err instanceof Error) {
    showMessage("error", err.message);
  } else {
    showMessage("error", "Check your Internet Connectivity");
  }

  resetForm();
}

        
    };



    // EDIT Customer Name only
    const editCustomerName=async()=>{ // this is only declaration of the editName function its usage will be in the ui code 
      if(!editName){
        showMessage("error","Please enter a name");
        return ;
      }

      if(!selectedCustomer)return;
      setIsEditing(true);
      try{
        const malikPhone=localStorage.getItem("malikPhone");
        const res=await fetch(`${process.env.NEXT_PUBLIC_API_URL}/grahak/editName`,{
          method:"PUT",
          headers:{"Content-Type":"application/json"},
          body:JSON.stringify({malikPhone,phone:selectedCustomer.phone,newName:editName}),
          
        });
        await getData(res);
        setCustomers(prev =>{
          const updated=prev.map(c=>
            c.phone===selectedCustomer.phone?{...c,name:editName}:c
          );

          return updated.sort((a,b)=>a.name.localeCompare(b.name));
        });
        showMessage("success","Name updated");
        setShowEditName(false);
        setSelectedCustomer(null);
        setEditName('');
        setIsEditing(false);
      }
      catch(err){
        console.error(err);
        showMessage("error","Failed to update name");
        setIsEditing(false);
      }

    };


// edit customer phone(full migration -->first creating new customer doc then copying the data of existing cus doc into new one and then deleting the existing doc)
   const editCustomerPhone=async()=>{
    const isValidPhone = (p: string) => /^[6-9]\d{9}$/.test(p.trim());
  if (!isValidPhone(editPhone)) { showMessage("error", "Enter valid phone number"); return; }
  if (!selectedCustomer) return;
 setIsEditing(true);
  try{
    const malikPhone=localStorage.getItem("malikPhone");
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/grahak/editPhone`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ malikPhone, oldPhone: selectedCustomer.phone, newPhone: editPhone }),
    });
    await getData(res);
    setCustomers(prev => {
      const updated = prev.map(c =>
        c.phone === selectedCustomer.phone ? { ...c, phone: editPhone } : c
      );
      return updated.sort((a, b) => a.name.localeCompare(b.name));
    });
    showMessage("success", "Phone number updated");
    setShowEditPhone(false);
    setSelectedCustomer(null);
    setEditPhone('');
    setIsEditing(false);
  }catch(err){
     console.error(err);
    showMessage("error", "Failed to update phone number");
    setIsEditing(false);
  }
   }

    // 🔍 Filter customers
    const filteredCustomers = customers.filter(
        (c) =>
            c.name.toLowerCase().includes(searchText.toLowerCase()) ||
            c.phone.includes(searchText)
    );
// Add this state at the top of your component (just before the return):
// const [showAddCustomer, setShowAddCustomer] = useState(false);
// Already assumed you'll add it above

if(!malik) return <div style={{minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'16px', color:'#6b7280'}}>Loading...</div>

return (
  <div style={{
    minHeight: '100vh',
    position: 'relative',
    padding: '1.5rem',
  }}>

    {/* ── BACKGROUND IMAGE ── */}
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 0,
      backgroundImage: "url('/swaminarayan img.jpg')",
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed',
    }} />

    {/* ── BACKGROUND OVERLAY (soft white tint so text stays readable) ── */}
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 1,
      background: 'rgba(255,255,255,0.18)',
    }} />

    {/* ── ALL CONTENT ABOVE BACKGROUND ── */}
    <div style={{ position: 'relative', zIndex: 2 }}>

      {/* ── HEADER ── */}
      <div style={{
        background: 'rgba(255,255,255,0.82)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '0.5px solid rgba(200,210,240,0.7)',
        borderRadius: '20px',
        padding: '1.25rem 1.5rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1.5rem',
      }}>
        <div style={{ display:'flex', alignItems:'center', gap:'14px' }}>
          <div style={{
            width: 52, height: 52, borderRadius: '14px',
            background: '#dbeafe',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
              <line x1="3" y1="6" x2="21" y2="6"/>
              <path d="M16 10a4 4 0 0 1-8 0"/>
            </svg>
          </div>
          <div>
            <p style={{ fontSize:'18px', fontWeight:600, color:'#1e3a8a', margin:0, lineHeight:1.2 }}>
              {malik?.shopName || 'My Shop'}
            </p>
            <p style={{ fontSize:'13px', color:'#6b7280', margin:'3px 0 0' }}>
              {malik?.name} &nbsp;·&nbsp; {malik?.phone}
            </p>
          </div>
        </div>

        {/* Right side buttons */}
        <div style={{ display:'flex', flexDirection:'column', alignItems:'stretch', gap:'8px', flexShrink:0 }}>
          <button
            onClick={()=>{ clearSession("malik"); router.push('/'); }}
            style={{
              padding:'8px 16px',
              background:'rgba(255,255,255,0.9)', color:'#dc2626',
              border:'1.5px solid #fca5a5', borderRadius:'10px',
              fontSize:'13px', fontWeight:500,
              cursor:'pointer',
              display:'flex', alignItems:'center', justifyContent:'center', gap:'7px',
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            Logout
          </button>

          <button
            onClick={() => { resetForm(); setShowAddCustomer(true); }}
            style={{
              padding:'8px 16px',
              background:'#2563eb', color:'white',
              border:'none', borderRadius:'10px',
              fontSize:'13px', fontWeight:600,
              cursor:'pointer',
              display:'flex', alignItems:'center', justifyContent:'center', gap:'7px',
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            New Customer
          </button>
        </div>
      </div>

      {/* ── CUSTOMER LIST ── */}
      <div style={{
        background: 'rgba(255,255,255,0.45)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        border: '1px solid rgba(255,255,255,0.6)',
        borderRadius: '24px',
        padding: '1.5rem',
        maxWidth: '380px',
        margin: '0',
        boxShadow: '0 8px 32px rgba(31,38,135,0.10)',
      }}>
        <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'1.2rem' }}>
          <div style={{
            width:36, height:36, borderRadius:'10px',
            background:'rgba(220,252,231,0.8)',
            display:'flex', alignItems:'center', justifyContent:'center',
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
          </div>
          <h2 style={{ fontSize:'16px', fontWeight:700, color:'#14532d', margin:0 }}>
            Customer List
          </h2>
          <span style={{
            marginLeft:'auto',
            background:'rgba(220,252,231,0.85)', color:'#166534',
            fontSize:'12px', fontWeight:600,
            padding:'3px 10px', borderRadius:'20px',
          }}>
            {filteredCustomers.length} total
          </span>
        </div>

        {/* Search */}
        <div style={{
          display:'flex', alignItems:'center', gap:'10px',
          border:'1.5px solid rgba(187,247,208,0.8)', borderRadius:'10px',
          padding:'0 14px', background:'rgba(255,255,255,0.7)',
          marginBottom:'14px',
          backdropFilter:'blur(8px)',
        }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            type="text"
            placeholder="Search by name or phone..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{
              flex:1, border:'none', outline:'none',
              fontSize:'14px', padding:'11px 0',
              background:'transparent', color:'#111827',
            }}
          />
        </div>

        {filteredCustomers.length === 0 && (
          <div style={{ textAlign:'center', padding:'2rem', color:'#374151', fontSize:'14px', fontWeight:500 }}>
            No customer found
          </div>
        )}

        <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
          {filteredCustomers.map((c) => (
            <div
              key={c.phone}
              onClick={() => router.push(`/dashboard/malik/khata?phone=${c.phone}`)}
              style={{
                display:'flex', alignItems:'center', justifyContent:'space-between',
                padding:'12px 16px',
                background:'rgba(255,255,255,0.55)',
                backdropFilter:'blur(12px)',
                WebkitBackdropFilter:'blur(12px)',
                border:'1px solid rgba(255,255,255,0.75)',
                borderRadius:'14px',
                cursor:'pointer',
                transition:'background 0.2s',
              }}
              onMouseEnter={e=>(e.currentTarget.style.background='rgba(224,242,254,0.75)')}
              onMouseLeave={e=>(e.currentTarget.style.background='rgba(255,255,255,0.55)')}
            >
              <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
                <div style={{
                  width:40, height:40, borderRadius:'50%',
                  background:'rgba(219,234,254,0.9)',
                  display:'flex', alignItems:'center', justifyContent:'center',
                  fontSize:'15px', fontWeight:700, color:'#1d4ed8', flexShrink:0,
                  border:'1.5px solid rgba(147,197,253,0.6)',
                }}>
                  {c.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p style={{ margin:0, fontSize:'15px', fontWeight:600, color:'#111827' }}>{c.name}</p>
                  <p style={{ margin:'2px 0 0', fontSize:'12px', color:'#4b5563' }}>{c.phone}</p>
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedCustomer(c);
                  setEditName(c.name);
                  setEditPhone(c.phone);
                  setShowRowMenu(true);
                }}
                style={{
                  background:'rgba(239,246,255,0.8)', border:'1px solid rgba(191,219,254,0.6)',
                  cursor:'pointer', padding:'7px',
                  borderRadius:8,
                  display:'flex', alignItems:'center', justifyContent:'center',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(219,234,254,0.9)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'rgba(239,246,255,0.8)')}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 20h9"/>
                  <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"/>
                </svg>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* ── ADD CUSTOMER POPUP ── */}
      {showAddCustomer && (
        <div style={{
          position:'fixed', inset:0, zIndex:9999,
          background:'rgba(0,0,0,0.45)',
          display:'flex', alignItems:'center', justifyContent:'center',
        }}>
          <div style={{
            background:'white', borderRadius:20, padding:28,
            width:340, boxShadow:'0 16px 48px rgba(0,0,0,0.2)',
          }}>
            <div style={{ display:'flex', justifyContent:'center', marginBottom:12 }}>
              <div style={{ width:48, height:48, borderRadius:14, background:'#dbeafe', display:'flex', alignItems:'center', justifyContent:'center' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <line x1="19" y1="8" x2="19" y2="14"/>
                  <line x1="16" y1="11" x2="22" y2="11"/>
                </svg>
              </div>
            </div>
            <h2 style={{ fontWeight:700, marginBottom:4, textAlign:'center', color:'#111', fontSize:17 }}>Add New Customer</h2>
            <p style={{ textAlign:'center', color:'#9ca3af', fontSize:13, marginBottom:20 }}>Enter the customer details below</p>
            <div style={{ marginBottom:12 }}>
              <label style={{ fontSize:'12px', fontWeight:500, color:'#6b7280', display:'block', marginBottom:5 }}>Customer Name</label>
              <div style={{ display:'flex', alignItems:'center', gap:10, border:'1.5px solid #bfdbfe', borderRadius:10, padding:'0 14px', background:'white' }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#93c5fd" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
                <input type="text" placeholder="Enter customer name" value={name} onChange={(e) => setName(e.target.value)}
                  style={{ flex:1, border:'none', outline:'none', fontSize:'15px', padding:'11px 0', background:'transparent', color:'#111827' }} />
              </div>
            </div>
            <div style={{ marginBottom:20 }}>
              <label style={{ fontSize:'12px', fontWeight:500, color:'#6b7280', display:'block', marginBottom:5 }}>Phone Number</label>
              <div style={{ display:'flex', alignItems:'center', gap:10, border:'1.5px solid #bfdbfe', borderRadius:10, padding:'0 14px', background:'white' }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#93c5fd" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.63 3.4 2 2 0 0 1 3.6 1.22h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.8a16 16 0 0 0 6.29 6.29l.96-.96a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
                </svg>
                <input type="text" placeholder="Enter phone number" value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))} maxLength={10}
                  style={{ flex:1, border:'none', outline:'none', fontSize:'15px', padding:'11px 0', background:'transparent', color:'#111827' }} />
              </div>
            </div>
            <div style={{ display:'flex', gap:10 }}>
              <button onClick={() => { setShowAddCustomer(false); setName(''); setPhone(''); }}
                style={{ flex:1, padding:'12px 0', border:'1px solid #e5e7eb', borderRadius:10, background:'white', color:'#6b7280', cursor:'pointer', fontSize:15, fontWeight:500 }}>
                Cancel
              </button>
              <button onClick={addCustomer}
                style={{ flex:1, padding:'12px 0', background:'#2563eb', color:'white', border:'none', borderRadius:10, cursor:'pointer', fontSize:15, fontWeight:700 }}>
                Add
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── ROW MENU POPUP ── */}
      {showRowMenu && (
        <div style={{ position:'fixed', inset:0, zIndex:9999, background:'rgba(0,0,0,0.45)', display:'flex', alignItems:'center', justifyContent:'center' }}>
          <div style={{ background:'white', borderRadius:16, padding:24, width:280, boxShadow:'0 16px 48px rgba(0,0,0,0.2)' }}>
            <h2 style={{ fontWeight:700, marginBottom:4, textAlign:'center', color:'#111', fontSize:16 }}>Customer Options</h2>
            <p style={{ textAlign:'center', color:'#9ca3af', fontSize:12, marginBottom:16 }}>{selectedCustomer?.name}</p>
            <button onClick={() => { setShowRowMenu(false); setShowEditName(true); }}
              style={{ width:'100%', marginBottom:8, padding:'11px 0', border:'1.5px solid #bfdbfe', borderRadius:10, background:'#eff6ff', color:'#1e40af', cursor:'pointer', fontSize:15, fontWeight:600, display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
              Edit Name
            </button>
            <button onClick={() => { setShowRowMenu(false); setShowEditPhone(true); }}
              style={{ width:'100%', marginBottom:8, padding:'11px 0', border:'1.5px solid #bbf7d0', borderRadius:10, background:'#f0fdf4', color:'#15803d', cursor:'pointer', fontSize:15, fontWeight:600, display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.63 3.4 2 2 0 0 1 3.6 1.22h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.8a16 16 0 0 0 6.29 6.29l.96-.96a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
              </svg>
              Edit Phone Number
            </button>
            <button onClick={() => { setShowRowMenu(false); setSelectedCustomer(null); }}
              style={{ width:'100%', padding:'11px 0', border:'1px solid #e5e7eb', borderRadius:10, background:'white', color:'#6b7280', cursor:'pointer', fontSize:14, fontWeight:500 }}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* ── EDIT NAME POPUP ── */}
      {showEditName && (
        <div style={{ position:'fixed', inset:0, zIndex:9999, background:'rgba(0,0,0,0.45)', display:'flex', alignItems:'center', justifyContent:'center' }}>
          <div style={{ background:'white', borderRadius:20, padding:28, width:340, boxShadow:'0 16px 48px rgba(0,0,0,0.2)' }}>
            <div style={{ display:'flex', justifyContent:'center', marginBottom:12 }}>
              <div style={{ width:48, height:48, borderRadius:14, background:'#dbeafe', display:'flex', alignItems:'center', justifyContent:'center' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
              </div>
            </div>
            <h2 style={{ fontWeight:700, marginBottom:4, textAlign:'center', color:'#111', fontSize:17 }}>Edit Name</h2>
            <p style={{ textAlign:'center', color:'#9ca3af', fontSize:13, marginBottom:20 }}>Change name for {selectedCustomer?.phone}</p>
            <div style={{ marginBottom:20 }}>
              <label style={{ fontSize:'12px', fontWeight:500, color:'#6b7280', display:'block', marginBottom:5 }}>Customer Name</label>
              <div style={{ display:'flex', alignItems:'center', gap:10, border:'1.5px solid #bfdbfe', borderRadius:10, padding:'0 14px', background:'white' }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#93c5fd" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
                <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)}
                  style={{ flex:1, border:'none', outline:'none', fontSize:'15px', padding:'11px 0', background:'transparent', color:'#111827' }} />
              </div>
            </div>
            <div style={{ display:'flex', gap:10 }}>
              <button onClick={() => { setShowEditName(false); setSelectedCustomer(null); }}
                style={{ flex:1, padding:'12px 0', border:'1px solid #e5e7eb', borderRadius:10, background:'white', color:'#6b7280', cursor:'pointer', fontSize:15, fontWeight:500 }}>
                Cancel
              </button>
              <button onClick={editCustomerName} disabled={isEditing}
                style={{ flex:1, padding:'12px 0', background: isEditing ? '#93c5fd' : '#2563eb', color:'white', border:'none', borderRadius:10, cursor: isEditing ? 'not-allowed' : 'pointer', fontSize:15, fontWeight:700, display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
                {isEditing ? (
                  <><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ animation:'spin 1s linear infinite' }}><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>Saving...</>
                ) : 'Change'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── EDIT PHONE POPUP ── */}
      {showEditPhone && (
        <div style={{ position:'fixed', inset:0, zIndex:9999, background:'rgba(0,0,0,0.45)', display:'flex', alignItems:'center', justifyContent:'center' }}>
          <div style={{ background:'white', borderRadius:20, padding:28, width:340, boxShadow:'0 16px 48px rgba(0,0,0,0.2)' }}>
            <div style={{ display:'flex', justifyContent:'center', marginBottom:12 }}>
              <div style={{ width:48, height:48, borderRadius:14, background:'#f0fdf4', display:'flex', alignItems:'center', justifyContent:'center' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.63 3.4 2 2 0 0 1 3.6 1.22h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.8a16 16 0 0 0 6.29 6.29l.96-.96a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
                </svg>
              </div>
            </div>
            <h2 style={{ fontWeight:700, marginBottom:4, textAlign:'center', color:'#111', fontSize:17 }}>Edit Phone Number</h2>
            <p style={{ textAlign:'center', color:'#9ca3af', fontSize:13, marginBottom:20 }}>All khata data will be migrated to new number</p>
            <div style={{ marginBottom:20 }}>
              <label style={{ fontSize:'12px', fontWeight:500, color:'#6b7280', display:'block', marginBottom:5 }}>New Phone Number</label>
              <div style={{ display:'flex', alignItems:'center', gap:10, border:'1.5px solid #bbf7d0', borderRadius:10, padding:'0 14px', background:'white' }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.63 3.4 2 2 0 0 1 3.6 1.22h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.8a16 16 0 0 0 6.29 6.29l.96-.96a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
                </svg>
                <input type="text" value={editPhone} onChange={(e) => setEditPhone(e.target.value.replace(/\D/g, ""))} maxLength={10}
                  style={{ flex:1, border:'none', outline:'none', fontSize:'15px', padding:'11px 0', background:'transparent', color:'#111827' }} />
              </div>
            </div>
            <div style={{ display:'flex', gap:10 }}>
              <button onClick={() => { setShowEditPhone(false); setSelectedCustomer(null); }}
                style={{ flex:1, padding:'12px 0', border:'1px solid #e5e7eb', borderRadius:10, background:'white', color:'#6b7280', cursor:'pointer', fontSize:15, fontWeight:500 }}>
                Cancel
              </button>
              <button onClick={editCustomerPhone} disabled={isEditing}
                style={{ flex:1, padding:'12px 0', background: isEditing ? '#86efac' : '#16a34a', color:'white', border:'none', borderRadius:10, cursor: isEditing ? 'not-allowed' : 'pointer', fontSize:15, fontWeight:700, display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
                {isEditing ? (
                  <><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ animation:'spin 1s linear infinite' }}><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>Saving...</>
                ) : 'Change'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>{/* end content wrapper */}
  </div>
);
}