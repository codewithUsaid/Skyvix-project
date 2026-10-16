import { useEffect, useState, useSyncExternalStore } from "react";
import type { Product } from "./products";

type CartItem = { product: Product; qty: number };

const KEY = "sc_cart_v1";
let items: CartItem[] = [];
const listeners = new Set<() => void>();

function load() {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) items = JSON.parse(raw);
  } catch {}
}
function persist() {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(items));
}
function emit() {
  listeners.forEach((l) => l());
}

load();

// Sync cart across open tabs
if (typeof window !== "undefined") {
  window.addEventListener("storage", (e) => {
    if (e.key === KEY) {
      load();
      emit();
    }
  });
}

export const cart = {
  add(product: Product, qty = 1) {
    const existing = items.find((i) => i.product.id === product.id);
    if (existing) existing.qty += qty;
    else items = [...items, { product, qty }];
    persist();
    emit();
  },
  remove(id: string) {
    items = items.filter((i) => i.product.id !== id);
    persist();
    emit();
  },
  setQty(id: string, qty: number) {
    items = items.map((i) => (i.product.id === id ? { ...i, qty: Math.max(1, qty) } : i));
    persist();
    emit();
  },
  clear() {
    items = [];
    persist();
    emit();
  },
  get items() {
    return items;
  },
};

export function useCart() {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  const snap = useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => items,
    () => items,
  );
  const count = hydrated ? snap.reduce((s, i) => s + i.qty, 0) : 0;
  const subtotal = hydrated ? snap.reduce((s, i) => s + i.qty * i.product.price, 0) : 0;
  return { items: hydrated ? snap : [], count, subtotal };
}
