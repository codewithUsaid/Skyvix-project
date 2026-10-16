import { createFileRoute, Link } from "@tanstack/react-router";
import { categories, products } from "@/lib/products";
import { ArrowRight } from "lucide-react";

export const Route = createFileRoute("/categories")({
  head: () => ({
    meta: [
      { title: "All Categories — Skyvix" },
      { name: "description", content: "Browse all product categories: laptops, headphones, gaming, printers, accessories and more." },
      { property: "og:url", content: "/categories" },
    ],
    links: [{ rel: "canonical", href: "/categories" }],
  }),
  component: () => (
    <div className="container-px mx-auto max-w-7xl py-10">
      <h1 className="text-3xl font-extrabold tracking-tight md:text-4xl">Shop by Category</h1>
      <p className="mt-2 text-muted-foreground">Find exactly what you need across all our collections.</p>
      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
        {categories.map((c) => {
          const count = products.filter((p) => p.category === c.slug).length;
          return (
            <Link
              key={c.slug}
              to="/products"
              search={{ cat: c.slug } as any}
              className="group rounded-3xl border border-border bg-card p-6 shadow-soft transition hover:-translate-y-1 hover:border-primary hover:shadow-hover"
            >
              <div className="grid aspect-video place-items-center rounded-2xl bg-gradient-to-br from-primary-soft to-muted text-6xl">
                {c.emoji}
              </div>
              <p className="mt-4 text-base font-bold">{c.name}</p>
              <p className="text-sm text-muted-foreground">{count || c.count} items</p>
              <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-primary transition group-hover:gap-2">
                Shop now <ArrowRight className="h-4 w-4" />
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  ),
});
