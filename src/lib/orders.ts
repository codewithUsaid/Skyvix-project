import type { Product } from "./products";

export type OrderItem = { product: Product; qty: number };

export type OrderCustomer = {
  name: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  postal: string;
};

export type Order = {
  id: string;
  date: string; // ISO string
  status: "Processing" | "Shipped" | "Delivered";
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  discount: number;
  coupon?: string;
  total: number;
  payment: string;
  customer: OrderCustomer;
};

const KEY = "sc_orders_v1";
let orders: Order[] = [];
let loaded = false;

function load() {
  if (typeof window === "undefined" || loaded) return;
  loaded = true;
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const parsed: unknown = JSON.parse(raw);
      if (Array.isArray(parsed)) orders = parsed as Order[];
    }
  } catch {}
}

function persist() {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(orders));
}

export function placeOrder(input: {
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  discount: number;
  coupon?: string;
  total: number;
  payment: string;
  customer: OrderCustomer;
}): Order {
  load();
  const order: Order = {
    id: `SC-${Math.floor(10000 + Math.random() * 90000)}`,
    date: new Date().toISOString(),
    status: "Processing",
    ...input,
  };
  orders = [order, ...orders];
  persist();
  return order;
}

export function getOrder(id: string): Order | undefined {
  load();
  return orders.find((o) => o.id === id);
}

export function listOrders(): Order[] {
  load();
  return orders;
}
