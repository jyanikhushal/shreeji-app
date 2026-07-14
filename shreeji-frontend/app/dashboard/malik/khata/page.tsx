// REMEMBER ONE THING FRONTEND SHOULD ONLY RENDER THE DATA NOT DO ANY CALCULATION PART MY ALL THE HANDLER FUNCTIONS SHOULD ONLY CALL APIS. BACKEND SHOULD HANDLE ALL THE CALCULATIONS AND FRONEND SHOULD RERENDER THE DATA ONLY

'use client';

export const dynamic = "force-dynamic";

import {useState, useRef, useEffect, Suspense} from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/app/context/ToastContext"; // for Toast notification system which sense 3 type of notifications "error" , "success" ,"info"
import {getData} from '@/app/utils/api'; // this function takes data from the backend response and sends formatted data as it is expected by the frontend if frontend expects array type then it sends array else object type
import { isSessionValid,clearSession } from "@/app/utils/session";

type Customer = {
    name: string;
    phone: string;
};
type Entry = {
    entryNo: number;
    date: string;
    item: string;
    amount: string;
    total: number;
    pending?: boolean;
    awaitingResubmit?: boolean;
};






// ── INNER COMPONENT (all real logic lives here) ──
function RunningKhataInner(){
  const {showMessage} = useToast();
  const router = useRouter();

  // ✅ read phone from URL safely without useSearchParams
  const [customerPhone, setCustomerPhone] = useState<string|null>(null);

  useEffect(()=>{
    const sp = new URLSearchParams(window.location.search);
    setCustomerPhone(sp.get('phone'));
  },[]);
 // page protection
  useEffect(()=>{
    if (!isSessionValid("malik")) {
    clearSession("malik");
    router.push("/login/malik");
  }
  },[]);
  //Periodic session check
  useEffect(() => {
  const interval = setInterval(() => {
    if (!isSessionValid("malik")) {
      clearSession("malik");
      showMessage("error", "Session expired.Please login again.");
      router.push("/login/malik");
    }
  }, 60 * 1000); // check every 1 minute

  return () => clearInterval(interval);
}, []);

  const [entries, setEntries] = useState<Entry[]>([{
    entryNo:1,
    date:'01/02/2006',
    item:'',
    amount:'',
    total:0,
  }]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIssubmitting] = useState(false);
  const [customerName, setCustomerName] = useState('');

  const isValidAmount = (amount:string):boolean => {
    if(!amount) return false;
    const num = Number(amount);
    if(isNaN(num)) return false;
    if(num<=0) return false;
    if(num>100000) return false;
    return true;
  };

  const formatToday = () => {
  const d = new Date();
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
};

  useEffect(()=>{
    const fetchCustomer = async() => {
      const malikPhone = localStorage.getItem("malikPhone");
      try{
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/grahak?malikPhone=${malikPhone}`
        );
        const data = await getData<Customer[]>(res, { expectArray: true }); // here when frontend sends getdata request it also specifies the type of data it requires 
        const customer = data.find((c) => c.phone === customerPhone);
        if(customer){
          setCustomerName(customer.name);
        } else {
          showMessage("error", "Customer not found");
        }
      }catch(err){
        console.error(err);
        if(err instanceof Error){
          showMessage("error", err.message);
        } else {
          showMessage("error", "Something went wrong");
        }
      }
    };
    if(customerPhone) fetchCustomer();
  },[customerPhone]);

  async function loadKhata(): Promise<boolean>{
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

      if(data.length>0){
        const formatted: Entry[] = data.map((entry: LedgerEntry) => {
          let formattedDate = "";
          if(typeof entry.date === "string"){
            formattedDate = entry.date;
          } else if(entry.date && entry.date._seconds){
            const jsDate = new Date(entry.date._seconds * 1000);
            const day = String(jsDate.getDate()).padStart(2, '0');
            const month = String(jsDate.getMonth() + 1).padStart(2, '0');
            const year = jsDate.getFullYear();
            formattedDate = `${day}/${month}/${year}`;
          }
          return {
            entryNo: entry.entryNo,
            date: formattedDate,
            item: entry.description || "",
            amount: String(entry.amount ?? ""),
            total: entry.total
          };
        });

        const last = formatted[formatted.length-1];
        formatted.push({
          entryNo: last.entryNo+1,
          date: last.date,
          item: '',
          amount: '',
          total: last.total
        });
        setEntries(formatted);
      } else {
        const today = new Date();
        const day = String(today.getDate()).padStart(2,'0');
        const month = String(today.getMonth()+1).padStart(2,'0');
        const year = today.getFullYear();
        const todayStr = `${day}/${month}/${year}`;
        setEntries([{ entryNo:1, date:todayStr, item:"", amount:"", total:0 }]);
      }
      return true;
    } catch(err){
      console.error("Error loading khata", err);
      showMessage("error","Error loading khata");
      return false;
    }
  }

  useEffect(() => {
    if(!customerPhone) return;
    const fetchData = async () => { await loadKhata(); };
    fetchData();
  }, [customerPhone]);


  const [showDeposit, setShowDeposit] = useState(false);
  const [depositAmount, setDepositAmount] = useState('');
  const [selectedRow, setSelectedRow] = useState<number|null>(null);
  const [showRowMenu, setShowRowMenu] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const itemInputRefs = useRef<(HTMLInputElement|null)[]>([]);
  const amountInputRefs = useRef<(HTMLInputElement|null)[]>([]);
  const lastRowRef=useRef<HTMLTableRowElement | null>(null); // for auto scroll
  const [editingRow, setEditingRow] = useState<number|null>(null);

  // queue item
  type QueueItem = {
  id: number; // matches provisional entryNo, used to identify/cancel
  run: () => Promise<void>;
};

const submitQueueItemsRef = useRef<QueueItem[]>([]);
const queueRunningRef = useRef(false);
const queueValidRef = useRef(true); // flips false on failure, cancels remaining items
const [isResyncing, setIsResyncing] = useState(false);
const entriesRef = useRef<Entry[]>(entries);
useEffect(() => { entriesRef.current = entries; }, [entries]);
// queue runner
const runQueue = async () => {
  if(queueRunningRef.current) return; // already running, don't start a second runner
  queueRunningRef.current = true;
  while(submitQueueItemsRef.current.length > 0){
    if(!queueValidRef.current){
      // queue was invalidated by a failure — drop everything remaining
      submitQueueItemsRef.current = [];
      break;
    }
    const item = submitQueueItemsRef.current.shift()!;
    await item.run();
  }
  queueRunningRef.current = false;
};

const handleQueueFailure = async (failedEntryNo: number) => {
  if(!queueValidRef.current) return; // already being handled by another failure
  queueValidRef.current = false;
  submitQueueItemsRef.current = []; // drop anything not yet sent to the server

  showMessage("error", `Entry #${failedEntryNo} failed to save — please reconfirm from there`);
  setIsResyncing(true);

  // 1. Cache every row from the failed entry through the currently-live row
  const snapshot = entriesRef.current;
  const failIndex = snapshot.findIndex(r => r.entryNo === failedEntryNo);
  const cachedTail = failIndex === -1 ? [] : snapshot.slice(failIndex).map(r => ({ item: r.item, amount: r.amount }));

  // 2. Resync to server truth — retry until it actually succeeds.
  // If we proceed on a failed sync, the rebuild below would run on stale/unknown
  // state instead of confirmed server truth — that was the exact bug we hit.
  let synced = await loadKhata();
  let toldOffline = false;
  while(!synced){
    if(!toldOffline){
      showMessage("error", "No internet connection — will keep retrying");
      toldOffline = true;
    }
    await new Promise(resolve => setTimeout(resolve, 3000));
    synced = await loadKhata();
  }

  // 3. Strip loadKhata's own trailing blank row, rebuild the tail from cache
  setEntries(prev => {
    const confirmedPart = prev.slice(0, -1);
    const lastConfirmed = confirmedPart[confirmedPart.length - 1];
    let nextEntryNo = lastConfirmed ? lastConfirmed.entryNo + 1 : 1;
    const rowDate = lastConfirmed ? lastConfirmed.date : formatToday();

    const rebuiltTail: Entry[] = cachedTail.map((cached, i) => {
      const isLastCached = i === cachedTail.length - 1;
      return {
        entryNo: nextEntryNo++,
        date: rowDate,
        item: cached.item,
        amount: cached.amount,
        total: lastConfirmed ? lastConfirmed.total : 0,
        awaitingResubmit: isLastCached ? undefined : true,
      };
    });

    return [...confirmedPart, ...rebuiltTail];
  });

  queueValidRef.current = true;
  setIsResyncing(false);

  setTimeout(() => {
    const firstAwaitingIndex = entriesRef.current.findIndex(r => r.awaitingResubmit);
    if(firstAwaitingIndex !== -1){
      amountInputRefs.current[firstAwaitingIndex]?.focus();
    }
  }, 0);
};

  // useeffect to implement the auto scroll
useEffect(()=>{
  if(entries.length>0){
    lastRowRef.current?.scrollIntoView({behavior:'smooth',block:'end'});
  }
},[entries]);

  const handleChange = (index:number, field:'item'|'amount', value:string) => {
    const updated = [...entries];
    updated[index][field] = value;
    setEntries(updated);
  };

  // addPurchase entry logic
  const handleEnter = (index:number) => {
  const current = entries[index];
  if(!current.item || !current.amount){
    showMessage("error",'Please fill item and amount');
    return;
  }
  if(!isValidAmount(current.amount)){
    showMessage('error',"Enter valid amount");
    return;
  }
  if(index !== entries.length - 1) return; // only the active/last row can submit
  if(isResyncing) return; // Phase 6 guard, wired in now since it's a one-line check

  const amountNum = Number(current.amount);
  const previewTotal = current.total + amountNum;
  const provisionalEntryNo = current.entryNo;
  const todayStr = formatToday();
  const itemName = current.item;

  // 1. INSTANT UI UPDATE
  setEntries(prev => {
    const updated = [...prev];
    updated[index] = {
      entryNo: provisionalEntryNo,
      date: todayStr,
      item: itemName,
      amount: current.amount,
      total: previewTotal,
      pending: true,
    };
    updated.push({
      entryNo: provisionalEntryNo + 1,
      date: todayStr,
      item: '',
      amount: '',
      total: previewTotal,
    });
    return updated;
  });

  setTimeout(() => {
    itemInputRefs.current[index + 1]?.focus();
  }, 0);

  // 2. ENQUEUE the actual server call
  submitQueueItemsRef.current.push({
    id: provisionalEntryNo,
    run: async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/khata/addPurchase`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            malikPhone: localStorage.getItem("malikPhone"),
            phone: customerPhone,
            item: itemName,
            amount: amountNum,
          }),
        });
        const confirmed = await getData<{entryNo:number; date:string|{_seconds:number}; description:string; amount:number; total:number}>(res);

        if(!queueValidRef.current) return; // invalidated while this was in flight — skip touching state

        let confirmedDate = todayStr;
        if(confirmed.date && typeof confirmed.date !== 'string' && confirmed.date._seconds){
          const jsDate = new Date(confirmed.date._seconds * 1000);
          confirmedDate = `${String(jsDate.getDate()).padStart(2,'0')}/${String(jsDate.getMonth()+1).padStart(2,'0')}/${jsDate.getFullYear()}`;
        }

        // 3. RECONCILE by entryNo match
        setEntries(prev => prev.map(row =>
          row.entryNo === provisionalEntryNo && row.pending
            ? { entryNo: confirmed.entryNo, date: confirmedDate, item: confirmed.description, amount: String(confirmed.amount), total: confirmed.total }
            : row
        ));
      } catch(err){
        console.error(err);
        if(!queueValidRef.current) return; // already being handled by another failure
        await handleQueueFailure(provisionalEntryNo);
      }
    },
  });

  runQueue();
};

const handleResubmit = (index: number) => {
    const current = entries[index];
    if(!current.item || !current.amount){
      showMessage("error",'Please fill item and amount');
      return;
    }
    if(!isValidAmount(current.amount)){
      showMessage('error',"Enter valid amount");
      return;
    }
    if(isResyncing) return;

    const amountNum = Number(current.amount);
    const prevRow = entries[index - 1];
    const previewTotal = (prevRow ? prevRow.total : 0) + amountNum;
    const entryNo = current.entryNo;
    const todayStr = formatToday();
    const itemName = current.item;

    // mark this row pending, drop awaitingResubmit, fill in the provisional total
    setEntries(prev => prev.map((row, i) =>
      i === index
        ? { ...row, total: previewTotal, pending: true, awaitingResubmit: false }
        : row
    ));

    setTimeout(() => {
      const nextAwaiting = entriesRef.current.findIndex(r => r.awaitingResubmit);
      if(nextAwaiting !== -1){
        amountInputRefs.current[nextAwaiting]?.focus();
      }
    }, 0);

    submitQueueItemsRef.current.push({
      id: entryNo,
      run: async () => {
        try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/khata/addPurchase`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              malikPhone: localStorage.getItem("malikPhone"),
              phone: customerPhone,
              item: itemName,
              amount: amountNum,
            }),
          });
          const confirmed = await getData<{entryNo:number; date:string|{_seconds:number}; description:string; amount:number; total:number}>(res);

          if(!queueValidRef.current) return;

          let confirmedDate = todayStr;
          if(confirmed.date && typeof confirmed.date !== 'string' && confirmed.date._seconds){
            const jsDate = new Date(confirmed.date._seconds * 1000);
            confirmedDate = `${String(jsDate.getDate()).padStart(2,'0')}/${String(jsDate.getMonth()+1).padStart(2,'0')}/${jsDate.getFullYear()}`;
          }

          setEntries(prev => prev.map(row =>
            row.entryNo === entryNo && row.pending
              ? { entryNo: confirmed.entryNo, date: confirmedDate, item: confirmed.description, amount: String(confirmed.amount), total: confirmed.total }
              : row
          ));
        } catch(err){
          console.error(err);
          if(!queueValidRef.current) return;
          await handleQueueFailure(entryNo);
        }
      },
    });

    runQueue();
  };

  const handleDepositConfirm = async() => {
    if(isSubmitting) return;
    const dep = Number(depositAmount);
    if(!isValidAmount(depositAmount)){
      showMessage("error","Enter valid amount");
      setDepositAmount('');
      return;
    }
    setIssubmitting(true);
    try{
      setLoading(true);
      setError("");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/khata/addDeposit`,{
        method:"POST",
        headers:{"content-Type":"application/json"},
        body:JSON.stringify({
          malikPhone:localStorage.getItem("malikPhone"),
          phone:customerPhone,
          amount:dep
        })
      });
      await getData(res);
      await loadKhata();
      setDepositAmount('');
      setShowDeposit(false);
    } catch(err){
      console.error(err);
      setError("deposit failed");
      showMessage("error","check your internet connection");
    } finally{
      setLoading(false);
      setIssubmitting(false);
    }
  };

  const handleEditAmount = async(index:number, newAmount:string) => {
    if(isSubmitting) return; // for avoiding duplicate entry by blocking double click 
    console.log("edit triggered", index, newAmount);
    const row = entries[index];
    const amountNum = Number(newAmount);
    if(!isValidAmount(newAmount)){
      showMessage("error","Enter valid amount");
      return;
    }
    setIssubmitting(true);
    try{
      setLoading(true);
      setError("");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/khata/edit`,{
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
    } catch(err){
      console.error(err);
      setError("Edit failed");
    } finally{
      setLoading(false);
      setIssubmitting(false);
    }
  };

  const handleDeleteRow = async(index:number) => {
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
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/khata/delete`,{
        method:"DELETE",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({
          malikPhone:localStorage.getItem("malikPhone"),
          phone:customerPhone,
          entryNo:row.entryNo
        })
      });
      await getData(res);
      await loadKhata();
    } catch(err){
      console.error(err);
      setError("Delete failed");
    } finally{
      setLoading(false);
    }
  };

  useEffect(() => {
    if(showDeposit || showRowMenu || showDeleteConfirm){
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [showDeposit, showRowMenu, showDeleteConfirm]);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #dbeafe 0%, #eff6ff 40%, #e0e7ff 100%)',
      padding: '1.25rem',
    }}>

       {/* ── GAP COVER ── */}   {/* ✅ ADD HERE */}
  <div style={{
    position: 'fixed',
    top: 0, left: 0, right: 0,
    height: '1.25rem',        
    zIndex: 50,
    background: 'linear-gradient(135deg, #dbeafe 0%, #eff6ff 40%, #e0e7ff 100%)',
  }} />
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
        // keep the navbar intact at position
        position:'sticky',
        top:'1.5rem',
        zIndex:100,
      }}>
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

        <div style={{ display:'flex', alignItems:'center', gap: 10, flexShrink: 0 }}>
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
              const isEarliestAwaitingResubmit = row.awaitingResubmit &&
                entries.findIndex(r => r.awaitingResubmit) === index;

              return (
                <tr
                  key={row.entryNo}
                  ref={isLastRow?lastRowRef :null}
                  style={{
                    background: isEditing ? '#fef9c3' : isDeposit ? '#f0fdf4' : isLastRow ? '#f8faff' : 'white',
                    opacity: isDimmed ? 0.4 : 1,
                    borderBottom: '0.5px solid #e0e7ef',
                    transition: 'background 0.15s',
                  }}
                >
                  <td
                    onClick={() => {
                      if(editingRow !== null) return;
                      if(isLastRow) return;
                      setSelectedRow(index);
                      setShowRowMenu(true);
                    }}
                    style={{
                      padding: '10px 10px', textAlign: 'center',
                      cursor: isLastRow ? 'default' : 'pointer',
                      color: isLastRow ? '#d1d5db' : '#2563eb',
                      fontWeight: 600, fontSize: 13, userSelect: 'none',
                    }}
                  >
                    {row.entryNo}
                  </td>

                  <td style={{ padding: '10px 10px', textAlign: 'center', fontSize: 12, color: '#9ca3af', whiteSpace: 'nowrap' }}>
                    {row.date}
                  </td>

                  <td style={{ padding: '6px 8px' }}>
                    <input
                      ref={(el) => { itemInputRefs.current[index] = el; }}
                      value={row.item}
                      disabled={isSubmitting ||
                        (editingRow !== index && !(editingRow === null && isLastRow) && !isEarliestAwaitingResubmit) ||
                        isDeposit
                      }
                      onChange={(e) => handleChange(index, 'item', e.target.value)}
                      onKeyDown={(e) => {
                        if(e.key === 'Enter' && (editingRow === index || (editingRow === null && isLastRow))){
                          e.preventDefault();
                          amountInputRefs.current[index]?.focus();
                        }
                      }}
                      placeholder={isLastRow ? 'Type item...' : ''}
                      style={{
                        width: '100%', border: 'none', outline: 'none',
                        background: 'transparent', fontSize: 14,
                        color: isDeposit ? '#16a34a' : '#111827',
                        fontWeight: isDeposit ? 600 : 400,
                        padding: '6px 8px', borderRadius: 6,
                      }}
                    />
                  </td>

                  <td style={{ padding: '6px 8px' ,position:'relative' }}>
                    <input
                      ref={(el) => { amountInputRefs.current[index] = el; }}
                      value={row.amount}
                      disabled={isSubmitting ||
                        (editingRow !== index && !(editingRow === null && isLastRow) && !isEarliestAwaitingResubmit)
                      }
                      onChange={(e) => {
                        const value = e.target.value;
                        if(/^\d*\.?\d{0,2}$/.test(value)){
                          handleChange(index, 'amount', value);
                        }
                      }}
                      onBlur={(e) => {
                        if(editingRow === index) handleEditAmount(index, e.target.value);
                      }}
                      onKeyDown={async(e) => {
                        if(e.key === 'Enter'){
                          e.preventDefault();
                          if(editingRow === index){
                            await handleEditAmount(index, e.currentTarget.value);
                            setEditingRow(null);
                          } else if(row.awaitingResubmit){
                            if(!isEarliestAwaitingResubmit) return; // strict order guard
                            handleResubmit(index);
                          } else {
                            handleEnter(index);
                          }
                        }
                      }}
                      placeholder={isLastRow ? '0' : ''}
                      style={{
                        width: '100%', border: 'none', outline: 'none',
                        background: 'transparent', fontSize: 14, textAlign: 'right',
                        color: isDeposit ? '#16a34a' : '#111827',
                        fontWeight: isDeposit ? 600 : 400,
                        padding: '6px 8px', borderRadius: 6,
                      }}
                    />
                    {(row.pending || row.awaitingResubmit) && (
                      <span style={{
                        position: 'absolute',
                        top: 4, right: 4,
                        width: 7, height: 7,
                        borderRadius: '50%',
                        background: '#dc2626',
                      }} />
                    )}
                  </td>

                  <td style={{
                    padding: '10px 14px', textAlign: 'right',
                    fontWeight: 700, fontSize: 14,
                    color: row.total > 0 ? '#dc2626' : row.total < 0 ? '#16a34a' : '#9ca3af',
                    whiteSpace: 'nowrap',
                  }}>
                    {row.awaitingResubmit ? '' : (row.total !== 0 || !isLastRow ? `₹${row.total}` : '')}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ── DEPOSIT POPUP ── */}
      {showDeposit && (
        <div style={{ position:'fixed', inset:0, zIndex:9999, background:'rgba(0,0,0,0.45)', display:'flex', alignItems:'center', justifyContent:'center' }}>
          <div style={{ background:'white', borderRadius:16, padding:28, width:300, boxShadow:'0 16px 48px rgba(0,0,0,0.2)' }}>
            <div style={{ display:'flex', justifyContent:'center', marginBottom:12 }}>
              <div style={{ width:48, height:48, borderRadius:14, background:'#dcfce7', display:'flex', alignItems:'center', justifyContent:'center' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                </svg>
              </div>
            </div>
            <h2 style={{ fontWeight:700, marginBottom:4, textAlign:'center', color:'#111', fontSize:17 }}>Add Deposit</h2>
            <p style={{ textAlign:'center', color:'#9ca3af', fontSize:13, marginBottom:16 }}>Enter amount received from {customerName}</p>
            <input
              type="number"
              placeholder="₹ Enter amount"
              style={{ width:'100%', marginBottom:16, padding:'11px 14px', border:'1.5px solid #bbf7d0', borderRadius:10, outline:'none', fontSize:16, color:'#111', boxSizing:'border-box' }}
              value={depositAmount}
              disabled={isSubmitting}
              onChange={(e) => setDepositAmount(e.target.value)}
              onWheel={(e) => e.currentTarget.blur()}
              onKeyDown={(e) => { if(e.key==='ArrowUp'||e.key==='ArrowDown') e.preventDefault(); }}
            />
            <div style={{ display:'flex', gap:10 }}>
              <button onClick={() => setShowDeposit(false)} style={{ flex:1, padding:'11px 0', border:'1px solid #e5e7eb', borderRadius:10, background:'white', color:'#6b7280', cursor:'pointer', fontSize:15, fontWeight:500 }}>Cancel</button>
              <button onClick={handleDepositConfirm} style={{ flex:1, padding:'11px 0', background:'#16a34a', color:'white', border:'none', borderRadius:10, cursor:'pointer', fontSize:15, fontWeight:700 }}>Confirm</button>
            </div>
          </div>
        </div>
      )}

      {/* ── ROW MENU POPUP ── */}
      {showRowMenu && (
        <div style={{ position:'fixed', inset:0, zIndex:9999, background:'rgba(0,0,0,0.45)', display:'flex', alignItems:'center', justifyContent:'center' }}>
          <div style={{ background:'white', borderRadius:16, padding:24, width:280, boxShadow:'0 16px 48px rgba(0,0,0,0.2)' }}>
            <h2 style={{ fontWeight:700, marginBottom:4, textAlign:'center', color:'#111', fontSize:16 }}>Row Options</h2>
            <p style={{ textAlign:'center', color:'#9ca3af', fontSize:12, marginBottom:16 }}>Entry #{selectedRow !== null ? entries[selectedRow]?.entryNo : ''}</p>
            <button
              onClick={() => {
                if(selectedRow !== null){
                  setEditingRow(selectedRow);
                  setShowRowMenu(false);
                  setTimeout(() => { itemInputRefs.current[selectedRow]?.focus(); }, 100);
                }
              }}
              style={{ width:'100%', marginBottom:8, padding:'11px 0', border:'1.5px solid #bfdbfe', borderRadius:10, background:'#eff6ff', color:'#1e40af', cursor:'pointer', fontSize:15, fontWeight:600, display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
              Edit Row
            </button>
            <button
              onClick={() => { setShowRowMenu(false); setShowDeleteConfirm(true); }}
              style={{ width:'100%', marginBottom:8, padding:'11px 0', border:'1.5px solid #fca5a5', borderRadius:10, background:'#fff1f2', color:'#dc2626', cursor:'pointer', fontSize:15, fontWeight:600, display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6"/>
                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                <path d="M10 11v6M14 11v6"/>
                <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
              </svg>
              Delete Row
            </button>
            <button onClick={() => setShowRowMenu(false)} style={{ width:'100%', padding:'11px 0', border:'1px solid #e5e7eb', borderRadius:10, background:'white', color:'#6b7280', cursor:'pointer', fontSize:14, fontWeight:500 }}>Cancel</button>
          </div>
        </div>
      )}

      {/* ── DELETE CONFIRM POPUP ── */}
      {showDeleteConfirm && (
        <div style={{ position:'fixed', inset:0, zIndex:9999, background:'rgba(0,0,0,0.45)', display:'flex', alignItems:'center', justifyContent:'center' }}>
          <div style={{ background:'white', borderRadius:16, padding:28, width:280, boxShadow:'0 16px 48px rgba(0,0,0,0.2)' }}>
            <div style={{ display:'flex', justifyContent:'center', marginBottom:12 }}>
              <div style={{ width:48, height:48, borderRadius:14, background:'#fee2e2', display:'flex', alignItems:'center', justifyContent:'center' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                  <line x1="12" y1="9" x2="12" y2="13"/>
                  <line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>
              </div>
            </div>
            <h2 style={{ fontWeight:700, marginBottom:4, textAlign:'center', color:'#111', fontSize:17 }}>Delete Entry?</h2>
            <p style={{ textAlign:'center', color:'#9ca3af', fontSize:13, marginBottom:20 }}>This will permanently remove the entry and recalculate all totals.</p>
            <div style={{ display:'flex', gap:10 }}>
              <button onClick={() => setShowDeleteConfirm(false)} style={{ flex:1, padding:'11px 0', border:'1px solid #e5e7eb', borderRadius:10, background:'white', color:'#6b7280', cursor:'pointer', fontSize:15, fontWeight:500 }}>Cancel</button>
              <button
                onClick={() => {
                  if(selectedRow !== null) handleDeleteRow(selectedRow);
                  setShowDeleteConfirm(false);
                }}
                style={{ flex:1, padding:'11px 0', background:'#dc2626', color:'white', border:'none', borderRadius:10, cursor:'pointer', fontSize:15, fontWeight:700 }}
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

// ── OUTER PAGE — Suspense wrapper so Next.js build doesn't crash ──
export default function RunningKhataPage() {
  return (
    <Suspense fallback={
      <div style={{
        minHeight:'100vh',
        background:'linear-gradient(135deg, #dbeafe 0%, #eff6ff 40%, #e0e7ff 100%)',
        display:'flex', alignItems:'center', justifyContent:'center',
      }}>
        <div style={{
          background:'rgba(255,255,255,0.88)',
          backdropFilter:'blur(16px)',
          border:'0.5px solid rgba(200,210,240,0.7)',
          borderRadius:20, padding:'2rem 3rem', textAlign:'center',
        }}>
          <p style={{ margin:0, fontSize:15, color:'#6b7280', fontWeight:500 }}>Loading...</p>
        </div>
      </div>
    }>
      <RunningKhataInner />
    </Suspense>
  );
}