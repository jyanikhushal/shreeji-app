'use client';

export const dynamic = "force-dynamic";

import { useState, useRef, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/app/context/ToastContext";
import { getData } from '@/app/utils/api';
import { isSessionValid, clearSession } from "@/app/utils/session";
import { motion, AnimatePresence } from "framer-motion";
import KiranaBackground from "@/components/home/KiranaBackground";
import LedgerField from "@/components/ui/LedgerField";
import StampButton from "@/components/ui/StampButton";
import NavTransition from "@/components/NavTransition";
import { useNavTransition } from "@/hooks/useNavTransition";
import MarqueeText from "@/components/ui/MarqueeText";

type customer = {
  name: string;
  phone: string;
};

type entry = {
  entryNo: number;
  date: string;
  item: string;
  amount: string;
  total: number;
  pending?: boolean;
  awaitingResubmit?: boolean;
};

function RunningKhataInner() {
  const { showMessage: showmessage } = useToast();
  const router = useRouter();
  const { navigateTo: navigateto, stamping } = useNavTransition();

  const [customerphone, setcustomerphone] = useState<string | null>(null);

  useEffect(() => {
    const sp = new URLSearchParams(window.location.search);
    setcustomerphone(sp.get('phone'));
  }, []);

  useEffect(() => {
    if (!isSessionValid("malik")) {
      clearSession("malik");
      router.push("/login/malik");
    }
  }, [router]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!isSessionValid("malik")) {
        clearSession("malik");
        showmessage("error", "Session expired.Please login again.");
        router.push("/login/malik");
      }
    }, 60 * 1000);

    return () => clearInterval(interval);
  }, [router, showmessage]);

  const [entries, setentries] = useState<entry[]>([{
    entryNo: 1,
    date: '01/02/2006',
    item: '',
    amount: '',
    total: 0,
  }]);

  const [loading, setloading] = useState(false);
  const [error, seterror] = useState('');
  const [issubmitting, setissubmitting] = useState(false);
  const [customername, setcustomername] = useState('');

  const isvalidamount = (amount: string): boolean => {
    if (!amount) return false;
    const num = Number(amount);
    if (isNaN(num)) return false;
    if (num <= 0) return false;
    if (num > 100000) return false;
    return true;
  };

  const formattoday = () => {
    const d = new Date();
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  useEffect(() => {
    const fetchcustomer = async () => {
      const malikphone = localStorage.getItem("malikPhone");
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/grahak?malikPhone=${malikphone}`
        );
        const data = await getData<customer[]>(res, { expectArray: true });
        const matched = data.find((c) => c.phone === customerphone);
        if (matched) {
          setcustomername(matched.name);
        } else {
          showmessage("error", "Customer not found");
        }
      } catch (err) {
        if (err instanceof Error) {
          showmessage("error", err.message);
        } else {
          showmessage("error", "Something went wrong");
        }
      }
    };
    if (customerphone) fetchcustomer();
  }, [customerphone, showmessage]);

  async function loadkhata(): Promise<boolean> {
    try {
      const url = `${process.env.NEXT_PUBLIC_API_URL}/khata/${customerphone}?malikPhone=${localStorage.getItem("malikPhone")}`;
      const res = await fetch(url);

      type ledgerentry = {
        entryNo: number;
        date: string | { _seconds: number };
        description: string;
        amount: number | string;
        total: number;
      };

      const data = await getData<ledgerentry[]>(res, { expectArray: true });

      if (data.length > 0) {
        const formatted: entry[] = data.map((e: ledgerentry) => {
          let formatteddate = "";
          if (typeof e.date === "string") {
            formatteddate = e.date;
          } else if (e.date && e.date._seconds) {
            const jsdate = new Date(e.date._seconds * 1000);
            const day = String(jsdate.getDate()).padStart(2, '0');
            const month = String(jsdate.getMonth() + 1).padStart(2, '0');
            const year = jsdate.getFullYear();
            formatteddate = `${day}/${month}/${year}`;
          }
          return {
            entryNo: e.entryNo,
            date: formatteddate,
            item: e.description || "",
            amount: String(e.amount ?? ""),
            total: e.total
          };
        });

        const last = formatted[formatted.length - 1];
        formatted.push({
          entryNo: last.entryNo + 1,
          date: last.date,
          item: '',
          amount: '',
          total: last.total
        });
        setentries(formatted);
      } else {
        const todaystr = formattoday();
        setentries([{ entryNo: 1, date: todaystr, item: "", amount: "", total: 0 }]);
      }
      return true;
    } catch {
      showmessage("error", "Error loading khata");
      return false;
    }
  }

  useEffect(() => {
    if (!customerphone) return;
    const fetchdata = async () => { await loadkhata(); };
    fetchdata();
  }, [customerphone]);

  const [showdeposit, setshowdeposit] = useState(false);
  const [depositamount, setdepositamount] = useState('');
  const [selectedrow, setselectedrow] = useState<number | null>(null);
  const [showrowmenu, setshowrowmenu] = useState(false);
  const [showdeleteconfirm, setshowdeleteconfirm] = useState(false);
  const iteminputrefs = useRef<(HTMLInputElement | null)[]>([]);
  const amountinputrefs = useRef<(HTMLInputElement | null)[]>([]);
  const lastrowref = useRef<HTMLTableRowElement | null>(null);
  const [editingrow, seteditingrow] = useState<number | null>(null);

  type queueitem = {
    id: number;
    run: () => Promise<void>;
  };

  const submitqueueitemsref = useRef<queueitem[]>([]);
  const queuerunningref = useRef(false);
  const queuevalidref = useRef(true);
  const [isresyncing, setisresyncing] = useState(false);
  const entriesref = useRef<entry[]>(entries);
  
  useEffect(() => { entriesref.current = entries; }, [entries]);

  const runqueue = async () => {
    if (queuerunningref.current) return;
    queuerunningref.current = true;
    while (submitqueueitemsref.current.length > 0) {
      if (!queuevalidref.current) {
        submitqueueitemsref.current = [];
        break;
      }
      const item = submitqueueitemsref.current.shift()!;
      await item.run();
    }
    queuerunningref.current = false;
  };

  const handlequeuefailure = async (failedentryno: number) => {
    if (!queuevalidref.current) return;
    queuevalidref.current = false;
    submitqueueitemsref.current = [];

    showmessage("error", `Entry #${failedentryno} failed to save — please reconfirm from there`);
    setisresyncing(true);

    const snapshot = entriesref.current;
    const failindex = snapshot.findIndex(r => r.entryNo === failedentryno);
    const cachedtail = failindex === -1 ? [] : snapshot.slice(failindex).map(r => ({ item: r.item, amount: r.amount }));

    let synced = await loadkhata();
    let toldoffline = false;
    while (!synced) {
      if (!toldoffline) {
        showmessage("error", "No internet connection — will keep retrying");
        toldoffline = true;
      }
      await new Promise(resolve => setTimeout(resolve, 3000));
      synced = await loadkhata();
    }

    setentries(prev => {
      const confirmedpart = prev.slice(0, -1);
      const lastconfirmed = confirmedpart[confirmedpart.length - 1];
      let nextentryno = lastconfirmed ? lastconfirmed.entryNo + 1 : 1;
      const rowdate = lastconfirmed ? lastconfirmed.date : formattoday();

      const builttail: entry[] = cachedtail.map((cached, i) => {
        const islastcached = i === cachedtail.length - 1;
        return {
          entryNo: nextentryno++,
          date: rowdate,
          item: cached.item,
          amount: cached.amount,
          total: lastconfirmed ? lastconfirmed.total : 0,
          awaitingResubmit: islastcached ? undefined : true,
        };
      });

      return [...confirmedpart, ...builttail];
    });

    queuevalidref.current = true;
    setisresyncing(false);

    setTimeout(() => {
      const firstawaitingindex = entriesref.current.findIndex(r => r.awaitingResubmit);
      if (firstawaitingindex !== -1) {
        amountinputrefs.current[firstawaitingindex]?.focus();
      }
    }, 0);
  };

  useEffect(() => {
    if (entries.length > 0) {
      lastrowref.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [entries]);

  const handlechange = (index: number, field: 'item' | 'amount', value: string) => {
    const updated = [...entries];
    updated[index][field] = value;
    setentries(updated);
  };

  const handleenter = (index: number) => {
    const current = entries[index];
    if (!current.item || !current.amount) {
      showmessage("error", 'Please fill item and amount');
      return;
    }
    if (!isvalidamount(current.amount)) {
      showmessage('error', "Enter valid amount properly.");
      return;
    }
    if (index !== entries.length - 1) return;
    if (isresyncing) return;

    const amountnum = Number(current.amount);
    const prevrow = entries[index - 1];
    const previewtotal = (prevrow ? prevrow.total : 0) + amountnum;
    const provisionalentryno = current.entryNo;
    const todaystr = formattoday();
    const itemname = current.item;

    setentries(prev => {
      const updated = [...prev];
      updated[index] = {
        entryNo: provisionalentryno,
        date: todaystr,
        item: itemname,
        amount: current.amount,
        total: previewtotal,
        pending: true,
      };
      updated.push({
        entryNo: provisionalentryno + 1,
        date: todaystr,
        item: '',
        amount: '',
        total: previewtotal,
      });
      return updated;
    });

    setTimeout(() => {
      iteminputrefs.current[index + 1]?.focus();
    }, 0);

    submitqueueitemsref.current.push({
      id: provisionalentryno,
      run: async () => {
        try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/khata/addPurchase`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              malikPhone: localStorage.getItem("malikPhone"),
              phone: customerphone,
              item: itemname,
              amount: amountnum,
            }),
          });
          const confirmed = await getData<{ entryNo: number; date: string | { _seconds: number }; description: string; amount: number; total: number }>(res);

          if (!queuevalidref.current) return;

          let confirmeddate = todaystr;
          if (confirmed.date && typeof confirmed.date !== 'string' && confirmed.date._seconds) {
            const jsdate = new Date(confirmed.date._seconds * 1000);
            confirmeddate = `${String(jsdate.getDate()).padStart(2, '0')}/${String(jsdate.getMonth() + 1).padStart(2, '0')}/${jsdate.getFullYear()}`;
          }

          setentries(prev => prev.map(row =>
            row.entryNo === provisionalentryno && row.pending
              ? { entryNo: confirmed.entryNo, date: confirmeddate, item: confirmed.description, amount: String(confirmed.amount), total: confirmed.total }
              : row
          ));
        } catch {
          if (!queuevalidref.current) return;
          await handlequeuefailure(provisionalentryno);
        }
      },
    });

    runqueue();
  };

  const handleresubmit = (index: number) => {
    const current = entries[index];
    if (!current.item || !current.amount) {
      showmessage("error", 'Please fill item and amount');
      return;
    }
    if (!isvalidamount(current.amount)) {
      showmessage('error', "Enter valid amount");
      return;
    }
    if (isresyncing) return;

    const amountnum = Number(current.amount);
    const prevrow = entries[index - 1];
    const previewtotal = (prevrow ? prevrow.total : 0) + amountnum;
    const entryno = current.entryNo;
    const todaystr = formattoday();
    const itemname = current.item;

    setentries(prev => prev.map((row, i) =>
      i === index
        ? { ...row, total: previewtotal, pending: true, awaitingResubmit: false }
        : row
    ));

    setTimeout(() => {
      const nextawaiting = entriesref.current.findIndex(r => r.awaitingResubmit);
      if (nextawaiting !== -1) {
        amountinputrefs.current[nextawaiting]?.focus();
      }
    }, 0);

    submitqueueitemsref.current.push({
      id: entryno,
      run: async () => {
        try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/khata/addPurchase`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              malikPhone: localStorage.getItem("malikPhone"),
              phone: customerphone,
              item: itemname,
              amount: amountnum,
            }),
          });
          const confirmed = await getData<{ entryNo: number; date: string | { _seconds: number }; description: string; amount: number; total: number }>(res);

          if (!queuevalidref.current) return;

          let confirmeddate = todaystr;
          if (confirmed.date && typeof confirmed.date !== 'string' && confirmed.date._seconds) {
            const jsdate = new Date(confirmed.date._seconds * 1000);
            confirmeddate = `${String(jsdate.getDate()).padStart(2, '0')}/${String(jsdate.getMonth() + 1).padStart(2, '0')}/${jsdate.getFullYear()}`;
          }

          setentries(prev => prev.map(row =>
            row.entryNo === entryno && row.pending
              ? { entryNo: confirmed.entryNo, date: confirmeddate, item: confirmed.description, amount: String(confirmed.amount), total: confirmed.total }
              : row
          ));
        } catch {
          if (!queuevalidref.current) return;
          await handlequeuefailure(entryno);
        }
      },
    });

    runqueue();
  };

  const handledepositconfirm = async () => {
    if (issubmitting) return;
    const dep = Number(depositamount);
    if (!isvalidamount(depositamount)) {
      showmessage("error", "Enter valid amount");
      setdepositamount('');
      return;
    }
    setissubmitting(true);
    try {
      setloading(true);
      seterror("");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/khata/addDeposit`, {
        method: "POST",
        headers: { "content-Type": "application/json" },
        body: JSON.stringify({
          malikPhone: localStorage.getItem("malikPhone"),
          phone: customerphone,
          amount: dep
        })
      });
      await getData(res);
      await loadkhata();
      setdepositamount('');
      setshowdeposit(false);
    } catch {
      seterror("deposit failed");
      showmessage("error", "check your internet connection");
    } finally {
      setloading(false);
      setissubmitting(false);
    }
  };

  const handleeditamount = async (index: number, newamount: string) => {
    if (issubmitting) return;
    const row = entries[index];
    const amountnum = Number(newamount);
    if (!isvalidamount(newamount)) {
      showmessage("error", "Enter valid amount");
      return;
    }
    setissubmitting(true);
    try {
      setloading(true);
      seterror("");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/khata/edit`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          malikPhone: localStorage.getItem("malikPhone"),
          phone: customerphone,
          entryNo: row.entryNo,
          amount: amountnum,
          description: row.item
        })
      });
      await getData(res);
      await loadkhata();
    } catch {
      seterror("Edit failed");
    } finally {
      setloading(false);
      setissubmitting(false);
    }
  };

  const handledeleterow = async (index: number) => {
    const row = entries[index];
    if (index === 0) {
      showmessage("error", "First entry cannot be deleted");
      return;
    }
    if (index === entries.length - 1) {
      showmessage("error", "Cannot delete active entry row");
      return;
    }
    try {
      setloading(true);
      seterror("");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/khata/delete`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          malikPhone: localStorage.getItem("malikPhone"),
          phone: customerphone,
          entryNo: row.entryNo
        })
      });
      await getData(res);
      await loadkhata();
    } catch {
      seterror("Delete failed");
    } finally {
      setloading(false);
    }
  };

  useEffect(() => {
    if (showdeposit || showrowmenu || showdeleteconfirm) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [showdeposit, showrowmenu, showdeleteconfirm]);

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      padding: 'clamp(1rem, 4vw, 2rem)', paddingBottom: '4rem', background: 'linear-gradient(160deg, #E8DCC0 0%, #DED0AC 100%)',
      position: 'relative',
    }}>
      <NavTransition show={stamping} />
      <KiranaBackground />

      {/* ── GAP COVER: Seamlessly hides scrolling entries as they slide behind the Top Bar ── */}
      <div style={{
        position: 'fixed',
        top: 0, left: 0, right: 0,
        height: '1.5rem',
        zIndex: 110,
        background: '#E8DCC0', 
      }} />

      <div style={{ position: 'relative', zIndex: 2, width: '100%', maxWidth: '800px', margin: '0 auto' }}>
        <AnimatePresence>
          {loading && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              style={{
                background: 'var(--color-paper)', color: 'var(--color-ink)',
                borderRadius: '8px', padding: '8px 16px',
                textAlign: 'center', fontSize: '14px', fontWeight: 600,
                marginBottom: '12px', borderLeft: '4px solid var(--color-brass)',
                boxShadow: '0 4px 12px rgba(35,42,59,0.1)'
              }}
            >
              ⏳ Processing...
            </motion.div>
          )}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              style={{
                background: '#fee2e2', color: 'var(--color-rule-red)',
                borderRadius: '8px', padding: '8px 16px',
                textAlign: 'center', fontSize: '14px', fontWeight: 600,
                marginBottom: '12px', borderLeft: '4px solid var(--color-rule-red)',
                boxShadow: '0 4px 12px rgba(35,42,59,0.1)'
              }}
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
          style={{
            background: '#DCC999', 
            borderRadius: '12px',
            padding: 'clamp(1rem, 3vw, 1.25rem) clamp(1rem, 3vw, 1.5rem)',
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '1.5rem',
            boxShadow: '0 8px 30px rgba(35,42,59,0.15)',
            borderLeft: '6px solid var(--color-brass)',
            position: 'sticky',
            top: '1.5rem',
            zIndex: 100,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: '200px' }}>
            <button
              onClick={() => navigateto('/dashboard/malik')}
              style={{
                background: 'transparent', border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', padding: '4px',
                color: 'var(--color-ink)', opacity: 0.6,
              }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="19" y1="12" x2="5" y2="12"/>
                <polyline points="12 19 5 12 12 5"/>
              </svg>
            </button>
            <div style={{
              width: 46, height: 46, borderRadius: '50%',
              background: 'var(--color-ink)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '18px', fontWeight: 700, color: 'var(--color-paper)', flexShrink: 0,
            }}>
              {customername ? customername.charAt(0).toUpperCase() : '?'}
            </div>
            <div>
              <p style={{ margin: 0, fontSize: 'clamp(16px, 4vw, 18px)', fontWeight: 700, color: 'var(--color-ink)' }}>
                {customername}
              </p>
              <p style={{ margin: '2px 0 0', fontSize: 'clamp(11px, 3vw, 13px)', color: 'var(--color-ink)', opacity: 0.7 }}>
                {customerphone}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0, marginLeft: 'auto' }}>
            {entries.length > 0 && (
              <div style={{
                background: entries[entries.length - 1].total > 0 ? '#fee2e2' : 'rgba(22, 163, 74, 0.1)',
                color: entries[entries.length - 1].total > 0 ? 'var(--color-rule-red)' : 'var(--color-ink)',
                borderRadius: '20px', padding: '6px 14px',
                fontSize: '14px', fontWeight: 700,
                border: `1px solid ${entries[entries.length - 1].total > 0 ? 'rgba(220, 38, 38, 0.3)' : 'rgba(22, 163, 74, 0.3)'}`
              }}>
                ₹{(entries[entries.length - 1].total).toLocaleString('en-IN')}
              </div>
            )}
            <StampButton tone="brass" onClick={() => setshowdeposit(true)}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}>
                <line x1="12" y1="5" x2="12" y2="19"/>
                <line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              Deposit
            </StampButton>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          style={{
            background: 'var(--color-paper)',
            borderRadius: '12px',
            boxShadow: '0 8px 32px rgba(35,42,59,0.15)',
            overflowX: 'hidden',
          }}
        >
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px', tableLayout: 'fixed', boxSizing: 'border-box' }}>
            <colgroup>
  <col style={{ width: '8%' }} />
  <col style={{ width: '17%' }} />
  <col style={{ width: '35%' }} />
  <col style={{ width: '20%' }} />
  <col style={{ width: '20%' }} />
</colgroup>
            <thead>
              <tr style={{ background: 'rgba(168, 141, 90, 0.1)' }}>
                {['#', 'Date', 'Item', 'Amount', 'Total'].map((h) => (
                  <th key={h} style={{
                    padding: '14px clamp(8px, 2vw, 12px)',
                    color: 'var(--color-ink)', fontWeight: 700, fontSize: '13px',
                    borderBottom: '2px solid rgba(168, 141, 90, 0.2)',
                    textAlign: h === 'Amount' || h === 'Total' ? 'right' : 'center',
                    textTransform: 'uppercase', letterSpacing: '0.5px'
                  }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <AnimatePresence initial={false}>
                {entries.map((row, index) => {
                  const isediting = editingrow === index;
                  const islastrow = index === entries.length - 1;
                  const isdeposit = (row.item || '').startsWith('Deposit');
                  const isdimmed = editingrow !== null && !isediting;
                  const isearliestawaitingresubmit = row.awaitingResubmit &&
                    entries.findIndex(r => r.awaitingResubmit) === index;

                  return (
                    <motion.tr
                      key={row.entryNo}
                      ref={islastrow ? lastrowref : null}
                      layout
                      initial={islastrow ? false : { opacity: 0, y: -10 }}
                      animate={{ opacity: isdimmed ? 0.4 : 1, y: 0 }}
                      style={{
                        background: isediting ? 'rgba(168, 141, 90, 0.15)' : isdeposit ? 'rgba(22, 163, 74, 0.05)' : islastrow ? 'rgba(35,42,59,0.02)' : 'transparent',
                        borderBottom: '1px solid rgba(35,42,59,0.08)',
                        transition: 'background 0.2s ease',
                      }}
                    >
                      <td
                        onClick={() => {
                          if (editingrow !== null) return;
                          if (islastrow) return;
                          if (row.pending || row.awaitingResubmit) {
                            showmessage("info", "Still confirming — try again in a moment");
                            return;
                          }
                          setselectedrow(index);
                          setshowrowmenu(true);
                        }}
                        style={{
                          padding: '12px clamp(6px, 2vw, 10px)', textAlign: 'center',
                          cursor: (islastrow || row.pending || row.awaitingResubmit) ? 'default' : 'pointer',
                          color: (islastrow || row.pending || row.awaitingResubmit) ? 'rgba(35,42,59,0.3)' : 'var(--color-brass)',
                          fontWeight: 700, fontSize: '13px', userSelect: 'none',
                        }}
                      >
                        {row.entryNo}
                      </td>

                      <td style={{ padding: '12px clamp(6px, 2vw, 10px)', textAlign: 'center', fontSize: '13px', color: 'var(--color-ink)', opacity: 0.7, whiteSpace: 'nowrap' }}>
                        {row.date}
                      </td>

                      <td style={{ padding: '8px' , overflow: 'hidden' }}>
                        {(() => {
                          const isEditableNow = editingrow === index || (editingrow === null && islastrow) || isearliestawaitingresubmit;
                          const inputDisabled = issubmitting || !isEditableNow || isdeposit;

                          if (!inputDisabled) {
                            // Actively editable row — real input, untouched behavior
                            return (
                              <input
                                ref={(el) => { iteminputrefs.current[index] = el; }}
                                value={row.item}
                                onChange={(e) => handlechange(index, 'item', e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault();
                                    amountinputrefs.current[index]?.focus();
                                  }
                                }}
                                placeholder={islastrow ? 'Type item...' : ''}
                                style={{
                                  width: '100%', border: 'none', outline: 'none',
                                  background: 'transparent', fontSize: '14px',
                                  color: 'var(--color-ink)', fontWeight: 500,
                                  padding: '8px', borderRadius: '6px',
                                  fontFamily: 'inherit'
                                }}
                              />
                            );
                          }

                          // Read-only row — render as a looping ticker if the name overflows
                          return (
                            <div style={{
                              padding: '8px', fontSize: '14px',
                              color: isdeposit ? '#16a34a' : 'var(--color-ink)',
                              fontWeight: isdeposit ? 700 : 500,
                            }}>
                              <MarqueeText text={row.item} />
                            </div>
                          );
                        })()}
                      </td>

                      <td style={{ padding: '8px', position: 'relative' }}>
                        <input
                          ref={(el) => { amountinputrefs.current[index] = el; }}
                          value={row.amount}
                          disabled={issubmitting ||
                            (editingrow !== index && !(editingrow === null && islastrow) && !isearliestawaitingresubmit)
                          }
                          onChange={(e) => {
                            const value = e.target.value;
                            if (/^\d*\.?\d{0,2}$/.test(value)) {
                              handlechange(index, 'amount', value);
                            }
                          }}
                          onBlur={(e) => {
                            if (editingrow === index) handleeditamount(index, e.target.value);
                          }}
                          onKeyDown={async (e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              if (editingrow === index) {
                                await handleeditamount(index, e.currentTarget.value);
                                seteditingrow(null);
                              } else if (row.awaitingResubmit) {
                                if (!isearliestawaitingresubmit) return;
                                handleresubmit(index);
                              } else {
                                handleenter(index);
                              }
                            }
                          }}
                          placeholder={islastrow ? '0' : ''}
                          style={{
                            width: '100%', border: 'none', outline: 'none',
                            background: 'transparent', fontSize: '15px', textAlign: 'right',
                            color: isdeposit ? '#16a34a' : 'var(--color-ink)',
                            fontWeight: isdeposit ? 700 : 500,
                            padding: '8px', borderRadius: '6px',
                            fontFamily: 'inherit',
                            position: 'relative',
                            zIndex: 1
                          }}
                        />
                        {(row.pending || row.awaitingResubmit) && (
                          <motion.span
                            animate={{ opacity: [1, 0.4, 1] }}
                            transition={{ repeat: Infinity, duration: 0.8, ease: "easeInOut" }}
                            style={{
                              position: 'absolute',
                              top: '12px',
                              right: '8px',
                              width: '8px',
                              height: '8px',
                              borderRadius: '50%',
                              background: '#dc2626',
                              boxShadow: '0 0 8px rgba(220, 38, 38, 0.8)',
                              zIndex: 10,
                              pointerEvents: 'none'
                            }} 
                          />
                        )}
                      </td>

                      <td style={{
                        padding: '12px clamp(8px, 2vw, 14px)', textAlign: 'right',
                        fontWeight: 700, fontSize: '15px',
                        color: row.total > 0 ? 'var(--color-rule-red)' : row.total < 0 ? '#16a34a' : 'var(--color-ink)',
                        whiteSpace: 'nowrap', opacity: (row.total === 0 && islastrow) ? 0.4 : 1
                      }}>
                        {row.awaitingResubmit ? '' : (row.total !== 0 || !islastrow ? `₹${row.total.toLocaleString('en-IN')}` : '₹0')}
                      </td>
                    </motion.tr>
                  );
                })}
              </AnimatePresence>
            </tbody>
          </table>
        </motion.div>
      </div>

      <AnimatePresence>
        {showdeposit && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed', inset: 0, zIndex: 9999,
              background: 'rgba(35,42,59,0.6)', backdropFilter: 'blur(4px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: '1rem'
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              style={{
                background: 'var(--color-paper)', borderRadius: '12px', 
                padding: 'clamp(1.5rem, 5vw, 2rem)',
                width: 'calc(100% - 2rem)', maxWidth: '340px', 
                boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
                borderLeft: '6px solid var(--color-brass)',
              }}
            >
              <h2 style={{ fontWeight: 700, marginBottom: '4px', textAlign: 'center', color: 'var(--color-ink)', fontSize: '20px' }}>Add Deposit</h2>
              <p style={{ textAlign: 'center', color: 'var(--color-ink)', opacity: 0.7, fontSize: '13px', marginBottom: '24px' }}>Amount received from {customername}</p>
              
              <div style={{ marginBottom: '24px' }}>
                <LedgerField
                  label="Deposit Amount (₹)"
                  value={depositamount}
                  onChange={(val) => setdepositamount(val)}
                  placeholder="Enter amount"
                  type="number"
                  icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--color-brass)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="2" x2="12" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={() => setshowdeposit(false)}
                  style={{ flex: 1, padding: '12px 0', border: '1px dashed rgba(35,42,59,0.3)', borderRadius: '6px', background: 'transparent', color: 'var(--color-ink)', cursor: 'pointer', fontSize: '15px', fontWeight: 500 }}
                >
                  Cancel
                </button>
                <div style={{ flex: 1 }}>
                  <StampButton 
                    tone="brass" 
                    onClick={handledepositconfirm}
                    disabled={issubmitting}
                    icon={
                      issubmitting ? (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-paper)" strokeWidth="2.5" strokeLinecap="round">
                          <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83">
                            <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="0.8s" repeatCount="indefinite" />
                          </path>
                        </svg>
                      ) : undefined
                    }
                  >
                    {issubmitting ? "Confirming..." : "Confirm"}
                  </StampButton>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showrowmenu && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed', inset: 0, zIndex: 9999,
              background: 'rgba(35,42,59,0.6)', backdropFilter: 'blur(4px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: '1rem'
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              style={{
                background: 'var(--color-paper)', borderRadius: '12px', 
                padding: 'clamp(1.5rem, 5vw, 2rem)',
                width: 'calc(100% - 2rem)', maxWidth: '320px', 
                boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
                borderLeft: '6px solid var(--color-rule-red)',
              }}
            >
              <h2 style={{ fontWeight: 700, marginBottom: '4px', textAlign: 'center', color: 'var(--color-ink)', fontSize: '18px' }}>Row Options</h2>
              <p style={{ textAlign: 'center', color: 'var(--color-ink)', opacity: 0.7, fontSize: '13px', marginBottom: '20px' }}>Entry #{selectedrow !== null ? entries[selectedrow]?.entryNo : ''}</p>
              
              <button
                onClick={() => {
                  if (selectedrow !== null) {
                    seteditingrow(selectedrow);
                    setshowrowmenu(false);
                    setTimeout(() => { iteminputrefs.current[selectedrow]?.focus(); }, 100);
                  }
                }}
                style={{ width: '100%', marginBottom: '10px', padding: '12px 0', border: '1.5px solid var(--color-brass)', borderRadius: '6px', background: 'transparent', color: 'var(--color-ink)', cursor: 'pointer', fontSize: '14px', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-brass)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                Edit Row
              </button>
              
              <button
                onClick={() => { setshowrowmenu(false); setshowdeleteconfirm(true); }}
                style={{ width: '100%', marginBottom: '16px', padding: '12px 0', border: '1.5px solid var(--color-rule-red)', borderRadius: '6px', background: 'rgba(220, 38, 38, 0.05)', color: 'var(--color-rule-red)', cursor: 'pointer', fontSize: '14px', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                Delete Row
              </button>
              
              <button
                onClick={() => setshowrowmenu(false)}
                style={{ width: '100%', padding: '12px 0', border: '1px dashed rgba(35,42,59,0.3)', borderRadius: '6px', background: 'transparent', color: 'var(--color-ink)', cursor: 'pointer', fontSize: '14px', fontWeight: 500 }}
              >
                Cancel
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showdeleteconfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed', inset: 0, zIndex: 9999,
              background: 'rgba(35,42,59,0.6)', backdropFilter: 'blur(4px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: '1rem'
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              style={{
                background: 'var(--color-paper)', borderRadius: '12px', 
                padding: 'clamp(1.5rem, 5vw, 2rem)',
                width: 'calc(100% - 2rem)', maxWidth: '320px', 
                boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
                borderLeft: '6px solid var(--color-rule-red)',
              }}
            >
              <h2 style={{ fontWeight: 700, marginBottom: '4px', textAlign: 'center', color: 'var(--color-rule-red)', fontSize: '20px' }}>Delete Entry?</h2>
              <p style={{ textAlign: 'center', color: 'var(--color-ink)', opacity: 0.7, fontSize: '13px', marginBottom: '24px' }}>This will permanently remove the entry and recalculate all totals.</p>
              
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={() => setshowdeleteconfirm(false)}
                  style={{ flex: 1, padding: '12px 0', border: '1px dashed rgba(35,42,59,0.3)', borderRadius: '6px', background: 'transparent', color: 'var(--color-ink)', cursor: 'pointer', fontSize: '15px', fontWeight: 500 }}
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (selectedrow !== null) handledeleterow(selectedrow);
                    setshowdeleteconfirm(false);
                  }}
                  style={{ flex: 1, padding: '12px 0', background: 'var(--color-rule-red)', color: 'var(--color-paper)', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '15px', fontWeight: 700 }}
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function RunningKhataPage() {
  return (
    <Suspense fallback={
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(160deg, #E8DCC0 0%, #DED0AC 100%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <div style={{
          background: 'var(--color-paper)',
          borderRadius: '12px', padding: '2rem 3rem', textAlign: 'center',
          boxShadow: '0 8px 30px rgba(35,42,59,0.15)',
          borderLeft: '6px solid var(--color-brass)'
        }}>
          <p style={{ margin: 0, fontSize: '16px', color: 'var(--color-ink)', fontWeight: 600 }}>Loading Khata...</p>
        </div>
      </div>
    }>
      <RunningKhataInner />
    </Suspense>
  );
}