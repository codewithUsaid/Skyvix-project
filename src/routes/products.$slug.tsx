import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import {
  ChevronRight, ChevronDown, Star, Truck, RotateCcw, ShieldCheck, BadgeCheck,
  Minus, Plus, MapPin, Share2, Heart, MessageCircle, Store, PackageCheck,
} from "lucide-react";
import { getProduct, relatedProducts, formatPrice } from "@/lib/products";
import { ProductImage } from "@/components/ProductImage";
import { ProductCard } from "@/components/ProductCard";
import { cart } from "@/lib/cart-store";
import { wishlist, useWishlist } from "@/lib/wishlist-store";
import { OriginButton } from "@/components/ui/origin-button";
import { toast } from "sonner";

export const Route = createFileRoute("/products/$slug")({
  loader: ({ params }) => {
    const product = getProduct(params.slug);
    if (!product) throw notFound();
    return { product };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
        { title: `${loaderData.product.title} — Skyvix` },
        { name: "description", content: loaderData.product.description },
        { property: "og:title", content: loaderData.product.title },
        { property: "og:description", content: loaderData.product.description },
        { property: "og:type", content: "product" },
      ]
      : [],
  }),
  notFoundComponent: () => (
    <div className="container-px mx-auto max-w-7xl py-20 text-center">
      <h1 className="text-2xl font-bold">Product not found</h1>
      <Link to="/products" className="mt-4 inline-block text-primary">Back to products</Link>
    </div>
  ),
  errorComponent: ({ error }) => <div className="p-10 text-center">{error instanceof Error ? error.message : "Something went wrong"}</div>,
  component: ProductPage,
});

function ProductPage() {
  const { product } = Route.useLoaderData();
  const [qty, setQty] = useState(1);
  const [active, setActive] = useState(0);
  const [showAllSpecs, setShowAllSpecs] = useState(false);
  const { has } = useWishlist();
  const wish = has(product.id);
  const related = relatedProducts(product.category, product.id);
  const discount = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);

  const deliveryDate = new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toLocaleDateString("en-PK", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  const addToCart = () => {
    cart.add(product, qty);
    toast.success("Added to cart", { description: `${qty} × ${product.title}` });
  };

  const specs = [
    { label: "Brand", value: product.brand },
    { label: "Condition", value: product.condition ?? "New" },
    { label: "Category", value: product.category.replace("-", " ") },
    { label: "Stock", value: `${product.stock} available` },
    { label: "Warranty", value: "7-Day Checking Warranty" },
    { label: "Delivery", value: "Bahria Town Karachi only" },
  ];

  // fake rating breakdown, weighted from product.rating
  const total = product.reviews;
  const dist = [
    { s: 5, n: Math.round(total * 0.72) },
    { s: 4, n: Math.round(total * 0.15) },
    { s: 3, n: Math.round(total * 0.07) },
    { s: 2, n: Math.round(total * 0.03) },
    { s: 1, n: Math.round(total * 0.03) },
  ];
  const maxN = Math.max(...dist.map((d) => d.n));

  const reviews = [
    {
      name: "Ahmed K.",
      date: "26 Aug 2026",
      stars: 5,
      text: "Bohat acha product mila, delivery bhi time pe hui. Packaging perfect thi. Recommend karta hun sab ko!",
    },
    {
      name: "Fatima R.",
      date: "12 Jul 2026",
      stars: 4,
      text: "Quality: 8/10 | Value for money: 9/10. Overall satisfied with the purchase from Skyvix",
    },
    {
      name: "Bilal S.",
      date: "03 Jun 2026",
      stars: 5,
      text: "Genuine seller, product as described. Cash on delivery Bahria Town mein bhi mili.",
    },
  ];

  function AmazonPrice({ value, className = "" }: { value: number; className?: string }) {
    const [whole, fraction] = value.toFixed(2).split(".");
    const formattedWhole = Number(whole).toLocaleString("en-PK");
    return (
      <span className={className}>
        <span className="text-sm align-top">Rs.</span>
        <span className="font-semibold">{formattedWhole}</span>
        <span className="text-sm align-top">.{fraction}</span>
      </span>
    );
  }

  function Row({ label, value, link = false }: { label: string; value: string; link?: boolean }) {
    return (
      <div className="flex justify-between text-xs">
        <dt className="text-muted-foreground">{label}</dt>
        <dd className={link ? "text-primary hover:underline" : "text-foreground/80"}>{value}</dd>
      </div>
    );
  }

  return (
    <div className="bg-surface">
      <div className="container-px mx-auto max-w-7xl py-6">
        {/* Breadcrumb */}
        <nav className="mb-4 flex items-center gap-1.5 text-xs text-muted-foreground">
          <Link to="/" className="hover:text-primary">Home</Link>
          <ChevronRight className="h-3 w-3" />
          <Link to="/products" className="hover:text-primary">Products</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-foreground capitalize">{product.category.replace("-", " ")}</span>
        </nav>

        <div className="grid gap-6 rounded-lg border border-border bg-card p-5 lg:grid-cols-[minmax(0,420px)_minmax(0,1fr)_300px]">
          {/* ===== GALLERY: vertical thumbs + big image ===== */}
          <div className="flex gap-4">
            <div className="flex w-11 shrink-0 flex-col gap-2">
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <button
                  key={i}
                  onMouseEnter={() => setActive(i)}
                  onClick={() => setActive(i)}
                  className={`h-11 w-11 overflow-hidden rounded-md border transition ${active === i ? "border-primary ring-1 ring-primary" : "border-border hover:border-primary/50"
                    }`}
                  aria-label={`View image ${i + 1}`}
                >
                  <ProductImage image={product.image} gradient={product.gradient} emoji={product.emoji} className="h-full w-full" />
                </button>
              ))}
            </div>
            <div className="relative min-w-0 flex-1">
              <button
                className="absolute right-0 top-0 z-10 grid h-8 w-8 place-items-center rounded-full text-muted-foreground transition hover:bg-muted hover:text-primary"
                aria-label="Share"
              >
                <Share2 className="h-4 w-4" />
              </button>
              <div className="aspect-square overflow-hidden rounded-md bg-white">
                <ProductImage image={product.image} gradient={product.gradient} emoji={product.emoji} className="h-full w-full" />
              </div>
              <p className="mt-2 text-center text-xs text-primary">Click to see full view</p>
            </div>
          </div>

          {/* ===== CENTER: title, rating, price, specs ===== */}
          <div className="min-w-0 lg:border-x lg:border-border lg:px-6">
            <h1 className="text-xl font-normal leading-snug text-foreground md:text-2xl">{product.title}</h1>

            <Link to="/products" className="mt-1 inline-block text-sm text-primary hover:underline">
              Visit the {product.brand} Store
            </Link>

            <div className="mt-1 flex items-center gap-2 text-sm">
              <span className="font-medium">{product.rating}</span>
              <span className="flex">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} className={`h-4 w-4 ${i <= Math.round(product.rating) ? "fill-warning text-warning" : "text-muted-foreground/40"}`} />
                ))}
              </span>
              <span className="text-primary">({product.reviews})</span>
              <button
                onClick={() => {
                  const added = wishlist.toggle(product.id);
                  toast.success(added ? "Saved to wishlist" : "Removed from wishlist", { description: product.title });
                }}
                className={`ml-auto grid h-8 w-8 place-items-center rounded-full hover:bg-muted ${wish ? "text-destructive" : "text-muted-foreground hover:text-destructive"}`}
                aria-label="Wishlist"
              >
                <Heart className={`h-4 w-4 ${wish ? "fill-current" : ""}`} />
              </button>
            </div>

            <div className="mt-3 border-t border-border pt-3">
              <AmazonPrice value={product.price} className="text-2xl" />
              {discount > 0 && (
                <span className="ml-3 align-middle text-sm text-muted-foreground">
                  <span className="line-through">{formatPrice(product.originalPrice)}</span>
                  <span className="ml-2 font-semibold text-destructive">-{discount}%</span>
                </span>
              )}
              <p className="mt-1 text-sm text-primary">
                Free delivery on orders over Rs. 5,000 <span className="text-muted-foreground">· Import duty included</span>
              </p>
            </div>

            {/* spec table */}
            <dl className="mt-4 space-y-2 text-sm">
              {(showAllSpecs ? specs : specs.slice(0, 4)).map((s) => (
                <div key={s.label} className="grid grid-cols-[150px_1fr] gap-3">
                  <dt className="font-semibold text-foreground">{s.label}</dt>
                  <dd className="capitalize text-foreground/80">{s.value}</dd>
                </div>
              ))}
            </dl>
            {specs.length > 4 && (
              <button
                onClick={() => setShowAllSpecs((s) => !s)}
                className="mt-2 inline-flex items-center gap-1 text-sm text-primary hover:underline"
              >
                <ChevronDown className={`h-4 w-4 transition-transform ${showAllSpecs ? "rotate-180" : ""}`} />
                {showAllSpecs ? "See less" : "See more"}
              </button>
            )}

            <div className="mt-5 border-t border-border pt-4">
              <h2 className="mb-2 text-base font-bold">About this item</h2>
              <ul className="list-disc space-y-1.5 pl-5 text-sm text-foreground/85">
                <li>{product.description}</li>
                <li>Genuine imported unit — thoroughly tested before dispatch.</li>
                <li>Backed by Skyvix 7-day checking warranty.</li>
                <li>Cash on Delivery available in Bahria Town Karachi.</li>
              </ul>
            </div>
          </div>

          {/* ===== BUY BOX ===== */}
          <aside className="h-fit rounded-lg border border-border bg-card p-4 lg:sticky lg:top-32">
            <AmazonPrice value={product.price} className="text-2xl" />
            <p className="mt-1 text-sm text-primary">Shipping &amp; import charges included</p>
            <p className="mt-2 text-sm">
              <span className="text-foreground/80">Delivery </span>
              <span className="font-bold">{deliveryDate}</span>
            </p>
            <p className="mt-2 inline-flex items-center gap-1 text-sm text-primary">
              <MapPin className="h-3.5 w-3.5" /> Deliver to Bahria Town Karachi
            </p>

            <p className={`mt-3 text-lg font-medium ${product.stock > 0 ? "text-success" : "text-destructive"}`}>
              {product.stock > 0 ? "In Stock" : "Out of Stock"}
            </p>

            <label className="mt-3 block">
              <select
                value={qty}
                onChange={(e) => setQty(Number(e.target.value))}
                className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-primary"
                aria-label="Quantity"
              >
                {Array.from({ length: Math.min(10, Math.max(1, product.stock)) }, (_, i) => i + 1).map((n) => (
                  <option key={n} value={n}>Quantity: {n}</option>
                ))}
              </select>
            </label>

            <OriginButton
              onClick={addToCart}
              className="mt-3 h-10 w-full rounded-full bg-warning text-sm font-semibold text-black"
            >
              Add to cart
            </OriginButton>
            <Link
              to="/checkout"
              onClick={addToCart}
              className="mt-2 grid h-10 w-full place-items-center rounded-full bg-orange-500 text-sm font-semibold text-white transition hover:bg-orange-600"
            >
              Buy Now
            </Link>

            <dl className="mt-4 space-y-1.5 border-t border-border pt-3 text-xs">
              <Row label="Ships from" value="Skyvix, Karachi" />
              <Row label="Sold by" value="Skyvix" link />
              <Row label="Returns" value="7-day refund / replacement" link />
              <Row label="Payment" value="Secure transaction · COD" />
            </dl>

            <ul className="mt-3 space-y-2 border-t border-border pt-3 text-xs text-foreground/80">
              <li className="flex items-center gap-2"><Truck className="h-3.5 w-3.5 text-primary" /> Delivery in Bahria Town Karachi only</li>
              <li className="flex items-center gap-2"><PackageCheck className="h-3.5 w-3.5 text-primary" /> Pickup — Quaid Commercial, Precinct 02</li>
              <li className="flex items-center gap-2"><RotateCcw className="h-3.5 w-3.5 text-primary" /> 7 days easy return</li>
              <li className="flex items-center gap-2"><ShieldCheck className="h-3.5 w-3.5 text-primary" /> Checking warranty included</li>
              <li className="flex items-center gap-2"><Store className="h-3.5 w-3.5 text-primary" /> Verified seller · 4.9 ★</li>
              <li className="flex items-center gap-2"><MessageCircle className="h-3.5 w-3.5 text-primary" /> Chat support on WhatsApp</li>
            </ul>
          </aside>
        </div>

        {/* ===== DESCRIPTION ===== */}
        <section className="mt-6 grid gap-4 lg:grid-cols-[1fr_320px]">
          <div className="rounded-lg border border-border bg-card p-6">
            <h2 className="mb-4 text-base font-bold">Product Description</h2>
            <p className="text-sm leading-relaxed text-foreground/85">{product.description}</p>
            <ul className="mt-4 list-disc space-y-1.5 pl-5 text-sm text-foreground/85">
              <li>Genuine imported unit — thoroughly tested before dispatch</li>
              <li>Backed by Skyvix 7-day checking warranty</li>
              <li>Delivery within Bahria Town Karachi only</li>
              <li>Cash on Delivery available in Bahria Town Karachi</li>
              <li>Original accessories and packaging where applicable</li>
            </ul>

            <h3 className="mt-6 mb-3 text-base font-bold">Specifications</h3>
            <div className="overflow-hidden rounded-md border border-border">
              <table className="w-full text-sm">
                <tbody>
                  {specs.map((s, i) => (
                    <tr key={s.label} className={i % 2 ? "bg-surface" : "bg-card"}>
                      <td className="w-1/3 px-4 py-2.5 font-medium text-muted-foreground">{s.label}</td>
                      <td className="px-4 py-2.5 font-semibold capitalize">{s.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="rounded-lg border border-border bg-card p-6">
            <h3 className="mb-3 text-sm font-bold">Why buy from Skyvix?</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex gap-2"><BadgeCheck className="mt-0.5 h-4 w-4 text-primary" /><span>100% Genuine Products</span></li>
              <li className="flex gap-2"><Truck className="mt-0.5 h-4 w-4 text-primary" /><span>Fast local dispatch</span></li>
              <li className="flex gap-2"><ShieldCheck className="mt-0.5 h-4 w-4 text-primary" /><span>Trusted since years — Bahria Town Karachi</span></li>
              <li className="flex gap-2"><MessageCircle className="mt-0.5 h-4 w-4 text-primary" /><span>WhatsApp support: +92 332 299 2026</span></li>
            </ul>
          </div>
        </section>

        {/* ===== RATINGS & REVIEWS ===== */}
        <section className="mt-6 rounded-lg border border-border bg-card p-6">
          <h2 className="text-base font-bold">Ratings & Reviews of {product.title}</h2>

          <div className="mt-5 grid gap-6 md:grid-cols-[220px_1fr]">
            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-extrabold">{product.rating}</span>
                <span className="text-sm text-muted-foreground">/5</span>
              </div>
              <div className="mt-1 flex gap-0.5">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} className={`h-4 w-4 ${i <= Math.round(product.rating) ? "fill-warning text-warning" : "text-muted"}`} />
                ))}
              </div>
              <p className="mt-2 text-xs text-muted-foreground">{product.reviews} Ratings</p>
            </div>

            <div className="space-y-1.5">
              {dist.map((d) => (
                <div key={d.s} className="flex items-center gap-3 text-xs">
                  <div className="flex w-10 items-center gap-0.5">
                    <Star className="h-3 w-3 fill-warning text-warning" />
                    <span className="font-semibold">{d.s}</span>
                  </div>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                    <div className="h-full bg-warning" style={{ width: `${(d.n / maxN) * 100}%` }} />
                  </div>
                  <span className="w-10 text-right text-muted-foreground">{d.n}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 space-y-5 border-t border-border pt-5">
            {reviews.map((r, i) => (
              <div key={i} className="pb-5 last:pb-0 not-last:border-b not-last:border-border">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} className={`h-3.5 w-3.5 ${s <= r.stars ? "fill-warning text-warning" : "text-muted"}`} />
                      ))}
                    </div>
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-success">
                      <BadgeCheck className="h-3.5 w-3.5" /> Verified Purchase
                    </span>
                  </div>
                  <span className="text-muted-foreground">{r.date}</span>
                </div>
                <p className="mt-2 text-sm font-semibold">{r.name}</p>
                <p className="mt-1 text-sm text-foreground/85">{r.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ===== RELATED ===== */}
        {related.length > 0 && (
          <section className="mt-8">
            <h2 className="mb-4 text-xl font-extrabold tracking-tight">You may also like</h2>
            <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
              {related.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
