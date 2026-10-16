import { createClient } from "@supabase/supabase-js";

/** Publishable-key Supabase client for public, read-only server-side queries. */
export function publicClient() {
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
  const url = process.env["SUPABASE_URL"]!;
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input: RequestInfo | URL, init?: RequestInit) => {
        const h = new Headers(init?.headers);
        if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) h.delete("Authorization");
        h.set("apikey", key);
        return fetch(input, { ...init, headers: h });
      },
    },
  });
}

export const PRODUCT_COLUMNS =
  "id, slug, title, brand, category_slug, short_description, description, price, sale_price, stock, images, badges, rating, review_count, sold_count, condition, is_featured, specs, features";
