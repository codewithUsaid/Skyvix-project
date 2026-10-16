import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const placeDbOrder = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: {
    customer: { name: string; phone: string; email: string; address: string; city: string; postal: string };
    items: { product_id: string | null; title: string; image_url: string | null; unit_price: number; qty: number }[];
    subtotal: number;
    delivery_fee: number;
    discount: number;
    coupon_code: string | null;
    total: number;
    payment_method: string;
  }) => input)
  .handler(async ({ data, context }) => {
    const orderNumber = `SC-${Date.now().toString().slice(-8)}`;
    const { data: order, error } = await context.supabase
      .from("orders")
      .insert({
        order_number: orderNumber,
        user_id: context.userId,
        customer_name: data.customer.name,
        customer_phone: data.customer.phone,
        customer_email: data.customer.email,
        address_line: data.customer.address,
        city: data.customer.city,
        postal_code: data.customer.postal,
        subtotal: data.subtotal,
        delivery_fee: data.delivery_fee,
        discount: data.discount,
        coupon_code: data.coupon_code,
        total: data.total,
        payment_method: data.payment_method,
      })
      .select("id, order_number")
      .single();
    if (error || !order) throw new Error(error?.message ?? "Could not place order");

    const { error: itemsError } = await context.supabase.from("order_items").insert(
      data.items.map((i) => ({
        order_id: order.id,
        product_id: i.product_id,
        title: i.title,
        image_url: i.image_url,
        unit_price: i.unit_price,
        qty: i.qty,
      })),
    );
    if (itemsError) throw new Error(itemsError.message);
    return { id: order.id, orderNumber: order.order_number };
  });

export const listMyOrders = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("orders")
      .select("id, order_number, total, status, created_at, order_items(title, qty, unit_price, image_url)")
      .eq("user_id", context.userId)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return { orders: data ?? [] };
  });
