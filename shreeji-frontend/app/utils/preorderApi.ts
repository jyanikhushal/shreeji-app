import { getData } from "@/app/utils/api";

export async function grantGuestNotificationPermission(phone: string): Promise<void> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/preorder/guest/notification-permission`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone }),
  });
  await getData(res);
}

export async function preorderGuestLogin(phone: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/preorder/guest/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone }),
  });
  return getData<{ phone: string; name: string | null; createdAt: string }>(res);
}

export async function preorderGuestSetName(phone: string, name: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/preorder/guest/name`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone, name }),
  });
  return getData<{ phone: string; name: string; createdAt: string }>(res);
}

export async function submitPreorder(malikPhone: string, guestPhone: string, items: { item: string; quantity: string }[]) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/preorder`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ malikPhone, guestPhone, items }),
  });
  return getData<{ id: string; status: string }>(res);
}

export async function fetchPreorderQueue(malikPhone: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/preorder/${malikPhone}/queue`);
  return getData<import("@/types/preorder").Preorder[]>(res, { expectArray: true });
}

export async function updatePreorderStatus(malikPhone: string, preorderId: string, status: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/preorder/${malikPhone}/${preorderId}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
  return getData(res);
}

export async function checkKhataMatch(malikPhone: string, guestPhone: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/preorder/${malikPhone}/khata-match/${guestPhone}`);
  return getData<{ khataRegisteredName: string } | null>(res);
}

export async function savePreorderDestination(
  malikPhone: string, preorderId: string, savedAs: "normal" | "khata",
  savedNames?: { typedByCustomer: string; khataRegisteredName: string }
) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/preorder/${malikPhone}/${preorderId}/save`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ savedAs, savedNames }),
  });
  return getData(res);
}

export async function fetchGuestOrderHistory(malikPhone: string, guestPhone: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/preorder/${malikPhone}/guest-history/${guestPhone}`);
  return getData<import("@/types/preorder").Preorder[]>(res, { expectArray: true });
}