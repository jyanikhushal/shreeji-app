import { customer, sortoption } from "@/types/dashboard";

export function filterandsortcustomers(
  customers: customer[],
  searchtext: string,
  sortoption: sortoption
): customer[] {
  return customers
    .filter((c) =>
      c.name.toLowerCase().includes(searchtext.toLowerCase()) ||
      c.phone.includes(searchtext)
    )
    .sort((a, b) => {
      if (sortoption === 'amount') {
        return (b.currentBalance ?? 0) - (a.currentBalance ?? 0);
      }
      if (sortoption === 'time') {
        const atime = a.lastDepositAt ? a.lastDepositAt.toDate().getTime() : 0;
        const btime = b.lastDepositAt ? b.lastDepositAt.toDate().getTime() : 0;
        return atime - btime;
      }
      return a.name.localeCompare(b.name);
    });
}