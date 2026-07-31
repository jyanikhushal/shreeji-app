import { useState, useEffect } from "react";
import { useToast } from "@/app/context/ToastContext";
import { getData } from "@/app/utils/api";
import { entry, ledgerentry } from "@/types/runningKhata";
import { formattoday, formatledgerdate } from "@/lib/runningKhata/dateFormat";

export function useKhataData(customerphone: string | null) {
  const { showMessage: showmessage } = useToast();
  const [entries, setentries] = useState<entry[]>([{
    entryNo: 1,
    date: '01/02/2006',
    item: '',
    amount: '',
    total: 0,
  }]);

  async function loadkhata(): Promise<boolean> {
    try {
      const url = `${process.env.NEXT_PUBLIC_API_URL}/khata/${customerphone}?malikPhone=${localStorage.getItem("malikPhone")}`;
      const res = await fetch(url);
      const data = await getData<ledgerentry[]>(res, { expectArray: true });

      if (data.length > 0) {
        const formatted: entry[] = data.map((e: ledgerentry) => ({
          entryNo: e.entryNo,
          date: formatledgerdate(e.date, ""),
          item: e.description || "",
          amount: String(e.amount ?? ""),
          total: e.total
        }));

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

  return { entries, setentries, loadkhata };
}