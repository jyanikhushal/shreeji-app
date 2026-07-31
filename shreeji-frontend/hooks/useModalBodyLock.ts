import { useEffect } from "react";

export function useModalBodyLock(anymodalopen: boolean) {
  useEffect(() => {
    document.body.style.overflow = anymodalopen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [anymodalopen]);
}