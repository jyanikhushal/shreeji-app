export type Entry = {
  entryNo: number;
  date: string;
  description: string;
  amount: number;
  total: number;
};

export type NotificationItem = {
  id: string;
  type: string;
  title: string;
  body: string;
  createdAt: string;
};