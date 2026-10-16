import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const claimAdmin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { count } = await supabaseAdmin
      .from("user_roles")
      .select("id", { count: "exact", head: true })
      .eq("role", "admin");
    if ((count ?? 0) > 0) return { ok: false, reason: "An administrator already exists." };
    const { error } = await supabaseAdmin
      .from("user_roles")
      .insert({ user_id: context.userId, role: "admin" });
    if (error) return { ok: false, reason: error.message };
    return { ok: true, reason: null as string | null };
  });

export const getMyRole = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await context.supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", context.userId);
    const roles = (data ?? []).map((r) => r.role as string);
    return { roles, isAdmin: roles.includes("admin") };
  });

async function assertAdmin(context: { supabase: any; userId: string }) {
  const { data } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
  if (!data) throw new Error("Forbidden");
}

export const adminStats = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const [products, orders, lowStock] = await Promise.all([
      context.supabase.from("products").select("id", { count: "exact", head: true }),
      context.supabase.from("orders").select("total, status"),
      context.supabase.from("products").select("id, title, stock, low_stock_level").lte("stock", 5).order("stock"),
    ]);
    const rows = (orders.data ?? []) as { total: number | string; status: string }[];
    const revenue = rows
      .filter((o) => o.status !== "cancelled")
      .reduce((s, o) => s + Number(o.total), 0);
    return {
      productCount: products.count ?? 0,
      orderCount: rows.length,
      revenue,
      pending: rows.filter((o) => ["placed", "confirmed", "processing", "packed"].includes(o.status)).length,
      lowStock: (lowStock.data ?? []) as { id: string; title: string; stock: number }[],
    };
  });

export const adminListProducts = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const { data, error } = await context.supabase
      .from("products")
      .select("id, slug, title, brand, category_slug, price, sale_price, stock, is_active, is_featured, images, description")
      .order("created_at", { ascending: false })
      .limit(500);
    if (error) throw new Error(error.message);
    return { products: data ?? [] };
  });

export const adminSaveProduct = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: {
    id?: string;
    slug: string;
    title: string;
    brand: string;
    category_slug: string;
    price: number;
    sale_price: number | null;
    stock: number;
    description: string;
    image: string;
    is_active: boolean;
    is_featured: boolean;
  }) => input)
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const payload = {
      slug: data.slug,
      title: data.title,
      brand: data.brand || "Generic",
      category_slug: data.category_slug,
      price: data.price,
      sale_price: data.sale_price,
      stock: data.stock,
      description: data.description,
      images: data.image ? [data.image] : [],
      is_active: data.is_active,
      is_featured: data.is_featured,
    };
    const query = data.id
      ? context.supabase.from("products").update(payload).eq("id", data.id)
      : context.supabase.from("products").insert(payload);
    const { error } = await query;
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminDeleteProduct = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string }) => input)
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { error } = await context.supabase.from("products").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminListOrders = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const { data, error } = await context.supabase
      .from("orders")
      .select("id, order_number, customer_name, customer_phone, city, total, status, created_at, order_items(title, qty, unit_price)")
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) throw new Error(error.message);
    return { orders: data ?? [] };
  });

export const adminUpdateOrderStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string; status: string }) => input)
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { error } = await context.supabase
      .from("orders")
      .update({ status: data.status as never })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
