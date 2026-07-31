import { useState } from "react";
import { useToast } from "@/app/context/ToastContext";
import { entry } from "@/types/runningKhata";

interface UseRowMenuParams {
  entries: entry[];
  deleterow: (entryNo: number) => Promise<void>;
  iteminputrefs: React.MutableRefObject<(HTMLInputElement | null)[]>;
}

export function useRowMenu({ entries, deleterow, iteminputrefs }: UseRowMenuParams) {
  const { showMessage: showmessage } = useToast();
  const [selectedrow, setselectedrow] = useState<number | null>(null);
  const [showrowmenu, setshowrowmenu] = useState(false);
  const [showdeleteconfirm, setshowdeleteconfirm] = useState(false);
  const [editingrow, seteditingrow] = useState<number | null>(null);

  const openrowmenu = (index: number) => {
    setselectedrow(index);
    setshowrowmenu(true);
  };

  const closerowmenu = () => setshowrowmenu(false);

  const starteditingselected = () => {
    if (selectedrow === null) return;
    seteditingrow(selectedrow);
    setshowrowmenu(false);
    setTimeout(() => { iteminputrefs.current[selectedrow]?.focus(); }, 100);
  };

  const opendeleteconfirm = () => {
    setshowrowmenu(false);
    setshowdeleteconfirm(true);
  };

  const closedeleteconfirm = () => setshowdeleteconfirm(false);

  const confirmdelete = async () => {
    if (selectedrow === null) { setshowdeleteconfirm(false); return; }
    const index = selectedrow;
    if (index === 0) {
      showmessage("error", "First entry cannot be deleted");
      setshowdeleteconfirm(false);
      return;
    }
    if (index === entries.length - 1) {
      showmessage("error", "Cannot delete active entry row");
      setshowdeleteconfirm(false);
      return;
    }
    await deleterow(entries[index].entryNo);
    setshowdeleteconfirm(false);
  };

  return {
    selectedrow, showrowmenu, showdeleteconfirm, editingrow, seteditingrow,
    openrowmenu, closerowmenu, starteditingselected,
    opendeleteconfirm, closedeleteconfirm, confirmdelete,
  };
}