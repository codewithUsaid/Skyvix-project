import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Package, Heart, MapPin, User, LayoutDashboard, LogOut } from "lucide-react";
import { ProductImage } from "@/components/ProductImage";
import { products, formatPrice } from "@/lib/products";
import { listOrders, type Order } from "@/lib/orders";
import { wishlist, useWishlist } from "@/lib/wishlist-store";
import { cart } from "@/lib/cart-store";
import { toast } from "sonner";

function useOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  useEffect(() => setOrders(listOrders()), []);
  return orders;
}

const demoOrders: Order[] = [
  { id: "SC-10245", date: "2026-06-18T10:00:00.000Z", status: "Delivered", items: [{ product: products[4], qty: 1 }], subtotal: 89000, shipping: 0, discount: 0, total: 89000, payment: "Cash on Delivery", customer: { name: "Ali Khan", phone: "+92 300 1234567", email: "ali@example.com", address: "House 24, Street 5, DHA Phase 5", city: "Lahore", postal: "54000" } },
  { id: "SC-10231", date: "2026-06-10T10:00:00.000Z", status: "Shipped", items: [{ product: products[2], qty: 1 }], subtotal: 32000, shipping: 0, discount: 0, total: 32000, payment: "Bank Transfer", customer: { name: "Ali Khan", phone: "+92 300 1234567", email: "ali@example.com", address: "House 24, Street 5, DHA Phase 5", city: "Lahore", postal: "54000" } },
];

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });


export const Route = createFileRoute("/account")({
  head: () => ({ meta: [{ title: "My Account — Skyvix" }, { name: "robots", content: "noindex" }] }),
  component: Account,
});

const tabs = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "orders", label: "Orders", icon: Package },
  { id: "wishlist", label: "Wishlist", icon: Heart },
  { id: "addresses", label: "Addresses", icon: MapPin },
  { id: "profile", label: "Profile", icon: User },
] as const;

function Account() {
  const [tab, setTab] = useState<(typeof tabs)[number]["id"]>("dashboard");

  return (
    <div className="container-px mx-auto max-w-7xl py-8">
      <h1 className="mb-6 text-3xl font-extrabold">My Account</h1>
      <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
        <aside className="h-fit rounded-2xl border border-border bg-card p-3 shadow-soft lg:sticky lg:top-40">
          <div className="mb-3 flex items-center gap-3 rounded-xl bg-primary-soft p-3">
            <span className="grid h-11 w-11 place-items-center rounded-full bg-primary text-primary-foreground font-bold">AK</span>
            <div className="min-w-0 text-sm">
              <p className="truncate font-bold">Ali Khan</p>
              <p className="truncate text-xs text-muted-foreground">ali@example.com</p>
            </div>
          </div>
          <nav className="flex flex-col">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition ${
                  tab === t.id ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-muted"
                }`}
              >
                <t.icon className="h-4 w-4" /> {t.label}
              </button>
            ))}
            <button className="mt-1 flex items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-destructive hover:bg-destructive/10">
              <LogOut className="h-4 w-4" /> Sign out
            </button>
          </nav>
        </aside>

        <div className="space-y-4">
          {tab === "dashboard" && <Dashboard />}
          {tab === "orders" && <Orders />}
          {tab === "wishlist" && <Wishlist />}
          {tab === "addresses" && <Addresses />}
          {tab === "profile" && <Profile />}
        </div>
      </div>
    </div>
  );
}

function Dashboard() {
  const orders = useOrders();
  const all = [...orders, ...demoOrders];
  const { count: wishCount } = useWishlist();
  const spent = all.reduce((s, o) => s + o.total, 0);
  const pending = all.filter((o) => o.status !== "Delivered").length;

  const stats = [
    { label: "Total orders", value: String(all.length) },
    { label: "Total spent", value: formatPrice(spent) },
    { label: "Pending", value: String(pending) },
    { label: "Wishlist", value: String(wishCount) },
  ];

  return (
    <>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl border border-border bg-card p-5 shadow-soft">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{s.label}</p>
            <p className="mt-1 text-2xl font-extrabold">{s.value}</p>
          </div>
        ))}
      </div>
      <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
        <h2 className="mb-3 text-lg font-bold">Welcome back, Ali 👋</h2>
        <p className="text-sm text-muted-foreground">Manage your orders, edit your profile, and check your wishlist anytime.</p>
      </div>
    </>
  );
}

function Orders() {
  const orders = useOrders();
  const all = [...orders, ...demoOrders];
  const statusColor = (s: string) =>
    s === "Delivered" ? "bg-success/15 text-success" : s === "Shipped" ? "bg-primary/15 text-primary" : "bg-warning/15 text-warning";

  if (all.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-card p-10 text-center shadow-soft">
        <p className="font-bold">No orders yet</p>
        <Link to="/products" className="mt-3 inline-block rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground">Start shopping</Link>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {all.map((o) => {
        const first = o.items[0];
        const extra = o.items.reduce((s, i) => s + i.qty, 0) - (first?.qty ?? 0);
        return (
          <Link
            key={o.id}
            to="/order-confirmation/$id"
            params={{ id: o.id }}
            className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4 shadow-soft transition hover:border-primary"
          >
            {first && (
              <ProductImage gradient={first.product.gradient} emoji={first.product.emoji} image={first.product.image} className="h-16 w-16 shrink-0 rounded-xl" />
            )}
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-bold">#{o.id}</p>
                <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${statusColor(o.status)}`}>{o.status}</span>
              </div>
              <p className="line-clamp-1 text-sm text-muted-foreground">
                {first?.product.title}
                {extra > 0 ? ` + ${extra} more item${extra > 1 ? "s" : ""}` : ""}
              </p>
              <p className="text-xs text-muted-foreground">Placed on {fmtDate(o.date)}</p>
            </div>
            <p className="text-base font-extrabold">{formatPrice(o.total)}</p>
          </Link>
        );
      })}
    </div>
  );
}

function Wishlist() {
  const { items } = useWishlist();

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-card p-10 text-center shadow-soft">
        <Heart className="mx-auto h-8 w-8 text-muted-foreground" />
        <p className="mt-3 font-bold">Your wishlist is empty</p>
        <p className="mt-1 text-sm text-muted-foreground">Tap the heart on any product to save it here.</p>
        <Link to="/products" className="mt-4 inline-block rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground">Browse products</Link>
      </div>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {items.map((p) => (
        <div key={p.id} className="rounded-2xl border border-border bg-card p-3 shadow-soft">
          <Link to="/products/$slug" params={{ slug: p.slug }} className="flex items-center gap-3">
            <ProductImage gradient={p.gradient} emoji={p.emoji} image={p.image} className="h-16 w-16 shrink-0 rounded-xl" />
            <div className="min-w-0 flex-1">
              <p className="line-clamp-2 text-sm font-semibold">{p.title}</p>
              <p className="text-sm font-bold text-primary">{formatPrice(p.price)}</p>
            </div>
          </Link>
          <div className="mt-3 flex gap-2">
            <button
              onClick={() => {
                cart.add(p);
                wishlist.remove(p.id);
                toast.success("Moved to cart", { description: p.title });
              }}
              className="flex-1 rounded-full bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90"
            >
              Move to cart
            </button>
            <button
              onClick={() => {
                wishlist.remove(p.id);
                toast("Removed from wishlist", { description: p.title });
              }}
              className="rounded-full border border-border px-3 py-2 text-xs font-semibold text-muted-foreground hover:border-destructive hover:text-destructive"
            >
              Remove
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

function Addresses() {
  return (
    <div className="grid gap-3 md:grid-cols-2">
      <div className="rounded-2xl border-2 border-primary bg-card p-5 shadow-soft">
        <p className="text-xs font-semibold uppercase tracking-wider text-primary">Default</p>
        <p className="mt-1 font-bold">Home</p>
        <p className="mt-1 text-sm text-muted-foreground">House 24, Street 5, DHA Phase 5<br />Lahore, 54000<br />+92 300 1234567</p>
      </div>
      <button className="grid place-items-center rounded-2xl border-2 border-dashed border-border p-5 text-sm font-semibold text-muted-foreground hover:border-primary hover:text-primary">
        + Add new address
      </button>
    </div>
  );
}

function Profile() {
  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
      <h2 className="mb-5 text-lg font-bold">Profile Settings</h2>
      <div className="grid gap-4 md:grid-cols-2">
        {["Full name", "Email", "Phone", "Date of birth"].map((l) => (
          <label key={l} className="block">
            <span className="mb-1.5 block text-xs font-semibold text-muted-foreground">{l}</span>
            <input className="w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm outline-none focus:border-primary" placeholder={l} />
          </label>
        ))}
      </div>
      <button className="mt-5 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90">Save changes</button>
    </div>
  );
}
