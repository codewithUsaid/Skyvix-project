import { createFileRoute, Link } from "@tanstack/react-router";
import { CreditCard, Truck, ShieldCheck, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { useCart, cart } from "@/lib/cart-store";
import { ProductImage } from "@/components/ProductImage";
import { formatPrice } from "@/lib/products";
import { getAppliedCoupon, setAppliedCoupon, validateCoupon } from "@/lib/coupons";
import { placeOrder } from "@/lib/orders";
import { toast } from "sonner";

export const Route = createFileRoute("/checkout")({
  head: () => ({ meta: [{ title: "Checkout — Skyvix" }, { name: "robots", content: "noindex" }] }),
  component: Checkout,
});

const paymentLabels: Record<string, string> = {
  cod: "Cash on Delivery",
  card: "Credit / Debit Card",
  bank: "Bank Transfer",
};

function Checkout() {
  const { items, subtotal } = useCart();
  const navigate = Route.useNavigate();
  const [pay, setPay] = useState("cod");
  const [placing, setPlacing] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const shipping = subtotal > 5000 || subtotal === 0 ? 0 : 250;

  // Carry over a coupon applied on the cart page (re-validated against current subtotal)
  const savedCoupon = getAppliedCoupon();
  const couponResult = savedCoupon && subtotal > 0 ? validateCoupon(savedCoupon, subtotal) : null;
  const discount = couponResult?.ok ? couponResult.discount : 0;
  const total = subtotal + shipping - discount;

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const customer = {
      name: String(fd.get("name") ?? "").trim(),
      phone: String(fd.get("phone") ?? "").trim(),
      email: String(fd.get("email") ?? "").trim(),
      address: String(fd.get("address") ?? "").trim(),
      city: String(fd.get("city") ?? "").trim(),
      postal: String(fd.get("postal") ?? "").trim(),
    };

    const errs: Record<string, string> = {};
    if (customer.name.length < 3 || customer.name.length > 100) errs.name = "Enter your full name (3–100 characters).";
    if (!/^[0-9+\-\s]{7,15}$/.test(customer.phone)) errs.phone = "Enter a valid phone number, e.g. 0300 1234567.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(customer.email) || customer.email.length > 255) errs.email = "Enter a valid email address.";
    if (customer.address.length < 5 || customer.address.length > 200) errs.address = "Enter a complete street address.";
    if (customer.city.length < 2 || customer.city.length > 60) errs.city = "Enter your city.";
    if (!/^[0-9]{4,6}$/.test(customer.postal)) errs.postal = "Enter a valid postal code (4–6 digits).";
    setErrors(errs);
    if (Object.keys(errs).length > 0) {
      toast.error("Please fix the highlighted fields");
      return;
    }

    setPlacing(true);
    const order = placeOrder({
      items,
      subtotal,
      shipping,
      discount,
      coupon: couponResult?.ok ? couponResult.code : undefined,
      total,
      payment: paymentLabels[pay] ?? pay,
      customer,
    });
    cart.clear();
    setAppliedCoupon(null);
    toast.success("Order placed! 🎉", { description: `Order #${order.id} confirmed.` });
    navigate({ to: "/order-confirmation/$id", params: { id: order.id } });
  };

  if (items.length === 0 && !placing) {
    return (
      <div className="container-px mx-auto max-w-7xl py-16 text-center">
        <h1 className="text-2xl font-bold">Your cart is empty</h1>
        <Link to="/products" className="mt-4 inline-block text-primary">Browse products</Link>
      </div>
    );
  }

  return (
    <div className="container-px mx-auto max-w-7xl py-8">
      <h1 className="mb-6 text-3xl font-extrabold">Checkout</h1>
      <form onSubmit={submit} className="grid gap-6 lg:grid-cols-[1fr_380px]" noValidate>
        <div className="space-y-6">
          <Card title="Shipping Details" icon={Truck}>
            <div className="grid gap-4 md:grid-cols-2">
              <Input label="Full name" name="name" autoComplete="name" error={errors.name} />
              <Input label="Phone" name="phone" autoComplete="tel" placeholder="0300 1234567" error={errors.phone} />
              <Input label="Email" name="email" type="email" autoComplete="email" className="md:col-span-2" error={errors.email} />
              <Input label="Address line" name="address" autoComplete="street-address" className="md:col-span-2" error={errors.address} />
              <Input label="City" name="city" autoComplete="address-level2" error={errors.city} />
              <Input label="Postal code" name="postal" autoComplete="postal-code" placeholder="75500" error={errors.postal} />
            </div>
          </Card>

          <Card title="Billing Details" icon={CreditCard}>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" defaultChecked className="h-4 w-4 accent-primary" />
              Same as shipping address
            </label>
          </Card>

          <Card title="Payment Method" icon={ShieldCheck}>
            <div className="grid gap-3 md:grid-cols-3">
              {[
                { id: "cod", label: "Cash on Delivery", sub: "Pay when you receive" },
                { id: "card", label: "Credit / Debit Card", sub: "Visa, Mastercard" },
                { id: "bank", label: "Bank Transfer", sub: "Direct deposit" },
              ].map((m) => (
                <label key={m.id} className={`relative cursor-pointer rounded-2xl border-2 p-4 transition ${pay === m.id ? "border-primary bg-primary-soft" : "border-border hover:border-muted-foreground/40"}`}>
                  <input type="radio" name="pay" value={m.id} checked={pay === m.id} onChange={() => setPay(m.id)} className="sr-only" />
                  <p className="text-sm font-bold">{m.label}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{m.sub}</p>
                  {pay === m.id && <CheckCircle2 className="absolute right-3 top-3 h-4 w-4 text-primary" />}
                </label>
              ))}
            </div>
          </Card>
        </div>

        <aside className="h-fit rounded-2xl border border-border bg-card p-6 shadow-card lg:sticky lg:top-40">
          <h2 className="text-lg font-bold">Order Summary</h2>
          <ul className="mt-4 space-y-3">
            {items.map(({ product, qty }) => (
              <li key={product.id} className="flex gap-3">
                <ProductImage gradient={product.gradient} emoji={product.emoji} image={product.image} className="h-14 w-14 shrink-0 rounded-lg" />
                <div className="flex-1 text-sm">
                  <p className="line-clamp-1 font-semibold">{product.title}</p>
                  <p className="text-xs text-muted-foreground">Qty {qty} · {formatPrice(product.price)}</p>
                </div>
                <p className="text-sm font-bold">{formatPrice(product.price * qty)}</p>
              </li>
            ))}
          </ul>
          <div className="mt-5 space-y-2 border-t border-border pt-4 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span className="font-semibold">{formatPrice(subtotal)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Shipping</span><span className="font-semibold">{shipping === 0 ? "FREE" : formatPrice(shipping)}</span></div>
            {discount > 0 && (
              <div className="flex justify-between text-success"><span>Discount ({couponResult?.ok ? couponResult.code : ""})</span><span className="font-semibold">-{formatPrice(discount)}</span></div>
            )}
            <div className="flex justify-between border-t border-border pt-3 text-base"><span className="font-bold">Total</span><span className="text-xl font-extrabold text-primary">{formatPrice(total)}</span></div>
          </div>
          <button
            type="submit"
            disabled={placing}
            className="mt-6 w-full rounded-full bg-primary py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/30 transition hover:bg-primary/90 disabled:opacity-60"
          >
            {placing ? "Placing order..." : "Place Order"}
          </button>
          <p className="mt-3 text-center text-xs text-muted-foreground">Your data is encrypted and secure.</p>
        </aside>
      </form>
    </div>
  );
}

function Card({ title, icon: Icon, children }: { title: string; icon: any; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-border bg-card p-6 shadow-soft">
      <h2 className="mb-4 flex items-center gap-2 text-lg font-bold"><Icon className="h-5 w-5 text-primary" /> {title}</h2>
      {children}
    </section>
  );
}

function Input({ label, error, className = "", ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: string; error?: string }) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1.5 block text-xs font-semibold text-muted-foreground">{label}</span>
      <input
        {...props}
        className={`w-full rounded-xl border bg-surface px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 ${
          error ? "border-destructive" : "border-border"
        }`}
      />
      {error && <span className="mt-1 block text-xs font-medium text-destructive">{error}</span>}
    </label>
  );
}
