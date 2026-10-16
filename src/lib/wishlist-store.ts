import { useEffect, useState, useSyncExternalStore } from "react";
import { products, type Product } from "./products";

const KEY = "sc_wishlist_v1";
let ids: string[] = [];
const listeners = new Set<() => void>();

function load() {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const parsed: unknown = JSON.parse(raw);
      if (Array.isArray(parsed)) ids = parsed.filter((x): x is string => typeof x === "string");
    }
  } catch {}
}
function persist() {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(ids));
}
function emit() {
  listeners.forEach((l) => l());
}

load();

// Sync across open tabs
if (typeof window !== "undefined") {
  window.addEventListener("storage", (e) => {
    if (e.key === KEY) {
      load();
      emit();
    }
  });
}

export const wishlist = {
  has(id: string) {
    return ids.includes(id);
  },
  toggle(id: string): boolean {
    if (ids.includes(id)) {
      ids = ids.filter((x) => x !== id);
      persist();
      emit();
      return false;
    }
    ids = [...ids, id];
    persist();
    emit();
    return true;
  },
  remove(id: string) {
    ids = ids.filter((x) => x !== id);
    persist();
    emit();
  },
  get ids() {
    return ids;
  },
};

export function useWishlist() {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  const snap = useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => ids,
    () => ids,
  );
  const items: Product[] = hydrated
    ? snap.map((id) => products.find((p) => p.id === id)).filter((p): p is Product => Boolean(p))
    : [];
  return {
    items,
    count: items.length,
    has: (id: string) => hydrated && snap.includes(id),
  };
}
