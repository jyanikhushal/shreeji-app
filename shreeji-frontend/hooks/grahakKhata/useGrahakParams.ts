import { useSearchParams } from "next/navigation";

export function useGrahakParams() {
  const searchParams = useSearchParams();
  const phone = searchParams.get("phone");
  const malikPhone = searchParams.get("malikPhone");
  return { phone, malikPhone };
}