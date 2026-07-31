export type customer = {
  name: string;
  phone: string;
};

export type entry = {
  entryNo: number;
  date: string;
  item: string;
  amount: string;
  total: number;
  pending?: boolean;
  awaitingResubmit?: boolean;
};

export type ledgerentry = {
  entryNo: number;
  date: string | { _seconds: number };
  description: string;
  amount: number | string;
  total: number;
};

export type confirmedentry = {
  entryNo: number;
  date: string | { _seconds: number };
  description: string;
  amount: number;
  total: number;
};

export type queueitem = {
  id: number;
  run: () => Promise<void>;
};