import { useNavTransition } from "@/hooks/useNavTransition";
import { useModalBodyLock } from "@/hooks/useModalBodyLock";
import { useCustomerPhone } from "./useCustomerPhone";
import { useSessionGuard } from "./useSessionGuard";
import { useCustomerInfo } from "./useCustomerInfo";
import { useKhataData } from "./useKhataData";
import { useEntryQueue } from "./useEntryQueue";
import { useKhataOperations } from "./useKhataOperations";
import { useDepositModal } from "./useDepositModal";
import { useRowMenu } from "./useRowMenu";

export function useRunningKhata() {
  const { navigateTo: navigateto, stamping } = useNavTransition();

  useSessionGuard();
  const customerphone = useCustomerPhone();
  const customername = useCustomerInfo(customerphone);
  const { entries, setentries, loadkhata } = useKhataData(customerphone);

  const queue = useEntryQueue({ entries, setentries, loadkhata, customerphone });
  const operations = useKhataOperations({ customerphone, loadkhata });
  const deposit = useDepositModal({ submitdeposit: operations.submitdeposit });
  const rowMenu = useRowMenu({ entries, deleterow: operations.deleterow, iteminputrefs: queue.iteminputrefs });

  const anymodalopen = deposit.showdeposit || rowMenu.showrowmenu || rowMenu.showdeleteconfirm;
  useModalBodyLock(anymodalopen);

  // Glue: the Enter-key press on the amount field branches between three
  // already-decoupled behaviors. This orchestration has to live somewhere
  // that can see all three hooks — that's what a composer hook is for.
  const handleamountenter = async (index: number, value: string) => {
    const row = entries[index];
    if (rowMenu.editingrow === index) {
      await operations.editamount(row.entryNo, row.item, value);
      rowMenu.seteditingrow(null); // cleared unconditionally — matches original
    } else if (row.awaitingResubmit) {
      const isearliestawaitingresubmit = entries.findIndex(r => r.awaitingResubmit) === index;
      if (!isearliestawaitingresubmit) return;
      queue.handleresubmit(index);
    } else {
      queue.handleenter(index);
    }
  };

  const handleamountblur = (index: number, value: string) => {
    if (rowMenu.editingrow === index) {
      operations.editamount(entries[index].entryNo, entries[index].item, value);
    }
  };

  const handleitementer = (index: number) => {
    queue.amountinputrefs.current[index]?.focus();
  };

  const setrowref = (el: HTMLTableRowElement | null) => { queue.lastrowref.current = el; };
  const setitemref = (index: number) => (el: HTMLInputElement | null) => { queue.iteminputrefs.current[index] = el; };
  const setamountref = (index: number) => (el: HTMLInputElement | null) => { queue.amountinputrefs.current[index] = el; };

  return {
    navigateto, stamping,
    customerphone, customername,
    entries,
    loading: operations.loading, error: operations.error, issubmitting: operations.issubmitting,

    showdeposit: deposit.showdeposit,
    depositamount: deposit.depositamount,
    setdepositamount: deposit.setdepositamount,
    opendeposit: deposit.opendeposit,
    closedeposit: deposit.closedeposit,
    confirmdeposit: deposit.confirmdeposit,

    showrowmenu: rowMenu.showrowmenu,
    showdeleteconfirm: rowMenu.showdeleteconfirm,
    editingrow: rowMenu.editingrow,
    selectedrow: rowMenu.selectedrow,
    openrowmenu: rowMenu.openrowmenu,
    closerowmenu: rowMenu.closerowmenu,
    starteditingselected: rowMenu.starteditingselected,
    opendeleteconfirm: rowMenu.opendeleteconfirm,
    closedeleteconfirm: rowMenu.closedeleteconfirm,
    confirmdelete: rowMenu.confirmdelete,

    handlechange: queue.handlechange,
    handleitementer,
    handleamountenter,
    handleamountblur,
    setrowref, setitemref, setamountref,
  };
}