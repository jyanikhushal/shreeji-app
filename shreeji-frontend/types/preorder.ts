export interface PreorderRow {
  id: string;
  item: string;
  quantity: string;
}

export interface PreorderGuest {
  phone: string;
  name: string | null;
  createdAt: string;
}

export type PreorderStatus = 'pending' | 'in_progress' | 'ready' | 'collected' | 'cancelled';

export interface Preorder {
  id: string;
  malikId: string;
  guestPhone: string;
  guestName: string | null;
  orderNumber?: number;
  items: { item: string; quantity: string }[];
  status: PreorderStatus;
  createdAt: string;
  updatedAt: string;
  readyAt: string | null;
  collectedAt: string | null;
  savedAs: 'khata' | 'normal' | null;
  savedNames: { typedByCustomer: string; khataRegisteredName: string } | null;
}