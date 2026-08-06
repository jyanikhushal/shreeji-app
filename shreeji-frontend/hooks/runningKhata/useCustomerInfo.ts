import { useState, useEffect } from "react";
import { useToast } from "@/app/context/ToastContext";
import { getData } from "@/app/utils/api";
import { customer } from "@/types/runningKhata";

export function useCustomerInfo(customerphone: string | null) {
  const { showMessage: showmessage } = useToast();
  const [customername, setcustomername] = useState('');

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

  return customername;
}