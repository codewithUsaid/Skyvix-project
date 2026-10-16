import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ChevronRight } from "lucide-react";
import { ProductCard } from "@/components/ProductCard";
import { products, categories } from "@/lib/products";

type Search = { q?: string; cat?: string; sort?: string; page?: number };

export const Route = createFileRoute("/products")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    q: typeof s.q === "string" ? s.q : undefined,
    cat: typeof s.cat === "string" ? s.cat : undefined,
    sort: typeof s.sort === "string" ? s.sort : undefined,
    page: typeof s.page === "number" ? s.page : Number(s.page) || 1,
  }),
  head: () => ({
    meta: [
      { title: "All Products — Skyvix" },
      { name: "description", content: "Browse our full catalog of laptops, headphones, printers, gaming gear and more." },
      { property: "og:url", content: "/products" },
    ],
    links: [{ rel: "canonical", href: "/products" }],
  }),
  component: ProductsPage,
});

const PAGE_SIZE = 12;

function ProductsPage() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const [price, setPrice] = useState<[number, number]>([0, 500000]);

  const filtered = useMemo(() => {
    let list = [...products];
    if (search.cat) {
      const slug = categories.find((c) => c.name === search.cat || c.slug === search.cat)?.slug ?? search.cat;
      list = list.filter((p) => p.category === slug);
    }
    if (search.q) {
      const q = search.q.toLowerCase();
      list = list.filter((p) => p.title.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q));
    }
    list = list.filter((p) => p.price >= price[0] && p.price <= price[1]);
    switch (search.sort) {
      case "price-asc": list.sort((a, b) => a.price - b.price); break;
      case "price-desc": list.sort((a, b) => b.price - a.price); break;
      case "rating": list.sort((a, b) => b.rating - a.rating); break;
      case "popular": list.sort((a, b) => b.sold - a.sold); break;
    }
    return list;
  }, [search.cat, search.q, search.sort, price]);

  const page = search.page ?? 1;
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="container-px mx-auto max-w-7xl py-8">
      {/* Breadcrumb */}
      <nav className="mb-4 flex items-center gap-1.5 text-xs text-muted-foreground">
        <Link to="/" className="hover:text-primary">Home</Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-foreground">Products</span>
        {search.cat && (
          <>
            <ChevronRight className="h-3 w-3" />
            <span className="text-foreground capitalize">{search.cat.replace("-", " ")}</span>
          </>
        )}
      </nav>

      <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
        {/* Sidebar */}
        <aside className="space-y-5 lg:sticky lg:top-40 lg:self-start">
          <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
            <h3 className="mb-3 text-sm font-bold">Categories</h3>
            <ul className="space-y-1.5 text-sm">
              <li>
                <button
                  onClick={() => navigate({ search: (p: any) => ({ ...p, cat: undefined, page: 1 }) })}
                  className={`w-full rounded-lg px-2 py-1.5 text-left transition hover:bg-muted ${
                    !search.cat ? "bg-primary-soft font-semibold text-primary" : ""
                  }`}
                >
                  All
                </button>
              </li>
              {categories.map((c) => {
                const active = search.cat === c.slug || search.cat === c.name;
                return (
                  <li key={c.slug}>
                    <button
                      onClick={() => navigate({ search: (p: any) => ({ ...p, cat: c.slug, page: 1 }) })}
                      className={`w-full rounded-lg px-2 py-1.5 text-left transition hover:bg-muted ${
                        active ? "bg-primary-soft font-semibold text-primary" : ""
                      }`}
                    >
                      {c.name}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
            <h3 className="mb-3 text-sm font-bold">Price Range</h3>
            <input
              type="range"
              min={0}
              max={500000}
              step={5000}
              value={price[1]}
              onChange={(e) => setPrice([0, Number(e.target.value)])}
              className="w-full accent-primary"
            />
            <div className="mt-2 flex justify-between text-xs text-muted-foreground">
              <span>Rs. 0</span>
              <span>Up to Rs. {price[1].toLocaleString()}</span>
            </div>
          </div>
        </aside>

        {/* Results */}
        <div>
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">{filtered.length}</span> products found
              {search.q && <> for "<span className="font-semibold text-foreground">{search.q}</span>"</>}
            </p>
            <div className="flex items-center gap-2 text-sm">
              <label className="text-muted-foreground">Sort by</label>
              <select
                value={search.sort ?? ""}
                onChange={(e) => navigate({ search: (p: any) => ({ ...p, sort: e.target.value || undefined, page: 1 }) })}
                className="rounded-full border border-border bg-card px-3 py-1.5 text-sm outline-none focus:border-primary"
              >
                <option value="">Featured</option>
                <option value="popular">Most popular</option>
                <option value="rating">Top rated</option>
                <option value="price-asc">Price: low to high</option>
                <option value="price-desc">Price: high to low</option>
              </select>
            </div>
          </div>

          {paged.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border p-12 text-center">
              <p className="text-lg font-semibold">No products found</p>
              <p className="mt-1 text-sm text-muted-foreground">Try adjusting your filters or search query.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-4">
              {paged.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          )}

          {pageCount > 1 && (
            <div className="mt-10 flex items-center justify-center gap-2">
              {Array.from({ length: pageCount }).map((_, i) => {
                const n = i + 1;
                const active = n === page;
                return (
                  <button
                    key={n}
                    onClick={() => navigate({ search: (p: any) => ({ ...p, page: n }) })}
                    className={`h-9 min-w-9 rounded-full px-3 text-sm font-semibold transition ${
                      active ? "bg-primary text-primary-foreground" : "border border-border hover:border-primary hover:text-primary"
                    }`}
                  >
                    {n}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
