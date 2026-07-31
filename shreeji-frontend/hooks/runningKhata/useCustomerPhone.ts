import { useSearchParams } from "next/navigation";

export function useCustomerPhone() {
  const searchParams = useSearchParams();
  return searchParams.get('phone');
}