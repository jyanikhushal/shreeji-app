import { useRef, useState, useEffect } from "react";
import { useToast } from "@/app/context/ToastContext";
import { getData } from "@/app/utils/api";
import { entry, queueitem, confirmedentry } from "@/types/runningKhata";
import { isvalidamount } from "@/lib/runningKhata/validators";
import { formattoday, formatconfirmeddate } from "@/lib/runningKhata/dateFormat";
import { generateTranslations } from "@/lib/transliteration/transliterate";
interface UseEntryQueueParams {
  entries: entry[];
  setentries: React.Dispatch<React.SetStateAction<entry[]>>;
  loadkhata: () => Promise<boolean>;
  customerphone: string | null;
}

export function useEntryQueue({ entries, setentries, loadkhata, customerphone }: UseEntryQueueParams) {
  const { showMessage: showmessage } = useToast();

  const iteminputrefs = useRef<(HTMLInputElement | null)[]>([]);
  const amountinputrefs = useRef<(HTMLInputElement | null)[]>([]);
  const lastrowref = useRef<HTMLTableRowElement | null>(null);

   const setlastrowref = (el: HTMLTableRowElement | null) => { lastrowref.current = el; };
  const setitemref = (index: number) => (el: HTMLInputElement | null) => { iteminputrefs.current[index] = el; };
  const setamountref = (index: number) => (el: HTMLInputElement | null) => { amountinputrefs.current[index] = el; };

  const submitqueueitemsref = useRef<queueitem[]>([]);
  const queuerunningref = useRef(false);
  const queuevalidref = useRef(true);
  const [isresyncing, setisresyncing] = useState(false);
  const entriesref = useRef<entry[]>(entries);

  useEffect(() => { entriesref.current = entries; }, [entries]);

  useEffect(() => {
    if (entries.length > 0) {
      lastrowref.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [entries]);

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
    const itemTranslations = generateTranslations(itemname);
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
                  item_gu: itemTranslations.gu,
                  item_hi: itemTranslations.hi,
                  amount: amountnum,
                }),
          });
          const confirmed = await getData<confirmedentry>(res);
          if (!queuevalidref.current) return;

          const confirmeddate = formatconfirmeddate(confirmed.date, todaystr);
          setentries(prev => prev.map(row =>
            row.entryNo === provisionalentryno && row.pending
              ? { entryNo: confirmed.entryNo, date: confirmeddate, item: confirmed.description, item_gu: confirmed.description_gu, item_hi: confirmed.description_hi, amount: String(confirmed.amount), total: confirmed.total}
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
     const itemTranslations = generateTranslations(itemname);
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
                 item_gu: itemTranslations.gu,
                 item_hi: itemTranslations.hi,
                 amount: amountnum,
               }),
          });
          const confirmed = await getData<confirmedentry>(res);
          if (!queuevalidref.current) return;

          const confirmeddate = formatconfirmeddate(confirmed.date, todaystr);
          setentries(prev => prev.map(row =>
            row.entryNo === entryno && row.pending
              ? { entryNo: confirmed.entryNo, date: confirmeddate, item: confirmed.description, item_gu: confirmed.description_gu, item_hi: confirmed.description_hi, amount: String(confirmed.amount), total: confirmed.total }
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

  return {
    iteminputrefs, amountinputrefs, lastrowref,
    setlastrowref, setitemref, setamountref,
    isresyncing,
    handlechange, handleenter, handleresubmit,
  };
}