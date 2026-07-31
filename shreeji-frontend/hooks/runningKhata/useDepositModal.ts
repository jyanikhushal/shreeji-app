import { useState } from "react";

interface UseDepositModalParams {
  submitdeposit: (amount: string) => Promise<'skipped' | 'invalid' | 'failed' | 'success'>;
}

export function useDepositModal({ submitdeposit }: UseDepositModalParams) {
  const [showdeposit, setshowdeposit] = useState(false);
  const [depositamount, setdepositamount] = useState('');

  const opendeposit = () => setshowdeposit(true);
  const closedeposit = () => setshowdeposit(false);

  const confirmdeposit = async () => {
    const result = await submitdeposit(depositamount);
    if (result === 'invalid') {
      setdepositamount('');
    } else if (result === 'success') {
      setdepositamount('');
      setshowdeposit(false);
    }
    // 'skipped' and 'failed' leave the field/modal untouched, same as original
  };

  return { showdeposit, depositamount, setdepositamount, opendeposit, closedeposit, confirmdeposit };
}