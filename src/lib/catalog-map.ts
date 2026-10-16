import type { Product } from "./products";

export type DbProductRow = {
  id: string;
  slug: string;
  title: string;
  brand: string;
  category_slug: string;
  short_description: string | null;
  description: string | null;
  price: number | string;
  sale_price: number | string | null;
  stock: number;
  images: unknown;
  badges: unknown;
  rating: number | string;
  review_count: number;
  sold_count: number;
  condition: string;
  is_featured?: boolean;
  is_active?: boolean;
  specs?: unknown;
  features?: unknown;
};

const grads = [
  "from-blue-500/20 via-blue-600/10 to-indigo-700/30",
  "from-zinc-900 via-zinc-800 to-zinc-950",
  "from-purple-500/20 via-fuchsia-500/10 to-blue-600/30",
  "from-orange-400/20 via-amber-500/10 to-rose-500/30",
  "from-emerald-400/20 via-teal-500/10 to-cyan-600/30",
  "from-slate-800 via-slate-900 to-black",
];

function hash(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

const emojiByCategory: Record<string, string> = {
  laptops: "\u{1F4BB}",
  printers: "\u{1F5A8}\uFE0F",
  batteries: "\u{1F50B}",
  cables: "\u{1F50C}",
  chargers: "\u26A1",
  headphones: "\u{1F3A7}",
  speakers: "\u{1F50A}",
  networking: "\u{1F4E1}",
  storage: "\u{1F4BE}",
  accessories: "\u{1F5B1}\uFE0F",
};

function toArray(v: unknown): string[] {
  if (Array.isArray(v)) return v.filter((x): x is string => typeof x === "string");
  return [];
}

export function mapDbProduct(row: DbProductRow): Product {
  const price = Number(row.sale_price ?? row.price);
  const original = Number(row.price);
  const images = toArray(row.images);
  const badges = toArray(row.badges);
  const cond = row.condition === "used" ? "Used - Good" : row.condition === "refurbished" ? "Used - Like New" : "New";
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    brand: row.brand,
    category: row.category_slug,
    price,
    originalPrice: original > price ? original : Math.round(price * 1.15),
    rating: Number(row.rating) || 4.5,
    reviews: row.review_count ?? 0,
    sold: row.sold_count ?? 0,
    ...(badges[0] ? { badge: badges[0] } : {}),
    gradient: grads[hash(row.slug) % grads.length]!,
    emoji: emojiByCategory[row.category_slug] ?? "\u{1F4E6}",
    ...(images[0] ? { image: images[0] } : {}),
    description: row.description ?? row.short_description ?? "",
    stock: row.stock,
    condition: cond as Product["condition"],
  };
}

/** Merge database products (authoritative) with the built-in demo catalog. */
export function mergeCatalog(dbProducts: Product[], staticProducts: Product[]): Product[] {
  const seen = new Set(dbProducts.map((p) => p.slug));
  return [...dbProducts, ...staticProducts.filter((p) => !seen.has(p.slug))];
}
