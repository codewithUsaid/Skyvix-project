import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, Package, Truck, CreditCard, MapPin, ArrowRight, Printer } from "lucide-react";
import { useEffect, useState } from "react";
import { getOrder, type Order } from "@/lib/orders";
import { ProductImage } from "@/components/ProductImage";
import { formatPrice } from "@/lib/products";

export const Route = createFileRoute("/order-confirmation/$id")({
  head: () => ({
    meta: [{ title: "Order Confirmed — Skyvix" }, { name: "robots", content: "noindex" }],
  }),
  component: OrderConfirmation,
});

function OrderConfirmation() {
  const { id } = Route.useParams();
  const [order, setOrder] = useState<Order | null | undefined>(undefined);

  // Orders live in localStorage — read after hydration
  useEffect(() => {
    setOrder(getOrder(id) ?? null);
  }, [id]);

  if (order === undefined) {
    return (
      <div className="container-px mx-auto max-w-3xl py-16">
        <div className="h-40 animate-pulse rounded-3xl bg-muted" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container-px mx-auto max-w-7xl py-16 text-center">
        <h1 className="text-2xl font-bold">Order not found</h1>
        <p className="mt-2 text-sm text-muted-foreground">We couldn't find order #{id} on this device.</p>
        <Link to="/products" className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90">
          Continue shopping <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  const placed = new Date(order.date);
  const eta = new Date(placed.getTime() + 4 * 24 * 60 * 60 * 1000);
  const fmt = (d: Date) => d.toLocaleDateString("en-PK", { day: "numeric", month: "short", year: "numeric" });

  return (
    <div className="container-px mx-auto max-w-4xl py-10">
      {/* Success banner */}
      <div className="flex flex-col items-center rounded-3xl border border-success/30 bg-success/10 p-8 text-center">
        <span className="grid h-16 w-16 place-items-center rounded-full bg-success text-white">
          <CheckCircle2 className="h-8 w-8" />
        </span>
        <h1 className="mt-4 text-2xl font-extrabold md:text-3xl">Thank you! Your order is confirmed</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Order <span className="font-bold text-foreground">#{order.id}</span> · Placed on {fmt(placed)}
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          A confirmation has been sent to <span className="font-semibold text-foreground">{order.customer.email}</span>
        </p>
        <div className="mt-5 flex flex-wrap justify-center gap-3">
          <Link to="/account" className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90">
            <Package className="h-4 w-4" /> Track in My Account
          </Link>
          <button onClick={() => window.print()} className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-6 py-2.5 text-sm font-semibold hover:bg-muted">
            <Printer className="h-4 w-4" /> Print receipt
          </button>
        </div>
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-[1fr_320px]">
        {/* Items */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
          <h2 className="mb-4 text-lg font-bold">Items ({order.items.reduce((s, i) => s + i.qty, 0)})</h2>
          <ul className="space-y-3">
            {order.items.map(({ product, qty }) => (
              <li key={product.id} className="flex gap-3">
                <ProductImage gradient={product.gradient} emoji={product.emoji} image={product.image} className="h-16 w-16 shrink-0 rounded-xl" />
                <div className="flex-1 text-sm">
                  <p className="line-clamp-2 font-semibold">{product.title}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">Qty {qty} · {formatPrice(product.price)}</p>
                </div>
                <p className="text-sm font-bold">{formatPrice(product.price * qty)}</p>
              </li>
            ))}
          </ul>
          <dl className="mt-5 space-y-2 border-t border-border pt-4 text-sm">
            <div className="flex justify-between"><dt className="text-muted-foreground">Subtotal</dt><dd className="font-semibold">{formatPrice(order.subtotal)}</dd></div>
            <div className="flex justify-between"><dt className="text-muted-foreground">Shipping</dt><dd className="font-semibold">{order.shipping === 0 ? "FREE" : formatPrice(order.shipping)}</dd></div>
            {order.discount > 0 && (
              <div className="flex justify-between text-success"><dt>Discount {order.coupon ? `(${order.coupon})` : ""}</dt><dd className="font-semibold">-{formatPrice(order.discount)}</dd></div>
            )}
            <div className="flex justify-between border-t border-border pt-3 text-base"><dt className="font-bold">Total</dt><dd className="text-xl font-extrabold text-primary">{formatPrice(order.total)}</dd></div>
          </dl>
        </div>

        {/* Delivery + payment */}
        <div className="space-y-4">
          <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
            <h3 className="flex items-center gap-2 text-sm font-bold"><Truck className="h-4 w-4 text-primary" /> Delivery</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Estimated delivery by <span className="font-semibold text-foreground">{fmt(eta)}</span>
            </p>
            <p className="mt-1 inline-flex rounded-full bg-warning/15 px-2 py-0.5 text-xs font-semibold text-warning">{order.status}</p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
            <h3 className="flex items-center gap-2 text-sm font-bold"><MapPin className="h-4 w-4 text-primary" /> Shipping address</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">{order.customer.name}</span><br />
              {order.customer.address}<br />
              {order.customer.city}, {order.customer.postal}<br />
              {order.customer.phone}
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
            <h3 className="flex items-center gap-2 text-sm font-bold"><CreditCard className="h-4 w-4 text-primary" /> Payment</h3>
            <p className="mt-2 text-sm text-muted-foreground">{order.payment}</p>
          </div>
        </div>
      </div>

      <div className="mt-8 text-center">
        <Link to="/products" className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline">
          Continue shopping <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
