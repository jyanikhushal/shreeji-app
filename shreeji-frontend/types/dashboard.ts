import { Timestamp } from "firebase/firestore";

export type customer = {
  name: string;
  phone: string;
  currentBalance?: number;
  lastDepositAt?: Timestamp | null;
};

export type malik = {
  name: string;
  phone: string;
  shopName: string;
};

export type sortoption = 'name' | 'amount' | 'time';