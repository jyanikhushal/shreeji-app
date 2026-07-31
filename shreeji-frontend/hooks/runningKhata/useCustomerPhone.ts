import { useState } from "react";

export function useCustomerPhone() {
  const [customerphone] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    const sp = new URLSearchParams(window.location.search);
    return sp.get('phone');
  });

  return customerphone;
}