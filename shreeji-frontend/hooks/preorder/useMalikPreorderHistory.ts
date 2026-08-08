import { useEffect, useState, useMemo, useCallback } from "react";
import { useToast } from "@/app/context/ToastContext";
import { fetchAllMalikOrders } from "@/app/utils/preorderApi";
import type { Preorder } from "@/types/preorder";

type SortOption = "newest" | "oldest";
type GroupOption = "none" | "guest";

export function useMalikPreorderHistory(malikPhone: string | null) {
  const { showMessage } = useToast();
  const [orders, setOrders] = useState<Preorder[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortOption, setSortOption] = useState<SortOption>("newest");
  const [groupOption, setGroupOption] = useState<GroupOption>("none");
  const [selectedOrder, setSelectedOrder] = useState<Preorder | null>(null);

  const loadOrders = useCallback(async () => {
    if (!malikPhone) return;
    setLoading(true);
    try {
      const data = await fetchAllMalikOrders(malikPhone);
      setOrders(data);
    } catch (err) {
      showMessage("error", err instanceof Error ? err.message : "Failed to load orders");
    } finally {
      setLoading(false);
    }
  }, [malikPhone, showMessage]);

  useEffect(() => { loadOrders(); }, [loadOrders]);

  const sortedOrders = useMemo(() => {
    const copy = [...orders];
    copy.sort((a, b) => {
      const diff = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      return sortOption === "newest" ? -diff : diff;
    });
    return copy;
  }, [orders, sortOption]);

  const groupedOrders = useMemo(() => {
    if (groupOption === "none") return { "All Orders": sortedOrders };
    const groups: Record<string, Preorder[]> = {};
    sortedOrders.forEach((order) => {
      const key = order.guestName || order.guestPhone;
      if (!groups[key]) groups[key] = [];
      groups[key].push(order);
    });
    return groups;
  }, [sortedOrders, groupOption]);

  const openOrder = (order: Preorder) => setSelectedOrder(order);
  const closeOrder = () => setSelectedOrder(null);

  return {
    orders: sortedOrders, groupedOrders, loading, sortOption, setSortOption,
    groupOption, setGroupOption, selectedOrder, openOrder, closeOrder,
  };
}