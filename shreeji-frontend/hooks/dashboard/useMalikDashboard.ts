import { useNavTransition } from "@/hooks/useNavTransition";
import { useNowTicker } from "@/hooks/useNowTicker";
import { useMalikSession } from "./useMalikSession";
import { useCustomerList } from "./useCustomerList";
import { useAddCustomer } from "./useAddCustomer";
import { useEditCustomer } from "./useEditCustomer";

export function useMalikDashboard() {
  const { navigateTo: navigateto, stamping } = useNavTransition();
  const { malikdata, logout } = useMalikSession();
  const now = useNowTicker();
  const customerList = useCustomerList();
  const addCustomer = useAddCustomer(navigateto);
  const editCustomer = useEditCustomer(customerList.updatecustomerinlist);

  return {
    navigateto, stamping, malikdata, logout, now,
    ...customerList,
    ...addCustomer,
    ...editCustomer,
  };
}