import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import {
  LayoutDashboard, Package, ShoppingBag, AlertTriangle, Plus, Pencil, Trash2, X, ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";
import { formatPrice } from "@/lib/products";
import {
  adminStats, adminListProducts, adminSaveProduct, adminDeleteProduct,
  adminListOrders, adminUpdateOrderStatus, getMyRole, claimAdmin,
} from "@/lib/admin.functions";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Admin Dashboard — Super Computers" },
      { name: "description", content: "Manage products, stock, orders and store performance for Super Computers." },
      { property: "og:title", content: "Admin Dashboard — Super Computers" },
      { property: "og:description", content: "Internal store management for Super Computers." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminPage,
});

const STATUSES = ["placed", "confirmed", "processing", "packed", "shipped", "out_for_delivery", "delivered", "cancelled"];

function AdminPage() {
  const roleFn = useServerFn(getMyRole);
  const claimFn = useServerFn(claimAdmin);
  const qc = useQueryClient();
  const role = useQuery({ queryKey: ["my-role"], queryFn: () => roleFn({}) });
  const [tab, setTab] = useState<"overview" | "products" | "orders">("overview");

  if (role.isLoading) return <Shell><p className="text-sm text-muted-foreground">Checking access…</p></Shell>;

  if (!role.data?.isAdmin) {
    return (
      <Shell>
        <div className="rounded-3xl border border-border bg-card p-10 text-center shadow-card">
          <ShieldCheck className="mx-auto h-10 w-10 text-primary" />
          <h1 className="mt-4 text-xl font-bold">Admin access required</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Your account isn't an administrator. If this is a brand-new store you can claim the first admin seat.
          </p>
          <button
            onClick={async () => {
              const r = await claimFn({});
              if (r.ok) {
                toast.success("You're now the store administrator");
                qc.invalidateQueries({ queryKey: ["my-role"] });
              } else toast.error(r.reason ?? "Could not claim admin access");
            }}
            className="mt-5 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
          >
            Claim admin access
          </button>
          <Link to="/" className="mt-4 block text-sm text-muted-foreground hover:text-primary">Back to store</Link>
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      <div className="mb-6 flex flex-wrap items-center gap-2">
        {([["overview", LayoutDashboard], ["products", Package], ["orders", ShoppingBag]] as const).map(([k, Icon]) => (
          <button
            key={k}
            onClick={() => setTab(k)}
            className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold capitalize transition ${
              tab === k ? "bg-primary text-primary-foreground" : "border border-border bg-card hover:border-primary hover:text-primary"
            }`}
          >
            <Icon className="h-4 w-4" /> {k}
          </button>
        ))}
      </div>
      {tab === "overview" && <Overview />}
      {tab === "products" && <Products />}
      {tab === "orders" && <Orders />}
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="container-px mx-auto max-w-7xl py-8">
      <h1 className="mb-6 text-3xl font-extrabold">Admin Dashboard</h1>
      {children}
    </div>
  );
}

function Overview() {
  const fn = useServerFn(adminStats);
  const { data, isLoading } = useQuery({ queryKey: ["admin-stats"], queryFn: () => fn({}) });
  if (isLoading || !data) return <p className="text-sm text-muted-foreground">Loading…</p>;
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Revenue" value={formatPrice(data.revenue)} />
        <Stat label="Orders" value={String(data.orderCount)} />
        <Stat label="Pending orders" value={String(data.pending)} />
        <Stat label="Products" value={String(data.productCount)} />
      </div>
      <section className="rounded-2xl border border-border bg-card p-6 shadow-soft">
        <h2 className="flex items-center gap-2 text-lg font-bold">
          <AlertTriangle className="h-5 w-5 text-amber-500" /> Low stock alerts
        </h2>
        {data.lowStock.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">Everything is well stocked.</p>
        ) : (
          <ul className="mt-3 divide-y divide-border text-sm">
            {data.lowStock.map((p) => (
              <li key={p.id} className="flex justify-between py-2">
                <span>{p.title}</span>
                <span className="font-bold text-destructive">{p.stock} left</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-1.5 text-2xl font-extrabold">{value}</p>
    </div>
  );
}

type Row = {
  id: string; slug: string; title: string; brand: string; category_slug: string;
  price: number | string; sale_price: number | string | null; stock: number;
  is_active: boolean; is_featured: boolean; images: unknown; description: string | null;
};

function Products() {
  const listFn = useServerFn(adminListProducts);
  const saveFn = useServerFn(adminSaveProduct);
  const delFn = useServerFn(adminDeleteProduct);
  const qc = useQueryClient();
  const [editing, setEditing] = useState<Row | "new" | null>(null);
  const { data, isLoading } = useQuery({ queryKey: ["admin-products"], queryFn: () => listFn({}) });

  const refresh = () => {
    qc.invalidateQueries({ queryKey: ["admin-products"] });
    qc.invalidateQueries({ queryKey: ["db-products"] });
    qc.invalidateQueries({ queryKey: ["admin-stats"] });
  };

  const save = useMutation({
    mutationFn: (input: Parameters<typeof adminSaveProduct>[0]["data"]) => saveFn({ data: input }),
    onSuccess: () => { toast.success("Product saved"); setEditing(null); refresh(); },
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: (id: string) => delFn({ data: { id } }),
    onSuccess: () => { toast.success("Product deleted"); refresh(); },
    onError: (e: Error) => toast.error(e.message),
  });

  const rows = (data?.products ?? []) as Row[];

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <button onClick={() => setEditing("new")} className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90">
          <Plus className="h-4 w-4" /> Add product
        </button>
      </div>
      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-border bg-card shadow-soft">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="p-3">Product</th><th className="p-3">Category</th><th className="p-3">Price</th>
                <th className="p-3">Stock</th><th className="p-3">Active</th><th className="p-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.map((p) => (
                <tr key={p.id}>
                  <td className="p-3 font-medium">{p.title}<span className="block text-xs text-muted-foreground">{p.brand}</span></td>
                  <td className="p-3 text-muted-foreground">{p.category_slug}</td>
                  <td className="p-3 font-semibold">{formatPrice(Number(p.sale_price ?? p.price))}</td>
                  <td className={`p-3 font-semibold ${p.stock <= 5 ? "text-destructive" : ""}`}>{p.stock}</td>
                  <td className="p-3">{p.is_active ? "Yes" : "No"}</td>
                  <td className="p-3">
                    <div className="flex justify-end gap-1">
                      <button onClick={() => setEditing(p)} className="grid h-8 w-8 place-items-center rounded-full hover:bg-muted" aria-label="Edit"><Pencil className="h-4 w-4" /></button>
                      <button
                        onClick={() => { if (confirm(`Delete "${p.title}"?`)) remove.mutate(p.id); }}
                        className="grid h-8 w-8 place-items-center rounded-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                        aria-label="Delete"
                      ><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editing && (
        <ProductDialog
          row={editing === "new" ? null : editing}
          onClose={() => setEditing(null)}
          onSave={(v) => save.mutate(v)}
          busy={save.isPending}
        />
      )}
    </div>
  );
}

function ProductDialog({
  row, onClose, onSave, busy,
}: {
  row: Row | null;
  onClose: () => void;
  onSave: (v: Parameters<typeof adminSaveProduct>[0]["data"]) => void;
  busy: boolean;
}) {
  const images = Array.isArray(row?.images) ? (row.images as string[]) : [];
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4" role="dialog" aria-modal="true">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const fd = new FormData(e.currentTarget);
          const num = (k: string) => Number(fd.get(k) ?? 0);
          const sale = String(fd.get("sale_price") ?? "").trim();
          onSave({
            ...(row ? { id: row.id } : {}),
            slug: String(fd.get("slug") ?? "").trim(),
            title: String(fd.get("title") ?? "").trim(),
            brand: String(fd.get("brand") ?? "").trim(),
            category_slug: String(fd.get("category_slug") ?? "").trim(),
            price: num("price"),
            sale_price: sale ? Number(sale) : null,
            stock: num("stock"),
            description: String(fd.get("description") ?? ""),
            image: String(fd.get("image") ?? "").trim(),
            is_active: fd.get("is_active") === "on",
            is_featured: fd.get("is_featured") === "on",
          });
        }}
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-card p-6 shadow-elevated"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold">{row ? "Edit product" : "Add product"}</h2>
          <button type="button" onClick={onClose} className="grid h-8 w-8 place-items-center rounded-full hover:bg-muted" aria-label="Close"><X className="h-4 w-4" /></button>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <F label="Title" name="title" defaultValue={row?.title ?? ""} className="sm:col-span-2" required />
          <F label="Slug" name="slug" defaultValue={row?.slug ?? ""} required />
          <F label="Brand" name="brand" defaultValue={row?.brand ?? ""} />
          <F label="Category slug" name="category_slug" defaultValue={row?.category_slug ?? "accessories"} required />
          <F label="Stock" name="stock" type="number" defaultValue={String(row?.stock ?? 0)} />
          <F label="Price (Rs.)" name="price" type="number" defaultValue={String(row?.price ?? "")} required />
          <F label="Sale price (optional)" name="sale_price" type="number" defaultValue={row?.sale_price != null ? String(row.sale_price) : ""} />
          <F label="Image URL" name="image" defaultValue={images[0] ?? ""} className="sm:col-span-2" />
          <label className="sm:col-span-2 block">
            <span className="mb-1.5 block text-xs font-semibold text-muted-foreground">Description</span>
            <textarea name="description" rows={3} defaultValue={row?.description ?? ""} className="w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm outline-none focus:border-primary" />
          </label>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="is_active" defaultChecked={row ? row.is_active : true} className="h-4 w-4 accent-primary" /> Active</label>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="is_featured" defaultChecked={row?.is_featured ?? false} className="h-4 w-4 accent-primary" /> Featured</label>
        </div>
        <button disabled={busy} type="submit" className="mt-5 w-full rounded-full bg-primary py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60">
          {busy ? "Saving…" : "Save product"}
        </button>
      </form>
    </div>
  );
}

function F({ label, className = "", ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1.5 block text-xs font-semibold text-muted-foreground">{label}</span>
      <input {...props} className="w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm outline-none focus:border-primary" />
    </label>
  );
}

function Orders() {
  const listFn = useServerFn(adminListOrders);
  const statusFn = useServerFn(adminUpdateOrderStatus);
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["admin-orders"], queryFn: () => listFn({}) });

  const update = useMutation({
    mutationFn: (v: { id: string; status: string }) => statusFn({ data: v }),
    onSuccess: () => { toast.success("Order updated"); qc.invalidateQueries({ queryKey: ["admin-orders"] }); },
    onError: (e: Error) => toast.error(e.message),
  });

  if (isLoading) return <p className="text-sm text-muted-foreground">Loading…</p>;
  const orders = (data?.orders ?? []) as {
    id: string; order_number: string; customer_name: string; customer_phone: string;
    city: string; total: number | string; status: string; created_at: string;
    order_items: { title: string; qty: number; unit_price: number | string }[];
  }[];

  if (orders.length === 0) return <p className="text-sm text-muted-foreground">No orders yet.</p>;

  return (
    <div className="space-y-3">
      {orders.map((o) => (
        <div key={o.id} className="rounded-2xl border border-border bg-card p-5 shadow-soft">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-bold">#{o.order_number}</p>
              <p className="text-xs text-muted-foreground">
                {new Date(o.created_at).toLocaleString()} · {o.customer_name} · {o.customer_phone} · {o.city}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-lg font-extrabold text-primary">{formatPrice(Number(o.total))}</span>
              <select
                value={o.status}
                onChange={(e) => update.mutate({ id: o.id, status: e.target.value })}
                className="rounded-full border border-border bg-surface px-3 py-1.5 text-xs font-semibold capitalize outline-none focus:border-primary"
              >
                {STATUSES.map((s) => <option key={s} value={s}>{s.replace(/_/g, " ")}</option>)}
              </select>
            </div>
          </div>
          <ul className="mt-3 space-y-1 border-t border-border pt-3 text-sm text-muted-foreground">
            {o.order_items.map((i, idx) => (
              <li key={idx}>{i.qty} × {i.title} — {formatPrice(Number(i.unit_price))}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
