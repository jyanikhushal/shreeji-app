import { useState } from "react";
import { useToast } from "@/app/context/ToastContext";
import { getData } from "@/app/utils/api";
import { isvalidphone } from "@/lib/dashboard/validators";
import { customer } from "@/types/dashboard";

type updatecustomerfn = (phone: string, updates: Partial<customer>) => void;

export function useEditCustomer(updatecustomerinlist: updatecustomerfn) {
  const { showMessage: showmessage } = useToast();
  const [showrowmenu, setshowrowmenu] = useState(false);
  const [selectedcustomer, setselectedcustomer] = useState<customer | null>(null);
  const [showeditname, setshoweditname] = useState(false);
  const [showeditphone, setshoweditphone] = useState(false);
  const [editname, seteditname] = useState('');
  const [editphone, seteditphone] = useState('');
  const [isediting, setisediting] = useState(false);

  const openrowmenu = (c: customer) => {
    setselectedcustomer(c);
    seteditname(c.name);
    seteditphone(c.phone);
    setshowrowmenu(true);
  };

  const closerowmenu = () => {
    setshowrowmenu(false);
    setselectedcustomer(null);
  };

  const openeditnamefrommenu = () => {
    setshowrowmenu(false);
    setshoweditname(true);
  };

  const openeditphonefrommenu = () => {
    setshowrowmenu(false);
    setshoweditphone(true);
  };

  const closeeditname = () => {
    setshoweditname(false);
    setselectedcustomer(null);
  };

  const closeeditphone = () => {
    setshoweditphone(false);
    setselectedcustomer(null);
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
      updatecustomerinlist(selectedcustomer.phone, { name: editname });

      showmessage("success", "name updated");
      setshoweditname(false);
      setselectedcustomer(null);
      seteditname('');
      setisediting(false);
    } catch {
      showmessage("error", "failed to update name");
      setisediting(false);
    }
  };

  const editcustomerphone = async () => {
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
      updatecustomerinlist(selectedcustomer.phone, { phone: editphone });

      showmessage("success", "phone number updated");
      setshoweditphone(false);
      setselectedcustomer(null);
      seteditphone('');
      setisediting(false);
    } catch {
      showmessage("error", "failed to update phone number");
      setisediting(false);
    }
  };

  return {
    showrowmenu, selectedcustomer,
    showeditname, showeditphone,
    editname, seteditname, editphone, seteditphone, isediting,
    openrowmenu, closerowmenu,
    openeditnamefrommenu, openeditphonefrommenu,
    closeeditname, closeeditphone,
    editcustomername, editcustomerphone,
  };
}