import { useState } from "react";
import { useToast } from "@/app/context/ToastContext";
import { getData } from "@/app/utils/api";
import { isvalidamount } from "@/lib/runningKhata/validators";

type depositresult = 'skipped' | 'invalid' | 'failed' | 'success';

interface UseKhataOperationsParams {
  customerphone: string | null;
  loadkhata: () => Promise<boolean>;
}

export function useKhataOperations({ customerphone, loadkhata }: UseKhataOperationsParams) {
  const { showMessage: showmessage } = useToast();
  const [loading, setloading] = useState(false);
  const [error, seterror] = useState('');
  const [issubmitting, setissubmitting] = useState(false);

  const submitdeposit = async (depositamount: string): Promise<depositresult> => {
    if (issubmitting) return 'skipped';
    if (!isvalidamount(depositamount)) {
      showmessage("error", "Enter valid amount");
      return 'invalid';
    }
    const dep = Number(depositamount);
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
      return 'success';
    } catch {
      seterror("deposit failed");
      showmessage("error", "check your internet connection");
      return 'failed';
    } finally {
      setloading(false);
      setissubmitting(false);
    }
  };

  const editamount = async (entryNo: number, item: string, newamount: string): Promise<boolean> => {
    if (issubmitting) return false;
    if (!isvalidamount(newamount)) {
      showmessage("error", "Enter valid amount");
      return false;
    }
    const amountnum = Number(newamount);
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
          entryNo,
          amount: amountnum,
          description: item
        })
      });
      await getData(res);
      await loadkhata();
      return true;
    } catch {
      seterror("Edit failed");
      return false;
    } finally {
      setloading(false);
      setissubmitting(false);
    }
  };

  const deleterow = async (entryNo: number) => {
    try {
      setloading(true);
      seterror("");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/khata/delete`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          malikPhone: localStorage.getItem("malikPhone"),
          phone: customerphone,
          entryNo
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

  return { loading, error, issubmitting, submitdeposit, editamount, deleterow };
}