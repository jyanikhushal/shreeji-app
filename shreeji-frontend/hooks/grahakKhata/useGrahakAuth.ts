import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isSessionValid } from "@/app/utils/session";

export function useGrahakAuth() {
  const router = useRouter();
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    if (!isSessionValid("grahak")) {
      router.replace("/login/grahak");
      return;
    }
    setAuthChecked(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return authChecked;
}