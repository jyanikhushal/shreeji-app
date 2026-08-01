import { useState } from "react";
import { useToast } from "@/app/context/ToastContext";
import { getData } from "@/app/utils/api";
import { isvalidphone } from "@/lib/dashboard/validators";
import { customer } from "@/types/dashboard";
import { generateTranslations } from "@/lib/transliteration/transliterate";
export function useAddCustomer(navigateto: (path: string) => void) {
  const { showMessage: showmessage } = useToast();
  const [showaddcustomer, setshowaddcustomer] = useState(false);
  const [name, setname] = useState('');
  const [phone, setphone] = useState('');

  const resetform = () => {
    setname("");
    setphone("");
  };

  const opendaddcustomer = () => {
    resetform();
    setshowaddcustomer(true);
  };

  const closeaddcustomer = () => {
    setshowaddcustomer(false);
    resetform();
  };

  const addcustomer = async () => {
    if (!name || !phone) {
      showmessage("error", 'please fill all fields');
      return;
    }

    if (!isvalidphone(phone)) {
      showmessage("error", "enter valid phone number");
      return;
    }

    try {
      const malikphone = localStorage.getItem("malikPhone");
      const nameTranslations = generateTranslations(name);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/grahak/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
                   malikPhone: malikphone,
                   name,
                   name_gu: nameTranslations.gu,
                   name_hi: nameTranslations.hi,
                   phone,
                 })
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

  return {
    showaddcustomer, name, setname, phone, setphone,
    opendaddcustomer, closeaddcustomer, addcustomer,
  };
}