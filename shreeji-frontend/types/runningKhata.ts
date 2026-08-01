export type customer = {
  name: string;
  name_gu?: string;
  name_hi?: string;
  phone: string;
};

export type entry = {
  entryNo: number;
  date: string;
  item: string;
  item_gu?: string;
  item_hi?: string;
  amount: string;
  total: number;
  pending?: boolean;
  awaitingResubmit?: boolean;
};

export type ledgerentry = {
  entryNo: number;
  date: string | { _seconds: number };
  description: string;
  description_gu?: string;
  description_hi?: string;
  amount: number | string;
  total: number;
};

export type confirmedentry = {
  entryNo: number;
  date: string | { _seconds: number };
  description: string;
  description_gu?: string;
  description_hi?: string;
  amount: number;
  total: number;
};

export type queueitem = {
  id: number;
  run: () => Promise<void>;
};