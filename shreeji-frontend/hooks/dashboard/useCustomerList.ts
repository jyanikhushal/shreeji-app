import { useEffect, useState, useMemo } from "react";
import { onSnapshot, collection } from "firebase/firestore";
import { db } from "@/app/firebase";
import { useToast } from "@/app/context/ToastContext";
import { customer, sortoption } from "@/types/dashboard";
import { filterandsortcustomers } from "@/lib/dashboard/sortCustomers";

export function useCustomerList() {
  const { showMessage: showmessage } = useToast();
  const [customers, setcustomers] = useState<customer[]>([]);
  const [searchtext, setsearchtext] = useState('');
  const [debouncedsearchtext, setdebouncedsearchtext] = useState('');
  const [sortoption, setsortoption] = useState<sortoption>('name');

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

  useEffect(() => {
    const handler = setTimeout(() => {
      setdebouncedsearchtext(searchtext);
    }, 150);

    return () => clearTimeout(handler);
  }, [searchtext]);

  const filteredcustomers = useMemo(() => {
    return filterandsortcustomers(customers, debouncedsearchtext, sortoption);
  }, [customers, debouncedsearchtext, sortoption]);

  // Consolidates the identical patch+re-sort logic used by both edit handlers
  const updatecustomerinlist = (phone: string, updates: Partial<customer>) => {
    setcustomers(prev => {
      const updated = prev.map(c => c.phone === phone ? { ...c, ...updates } : c);
      return updated.sort((a, b) => a.name.localeCompare(b.name));
    });
  };

  return {
    searchtext, setsearchtext,
    sortoption, setsortoption,
    filteredcustomers,
    updatecustomerinlist,
  };
}