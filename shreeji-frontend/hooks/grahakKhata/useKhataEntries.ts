  import { useEffect, useRef, useState,useCallback } from "react";
  import { onSnapshot, collection } from "firebase/firestore";
  import { db } from "@/app/firebase";
  import { useToast } from "@/app/context/ToastContext";
  import { isValidPhone } from "@/lib/grahakKhata/validators";
  import { Entry } from "@/types/grahakKhata";

  export function useKhataEntries(phone: string | null, malikPhone: string | null, authChecked: boolean) {
    const { showMessage } = useToast();
    const [loading, setLoading] = useState(true);
    const [entries, setEntries] = useState<Entry[]>([]);
    const lastRowRef = useRef<HTMLTableRowElement | null>(null);
    const setLastRowRef = useCallback((el: HTMLTableRowElement | null) => {
  lastRowRef.current = el;
}, []);

    useEffect(() => {
      if (!phone || !malikPhone || !authChecked) return;
      if (!isValidPhone(phone)) {
        showMessage("error", "Invalid customer phone");
        return;
      }

      const entriesRef = collection(db, 'maliks', malikPhone, 'customers', phone, 'entries');
      const unsubscribe = onSnapshot(
        entriesRef,
        (snapshot) => {
          const data = snapshot.docs.map(doc => {
            const d = doc.data();
            return {
              entryNo: d.entryNo || 0,
              description: d.description || '',
              amount: d.amount || 0,
              total: d.total || 0,
              date: d.date?.toDate().toLocaleDateString() || '',
            };
          });
          const sorted = data.sort((a, b) => (a.entryNo || 0) - (b.entryNo || 0));
          setEntries(sorted);
          setLoading(false);
        },
        (err) => {
          console.error("Firestore error:", err);
          showMessage("error", err.message);
          setLoading(false);
        }
      );
      return () => unsubscribe();
    }, [phone, malikPhone, authChecked]);

    useEffect(() => {
      if (entries.length > 0) {
        lastRowRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
      }
    }, [entries]);

    return { loading, entries, lastRowRef ,setLastRowRef};
  }