'use client';
export const dynamic = "force-dynamic";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useToast } from "@/app/context/ToastContext";
import { getData } from "@/app/utils/api";
import { isSessionValid, clearSession } from "@/app/utils/session";
import { db } from '@/app/firebase';
import { onSnapshot, collection, Timestamp } from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";
import KiranaBackground from "@/components/home/KiranaBackground";
import LedgerField from "@/components/ui/LedgerField";
import StampButton from "@/components/ui/StampButton";
import NavTransition from "@/components/NavTransition";
import { useNavTransition } from "@/hooks/useNavTransition";

type customer = {
  name: string;
  phone: string;
  currentBalance?: number;
  lastDepositAt?: Timestamp | null;
};

type malik = {
  name: string;
  phone: string;
  shopName: string;
};

export default function MalikDashboardPage() {
  const { showMessage: showmessage } = useToast();
  const router = useRouter();
  const { navigateTo: navigateto, stamping } = useNavTransition();
  const [showaddcustomer, setshowaddcustomer] = useState(false);
  const [malikdata, setmalikdata] = useState<malik | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("malik");
    if (stored && stored !== "undefined") {
      try {
        const parsed = JSON.parse(stored);
        setTimeout(() => {
          setmalikdata(parsed);
        }, 0);
      } catch {}
    }
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
        showmessage("error", "session expired. please login again.");
        router.push("/login/malik");
      }
    }, 60 * 1000);
    return () => clearInterval(interval);
  }, [router, showmessage]);

  const [customers, setcustomers] = useState<customer[]>([]);

  useEffect(() => {
    const malikphone = localStorage.getItem("malikPhone");
    if (!malikphone) return;

    const customersref = collection(db, 'maliks', malikphone, 'customers');
    const unsubscribe = onSnapshot(customersref, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        ...doc.data()
      })) as unknown as customer[];

      const sorted = data.sort((a, b) => a.name.localeCompare(b.name));
      setcustomers(sorted);
    }, (err) => {
      showmessage("error", err.message);
    });

    return () => unsubscribe();
  }, [showmessage]);

  const [name, setname] = useState('');
  const [phone, setphone] = useState('');
  
  // ── OPTIMIZATION: DEBOUNCED SEARCH ──
  const [searchtext, setsearchtext] = useState('');
  const [debouncedsearchtext, setdebouncedsearchtext] = useState('');

  useEffect(() => {
    const handler = setTimeout(() => {
      setdebouncedsearchtext(searchtext);
    }, 150); // 150ms delay makes typing instant while reducing re-renders

    return () => clearTimeout(handler);
  }, [searchtext]);

  const [sortoption, setsortoption] = useState<'name' | 'amount' | 'time'>('name');
  const [now, setnow] = useState<number | null>(null);

  useEffect(() => {
    const updatenow = () => setnow(Date.now());
    const timeout = setTimeout(updatenow, 0);
    const interval = setInterval(updatenow, 60 * 1000);

    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
    };
  }, []);

  const [showrowmenu, setshowrowmenu] = useState(false);
  const [selectedcustomer, setselectedcustomer] = useState<customer | null>(null);
  const [showeditname, setshoweditname] = useState(false);
  const [showeditphone, setshoweditphone] = useState(false);
  const [editphone, seteditphone] = useState('');
  const [editname, seteditname] = useState('');
  const [isediting, setisediting] = useState(false);

  const resetform = () => {
    setname("");
    setphone("");
  };

  const addcustomer = async () => {
    if (!name || !phone) {
      showmessage("error", 'please fill all fields');
      return;
    }

    const isvalidphone = (p: string): boolean => {
      const cleaned = p.trim();
      const regex = /^[6-9]\d{9}$/;
      return regex.test(cleaned);
    };

    if (!isvalidphone(phone)) {
      showmessage("error", "enter valid phone number");
      return;
    }

    try {
      const malikphone = localStorage.getItem("malikPhone");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/grahak/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ malikPhone: malikphone, name, phone })
      });

      const addedcustomer = await getData<customer>(res);

      if (!addedcustomer) {
        showmessage("error", "invalid server response");
        return;
      }

      showmessage("success", "customer added");
      resetform();
      setshowaddcustomer(false);
      navigateto(`/dashboard/malik/khata?phone=${phone}`);
    } catch (err: unknown) {
      if (err instanceof Error) {
        showmessage("error", err.message);
      } else {
        showmessage("error", "check your internet connectivity");
      }
      resetform();
    }
  };

  const editcustomername = async () => {
    if (!editname) {
      showmessage("error", "please enter a name");
      return;
    }
    if (!selectedcustomer) return;
    
    setisediting(true);
    try {
      const malikphone = localStorage.getItem("malikPhone");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/grahak/editName`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ malikPhone: malikphone, phone: selectedcustomer.phone, newName: editname }),
      });
      
      await getData(res);
      setcustomers(prev => {
        const updated = prev.map(c =>
          c.phone === selectedcustomer.phone ? { ...c, name: editname } : c
        );
        return updated.sort((a, b) => a.name.localeCompare(b.name));
      });
      
      showmessage("success", "name updated");
      setshoweditname(false);
      setselectedcustomer(null);
      seteditname('');
      setisediting(false);
    } catch (err) {
      showmessage("error", "failed to update name");
      setisediting(false);
    }
  };

  const editcustomerphone = async () => {
    const isvalidphone = (p: string) => /^[6-9]\d{9}$/.test(p.trim());
    if (!isvalidphone(editphone)) { showmessage("error", "enter valid phone number"); return; }
    if (!selectedcustomer) return;
    
    setisediting(true);
    try {
      const malikphone = localStorage.getItem("malikPhone");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/grahak/editPhone`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ malikPhone: malikphone, oldPhone: selectedcustomer.phone, newPhone: editphone }),
      });
      
      await getData(res);
      setcustomers(prev => {
        const updated = prev.map(c =>
          c.phone === selectedcustomer.phone ? { ...c, phone: editphone } : c
        );
        return updated.sort((a, b) => a.name.localeCompare(b.name));
      });
      
      showmessage("success", "phone number updated");
      setshoweditphone(false);
      setselectedcustomer(null);
      seteditphone('');
      setisediting(false);
    } catch (err) {
      showmessage("error", "failed to update phone number");
      setisediting(false);
    }
  };

  // ── OPTIMIZATION: USEMEMO CACHED FILTER & SORT ──
  const filteredcustomers = useMemo(() => {
    return customers
      .filter((c) => 
        c.name.toLowerCase().includes(debouncedsearchtext.toLowerCase()) || 
        c.phone.includes(debouncedsearchtext)
      )
      .sort((a, b) => {
        if (sortoption === 'amount') {
          return (b.currentBalance ?? 0) - (a.currentBalance ?? 0);
        }
        if (sortoption === 'time') {
          const atime = a.lastDepositAt ? a.lastDepositAt.toDate().getTime() : 0;
          const btime = b.lastDepositAt ? b.lastDepositAt.toDate().getTime() : 0;
          return atime - btime;
        }
        return a.name.localeCompare(b.name);
      });
  }, [customers, debouncedsearchtext, sortoption]);

  function formatdaysago(lastdepositat: Timestamp | null | undefined, currentnow: number): string {
    if (!lastdepositat) return "no deposits yet";
    const date = lastdepositat.toDate();
    const diffms = currentnow - date.getTime();
    const days = Math.floor(diffms / (1000 * 60 * 60 * 24));
    if (days === 0) return "today";
    if (days === 1) return "1 day ago";
    return `${days} days ago`;
  }

  if (!malikdata) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', color: '#6b7280' }}>Loading...</div>;

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', padding: '2rem',
      background: 'linear-gradient(160deg, #E8DCC0 0%, #DED0AC 100%)',
      position: 'relative', overflow: 'hidden',
    }}>
      <NavTransition show={stamping} />
      <KiranaBackground />

      <div style={{ position: 'relative', zIndex: 2, width: '100%', maxWidth: '1000px' }}>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
          style={{
            background: 'var(--color-paper)',
            borderRadius: '12px',
            padding: '1.25rem 1.5rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1.5rem',
            boxShadow: '0 8px 30px rgba(35,42,59,0.15)',
            borderLeft: '6px solid var(--color-rule-red)',
            position: 'sticky',
            top: '1.5rem',
            zIndex: 100,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{
              width: 52, height: 52, borderRadius: '50%',
              background: '#E8E4D9', border: '2px solid #A88D5A',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              overflow: 'hidden', position: 'relative', flexShrink: 0
            }}>
              <Image 
                src="/digiKhata-logo.png" 
                alt="digikhata logo" 
                fill
                style={{ objectFit: 'cover' }}
                priority 
              />
            </div>
            <div>
              <p style={{ fontSize: '18px', fontWeight: 600, color: 'var(--color-ink)', margin: 0 }}>
                {malikdata?.shopName || 'My Shop'}
              </p>
              <p style={{ fontSize: '13px', color: 'var(--color-ink)', opacity: 0.7, margin: '3px 0 0' }}>
                {malikdata?.name} &nbsp;·&nbsp; {malikdata?.phone}
              </p>
            </div>
          </div>

          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <p style={{
              fontFamily: 'var(--font-noto-gujarati)',
              fontSize: '22px', fontWeight: 700, color: 'var(--color-brass)',
              margin: 0, letterSpacing: '0.5px', textAlign: 'center',
            }}>
              જય શ્રી સ્વામિનારાયણ
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'stretch', gap: '8px', flexShrink: 0 }}>
            <button
              onClick={() => { clearSession("malik"); navigateto('/'); }}
              style={{
                padding: '8px 16px', background: 'transparent', color: 'var(--color-rule-red)',
                border: '1.5px solid var(--color-rule-red)', borderRadius: '6px',
                fontSize: '13px', fontWeight: 600, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px',
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-rule-red)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
              Logout
            </button>
            <StampButton
              tone="brass"
              onClick={() => { resetform(); setshowaddcustomer(true); }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}>
                <line x1="12" y1="5" x2="12" y2="19"/>
                <line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              New Customer
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
            padding: '1.5rem',
            margin: '0 auto',
            maxWidth: '600px',
            boxShadow: '0 8px 32px rgba(35,42,59,0.15)',
            borderTop: '4px solid var(--color-brass)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.2rem' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-ink)', margin: 0 }}>
              Customer List
            </h2>
            <select
              value={sortoption}
              onChange={(e) => setsortoption(e.target.value as 'name' | 'amount' | 'time')}
              style={{
                marginLeft: 'auto', fontSize: '13px', fontWeight: 600, color: 'var(--color-ink)',
                background: 'transparent', border: '1px solid rgba(35,42,59,0.3)',
                borderRadius: '6px', padding: '6px 10px', cursor: 'pointer', outline: 'none',
              }}
            >
              <option value="name">Name (A-Z)</option>
              <option value="amount">Udhaar: High to Low</option>
              <option value="time">Udhaar: Overdue First</option>
            </select>
            <span style={{
              background: 'var(--color-brass)', color: 'var(--color-paper)',
              fontSize: '12px', fontWeight: 600, padding: '4px 12px', borderRadius: '20px',
            }}>
              {filteredcustomers.length} total
            </span>
          </div>

          <LedgerField
            label=""
            value={searchtext}
            onChange={setsearchtext}
            placeholder="Search by name or phone..."
            icon={
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--color-brass)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/>
                <line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
            }
          />

          {filteredcustomers.length === 0 && (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-ink)', opacity: 0.6, fontSize: '14px', fontWeight: 500 }}>
              No customer found
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '16px' }}>
            <AnimatePresence mode="popLayout">
              {filteredcustomers.map((c, i) => (
                <motion.div
                  key={c.phone}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  layout
                  onClick={() => navigateto(`/dashboard/malik/khata?phone=${c.phone}`)}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '14px 18px',
                    background: 'rgba(255,255,255,0.4)',
                    border: '1px solid rgba(35,42,59,0.1)',
                    borderRadius: '8px', cursor: 'pointer',
                    transition: 'background 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.8)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(35,42,59,0.08)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.4)';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{
                      width: 44, height: 44, borderRadius: '50%',
                      background: 'var(--color-ink)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '16px', fontWeight: 700, color: 'var(--color-paper)', flexShrink: 0,
                    }}>
                      {c.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: 'var(--color-ink)' }}>{c.name}</p>
                      <p style={{ margin: '2px 0 0', fontSize: '13px', color: 'var(--color-ink)', opacity: 0.7 }}>{c.phone}</p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                      <p style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: 'var(--color-rule-red)' }}>
                        ₹{(c.currentBalance ?? 0).toLocaleString('en-IN')}
                      </p>
                      <p style={{ margin: '2px 0 0', fontSize: '12px', color: 'var(--color-ink)', opacity: 0.6 }}>
                        {now ? formatdaysago(c.lastDepositAt, now) : '—'}
                      </p>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setselectedcustomer(c);
                        seteditname(c.name);
                        seteditphone(c.phone);
                        setshowrowmenu(true);
                      }}
                      style={{
                        background: 'transparent', border: '1px solid rgba(35,42,59,0.2)',
                        cursor: 'pointer', padding: '8px', borderRadius: '6px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'var(--color-ink)', transition: 'background 0.2s',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'rgba(35,42,59,0.05)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 20h9"/>
                        <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"/>
                      </svg>
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>

      {/* Popups (Add, Edit Name, Edit Phone, Row Menu) remain optimized and accessible below */}
      <AnimatePresence>
        {showaddcustomer && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed', inset: 0, zIndex: 9999,
              background: 'rgba(35,42,59,0.6)', backdropFilter: 'blur(4px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              style={{
                background: 'var(--color-paper)', borderRadius: '12px', padding: '2rem',
                width: '360px', boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
                borderLeft: '6px solid var(--color-rule-red)',
              }}
            >
              <h2 style={{ fontWeight: 700, marginBottom: '6px', textAlign: 'center', color: 'var(--color-ink)', fontSize: '20px' }}>Add Customer</h2>
              <p style={{ textAlign: 'center', color: 'var(--color-ink)', opacity: 0.7, fontSize: '13px', marginBottom: '24px' }}>Enter the customer details below</p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '24px' }}>
                <LedgerField
                  label="Customer Name"
                  value={name}
                  onChange={setname}
                  placeholder="Enter customer name"
                  icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--color-brass)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>}
                />
                <LedgerField
                  label="Phone Number"
                  value={phone}
                  onChange={(val) => setphone(val.replace(/\D/g, ""))}
                  placeholder="Enter phone number"
                  type="text"
                  icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--color-brass)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.63 3.4 2 2 0 0 1 3.6 1.22h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.8a16 16 0 0 0 6.29 6.29l.96-.96a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={() => { setshowaddcustomer(false); resetform(); }}
                  style={{ flex: 1, padding: '12px 0', border: '1px dashed rgba(35,42,59,0.3)', borderRadius: '6px', background: 'transparent', color: 'var(--color-ink)', cursor: 'pointer', fontSize: '15px', fontWeight: 500 }}
                >
                  Cancel
                </button>
                <div style={{ flex: 1 }}>
                  <StampButton tone="ink" onClick={addcustomer}>Add</StampButton>
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
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              style={{
                background: 'var(--color-paper)', borderRadius: '12px', padding: '2rem',
                width: '320px', boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
                borderLeft: '6px solid var(--color-rule-red)',
              }}
            >
              <h2 style={{ fontWeight: 700, marginBottom: '4px', textAlign: 'center', color: 'var(--color-ink)', fontSize: '18px' }}>Options</h2>
              <p style={{ textAlign: 'center', color: 'var(--color-ink)', opacity: 0.7, fontSize: '13px', marginBottom: '20px' }}>{selectedcustomer?.name}</p>
              
              <button
                onClick={() => { setshowrowmenu(false); setshoweditname(true); }}
                style={{ width: '100%', marginBottom: '10px', padding: '12px 0', border: '1.5px solid var(--color-brass)', borderRadius: '6px', background: 'transparent', color: 'var(--color-ink)', cursor: 'pointer', fontSize: '14px', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-brass)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                Edit Name
              </button>
              
              <button
                onClick={() => { setshowrowmenu(false); setshoweditphone(true); }}
                style={{ width: '100%', marginBottom: '16px', padding: '12px 0', border: '1.5px solid var(--color-brass)', borderRadius: '6px', background: 'transparent', color: 'var(--color-ink)', cursor: 'pointer', fontSize: '14px', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-brass)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.63 3.4 2 2 0 0 1 3.6 1.22h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.8a16 16 0 0 0 6.29 6.29l.96-.96a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                Edit Phone Number
              </button>
              
              <button
                onClick={() => { setshowrowmenu(false); setselectedcustomer(null); }}
                style={{ width: '100%', padding: '12px 0', border: '1px dashed rgba(35,42,59,0.3)', borderRadius: '6px', background: 'transparent', color: 'var(--color-ink)', cursor: 'pointer', fontSize: '14px', fontWeight: 500 }}
              >
                Cancel
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showeditname && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed', inset: 0, zIndex: 9999,
              background: 'rgba(35,42,59,0.6)', backdropFilter: 'blur(4px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              style={{
                background: 'var(--color-paper)', borderRadius: '12px', padding: '2rem',
                width: '360px', boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
                borderLeft: '6px solid var(--color-rule-red)',
              }}
            >
              <h2 style={{ fontWeight: 700, marginBottom: '6px', textAlign: 'center', color: 'var(--color-ink)', fontSize: '20px' }}>Edit Name</h2>
              <p style={{ textAlign: 'center', color: 'var(--color-ink)', opacity: 0.7, fontSize: '13px', marginBottom: '24px' }}>Change name for {selectedcustomer?.phone}</p>
              
              <div style={{ marginBottom: '24px' }}>
                <LedgerField
                  label="Customer Name"
                  value={editname}
                  onChange={seteditname}
                  placeholder="Enter new name"
                  icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--color-brass)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={() => { setshoweditname(false); setselectedcustomer(null); }}
                  style={{ flex: 1, padding: '12px 0', border: '1px dashed rgba(35,42,59,0.3)', borderRadius: '6px', background: 'transparent', color: 'var(--color-ink)', cursor: 'pointer', fontSize: '15px', fontWeight: 500 }}
                >
                  Cancel
                </button>
                <div style={{ flex: 1 }}>
                  <StampButton tone="ink" onClick={editcustomername}>
                    {isediting ? 'Saving...' : 'Change'}
                  </StampButton>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showeditphone && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed', inset: 0, zIndex: 9999,
              background: 'rgba(35,42,59,0.6)', backdropFilter: 'blur(4px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              style={{
                background: 'var(--color-paper)', borderRadius: '12px', padding: '2rem',
                width: '360px', boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
                borderLeft: '6px solid var(--color-rule-red)',
              }}
            >
              <h2 style={{ fontWeight: 700, marginBottom: '6px', textAlign: 'center', color: 'var(--color-ink)', fontSize: '20px' }}>Edit Phone</h2>
              <p style={{ textAlign: 'center', color: 'var(--color-ink)', opacity: 0.7, fontSize: '13px', marginBottom: '24px' }}>Migrate khata to a new number</p>
              
              <div style={{ marginBottom: '24px' }}>
                <LedgerField
                  label="New Phone Number"
                  value={editphone}
                  onChange={(val) => seteditphone(val.replace(/\D/g, ""))}
                  placeholder="Enter new phone number"
                  icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--color-brass)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.63 3.4 2 2 0 0 1 3.6 1.22h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.8a16 16 0 0 0 6.29 6.29l.96-.96a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={() => { setshoweditphone(false); setselectedcustomer(null); }}
                  style={{ flex: 1, padding: '12px 0', border: '1px dashed rgba(35,42,59,0.3)', borderRadius: '6px', background: 'transparent', color: 'var(--color-ink)', cursor: 'pointer', fontSize: '15px', fontWeight: 500 }}
                >
                  Cancel
                </button>
                <div style={{ flex: 1 }}>
                  <StampButton tone="ink" onClick={editcustomerphone}>
                    {isediting ? 'Saving...' : 'Change'}
                  </StampButton>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}