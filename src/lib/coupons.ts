export type Coupon = {
  code: string;
  type: "percent" | "fixed";
  value: number;
  minOrder?: number;
  maxDiscount?: number;
  description: string;
};

export type CouponResult =
  | { ok: true; code: string; discount: number; message: string }
  | { ok: false; error: string };

export const availableCoupons: Coupon[] = [
  { code: "SAVE10", type: "percent", value: 10, minOrder: 2000, description: "10% off orders over Rs. 2,000" },
  { code: "WELCOME500", type: "fixed", value: 500, minOrder: 5000, description: "Rs. 500 off orders over Rs. 5,000" },
  { code: "TECH20", type: "percent", value: 20, minOrder: 20000, maxDiscount: 5000, description: "20% off (up to Rs. 5,000) on orders over Rs. 20,000" },
];

export function validateCoupon(rawCode: string, subtotal: number): CouponResult {
  const code = rawCode.trim().toUpperCase();
  if (!code) return { ok: false, error: "Please enter a coupon code." };
  if (!/^[A-Z0-9]{3,20}$/.test(code)) {
    return { ok: false, error: "Coupon codes only contain letters and numbers (3–20 characters)." };
  }
  const coupon = availableCoupons.find((c) => c.code === code);
  if (!coupon) return { ok: false, error: `"${code}" is not a valid coupon code.` };
  if (coupon.minOrder && subtotal < coupon.minOrder) {
    return {
      ok: false,
      error: `${coupon.code} needs a minimum order of Rs. ${coupon.minOrder.toLocaleString()}. Your subtotal is Rs. ${subtotal.toLocaleString()}.`,
    };
  }
  let discount = coupon.type === "percent" ? Math.round((subtotal * coupon.value) / 100) : coupon.value;
  if (coupon.maxDiscount) discount = Math.min(discount, coupon.maxDiscount);
  discount = Math.min(discount, subtotal);
  return { ok: true, code: coupon.code, discount, message: `${coupon.code} applied — you saved Rs. ${discount.toLocaleString()}!` };
}

// ---- Applied coupon persistence (shared between cart & checkout) ----
const KEY = "sc_coupon_v1";

export function getAppliedCoupon(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? String(JSON.parse(raw)) : null;
  } catch {
    return null;
  }
}

export function setAppliedCoupon(code: string | null) {
  if (typeof window === "undefined") return;
  if (code) localStorage.setItem(KEY, JSON.stringify(code));
  else localStorage.removeItem(KEY);
}
