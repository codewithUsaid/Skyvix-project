import { createFileRoute, Link } from "@tanstack/react-router";
import { Minus, Plus, Trash2, ShoppingBag, Tag, ArrowRight, X, BadgePercent } from "lucide-react";
import { useEffect, useState } from "react";
import { useCart, cart } from "@/lib/cart-store";
import { ProductImage } from "@/components/ProductImage";
import { formatPrice } from "@/lib/products";
import { validateCoupon, getAppliedCoupon, setAppliedCoupon, availableCoupons } from "@/lib/coupons";
import { toast } from "sonner";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [{ title: "Shopping Cart — Skyvix" }, { name: "robots", content: "noindex" }],
  }),
  component: CartPage,
});

function CartPage() {
  const { items, subtotal, count } = useCart();
  const [code, setCode] = useState("");
  const [applied, setApplied] = useState<{ code: string; discount: number } | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);

  const shipping = subtotal > 5000 || subtotal === 0 ? 0 : 250;
  const discount = applied?.discount ?? 0;
  const total = subtotal + shipping - discount;

  // Re-validate the saved coupon whenever the subtotal changes (e.g. qty edits)
  useEffect(() => {
    const saved = getAppliedCoupon();
    if (!saved || subtotal === 0) {
      setApplied(null);
      return;
    }
    const r = validateCoupon(saved, subtotal);
    if (r.ok) setApplied({ code: r.code, discount: r.discount });
    else {
      setApplied(null);
      setAppliedCoupon(null);
    }
  }, [subtotal]);

  const applyCoupon = () => {
    const r = validateCoupon(code, subtotal);
    if (r.ok) {
      setApplied({ code: r.code, discount: r.discount });
      setAppliedCoupon(r.code);
      setCouponError(null);
      setCode("");
      toast.success("Coupon applied", { description: r.message });
    } else {
      setApplied(null);
      setAppliedCoupon(null);
      setCouponError(r.error);
    }
  };

  const removeCoupon = () => {
    setApplied(null);
    setAppliedCoupon(null);
    setCouponError(null);
    setCode("");
  };

  if (items.length === 0) {
    return (
      <div className="container-px mx-auto max-w-7xl py-16">
        <div className="mx-auto flex max-w-md flex-col items-center rounded-3xl border border-dashed border-border p-12 text-center">
          <span className="grid h-16 w-16 place-items-center rounded-full bg-primary-soft text-primary">
            <ShoppingBag className="h-7 w-7" />
          </span>
          <h1 className="mt-5 text-2xl font-bold">Your cart is empty</h1>
          <p className="mt-2 text-sm text-muted-foreground">Browse our latest deals and add your favorites.</p>
          <Link to="/products" className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90">
            Start Shopping <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container-px mx-auto max-w-7xl py-8">
      <h1 className="mb-6 text-3xl font-extrabold">Shopping Cart <span className="text-base font-medium text-muted-foreground">({count} items)</span></h1>
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-3">
          {items.map(({ product, qty }) => (
            <div key={product.id} className="flex gap-4 rounded-2xl border border-border bg-card p-3 shadow-soft md:p-4">
              <Link to="/products/$slug" params={{ slug: product.slug }} className="shrink-0 overflow-hidden rounded-xl">
                <ProductImage gradient={product.gradient} emoji={product.emoji} image={product.image} className="h-24 w-24 md:h-28 md:w-28" />
              </Link>
              <div className="flex flex-1 flex-col">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{product.brand}</p>
                <Link to="/products/$slug" params={{ slug: product.slug }} className="mt-0.5 line-clamp-2 text-sm font-semibold hover:text-primary md:text-base">
                  {product.title}
                </Link>
                <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-2">
                  <div className="inline-flex items-center rounded-full border border-border">
                    <button onClick={() => cart.setQty(product.id, qty - 1)} className="grid h-8 w-8 place-items-center hover:bg-muted" aria-label="Decrease quantity">
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="w-8 text-center text-sm font-bold">{qty}</span>
                    <button onClick={() => cart.setQty(product.id, qty + 1)} className="grid h-8 w-8 place-items-center hover:bg-muted" aria-label="Increase quantity">
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-base font-extrabold">{formatPrice(product.price * qty)}</span>
                    <button onClick={() => cart.remove(product.id)} className="grid h-8 w-8 place-items-center rounded-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive" aria-label="Remove">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <aside className="h-fit rounded-2xl border border-border bg-card p-6 shadow-card lg:sticky lg:top-40">
          <h2 className="text-lg font-bold">Order Summary</h2>

          {applied ? (
            <div className="mt-4 flex items-center justify-between rounded-xl border border-success/40 bg-success/10 px-3 py-2.5">
              <div className="flex items-center gap-2 text-sm">
                <BadgePercent className="h-4 w-4 text-success" />
                <span className="font-bold text-success">{applied.code}</span>
                <span className="text-muted-foreground">-{formatPrice(applied.discount)}</span>
              </div>
              <button onClick={removeCoupon} className="grid h-6 w-6 place-items-center rounded-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive" aria-label="Remove coupon">
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <div className="mt-4">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Tag className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    value={code}
                    onChange={(e) => {
                      setCode(e.target.value.toUpperCase().slice(0, 20));
                      setCouponError(null);
                    }}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), applyCoupon())}
                    placeholder="Coupon code"
                    maxLength={20}
                    className={`w-full rounded-full border bg-surface py-2.5 pl-9 pr-3 text-sm uppercase outline-none focus:border-primary ${
                      couponError ? "border-destructive" : "border-border"
                    }`}
                  />
                </div>
                <button
                  onClick={applyCoupon}
                  className="rounded-full bg-foreground px-4 py-2.5 text-sm font-semibold text-background hover:bg-foreground/90"
                >
                  Apply
                </button>
              </div>
              {couponError && <p className="mt-2 text-xs font-medium text-destructive">{couponError}</p>}
              <div className="mt-3 flex flex-wrap gap-1.5">
                {availableCoupons.map((c) => (
                  <button
                    key={c.code}
                    onClick={() => {
                      setCode(c.code);
                      setCouponError(null);
                    }}
                    title={c.description}
                    className="rounded-full border border-dashed border-primary/50 bg-primary-soft px-2.5 py-1 text-[11px] font-bold text-primary transition hover:bg-primary hover:text-primary-foreground"
                  >
                    {c.code}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mt-5 rounded-lg border border-border bg-surface p-3 text-xs">
            {subtotal > 5000 ? (
              <p className="font-semibold text-success">You've unlocked FREE delivery!</p>
            ) : (
              <p className="text-muted-foreground">Add <span className="font-semibold text-foreground">{formatPrice(5001 - subtotal)}</span> more for FREE delivery</p>
            )}
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
              <div className="h-full bg-primary transition-all" style={{ width: `${Math.min(100, (subtotal / 5001) * 100)}%` }} />
            </div>
            <p className="mt-2 text-muted-foreground">Delivery only in Bahria Town Karachi · Cash on Delivery</p>
          </div>
          <dl className="mt-5 space-y-2.5 text-sm">
            <div className="flex justify-between"><dt className="text-muted-foreground">Subtotal</dt><dd className="font-semibold">{formatPrice(subtotal)}</dd></div>
            <div className="flex justify-between"><dt className="text-muted-foreground">Shipping</dt><dd className="font-semibold">{shipping === 0 ? "FREE" : formatPrice(shipping)}</dd></div>
            {discount > 0 && <div className="flex justify-between text-success"><dt>Discount ({applied?.code})</dt><dd className="font-semibold">-{formatPrice(discount)}</dd></div>}
            <div className="my-3 border-t border-border" />
            <div className="flex justify-between text-base"><dt className="font-bold">Total</dt><dd className="text-xl font-extrabold text-primary">{formatPrice(total)}</dd></div>
          </dl>

          <Link to="/checkout" className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/30 transition hover:bg-primary/90">
            Proceed to Checkout <ArrowRight className="h-4 w-4" />
          </Link>
          <Link to="/products" className="mt-3 inline-flex w-full items-center justify-center text-sm font-medium text-muted-foreground hover:text-primary">
            Continue shopping
          </Link>
        </aside>
      </div>
    </div>
  );
}
