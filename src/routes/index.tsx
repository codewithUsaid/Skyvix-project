import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, RotateCcw, ShieldCheck, Headphones, Clock, Star, Truck } from "lucide-react";
import { ProductCard } from "@/components/ProductCard";
import { categories, products, formatPrice } from "@/lib/products";
import { HeroCarousel } from "@/components/HeroCarousel";
import { useSuspenseQuery } from "@tanstack/react-query";
import { dbProductsQuery } from "@/lib/catalog-queries";
import { mergeCatalog } from "@/lib/catalog-map";
import offerHeadphones from "@/assets/offer-headphones.jpg";
import offerBundle from "@/assets/offer-bundle.jpg";
import offerLaptop from "@/assets/offer-laptop.jpg";
import offerAccessories from "@/assets/offer-accessories.jpg";

export const Route = createFileRoute("/")({
  loader: ({ context }) => context.queryClient.ensureQueryData(dbProductsQuery),
  head: () => ({
    meta: [
      { title: "Skyvix — Tech You Can Trust" },
      { name: "description", content: "Shop laptops, printers, accessories and small electronics under Rs.1000. Trusted by 15,000+ customers in Bahria Town Karachi." },
      { property: "og:title", content: "Skyvix — Tech You Can Trust" },
      { property: "og:description", content: "Premium and used laptops, printers, accessories and budget tech in Bahria Town Karachi." },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  component: HomePage,
});

function HomePage() {
  const { data } = useSuspenseQuery(dbProductsQuery);
  const catalog = mergeCatalog(data.products, products);
  const mostSelling = [...catalog].sort((a, b) => b.sold - a.sold).slice(0, 10);
  const usedLaptops = catalog.filter((p) => p.badge === "USED" && p.category === "laptops").slice(0, 10);
  const under1000 = catalog.filter((p) => p.price < 1000).slice(0, 10);
  const office = catalog.filter((p) => p.category === "printers").slice(0, 10);

  const promos = [
    { id: "most-selling", tag: "SALE", tagColor: "bg-primary text-primary-foreground", title: "Up to 30h Battery Life", sub: "Shop our best-ever deals.", image: offerHeadphones },
    { id: "office-printers", tag: "Best Deal", tagColor: "bg-success text-primary-foreground", title: "Upgrade your workspace", sub: "Printers and everyday office essentials.", image: offerBundle },
    { id: "used-laptops", tag: "NEW", tagColor: "bg-destructive text-destructive-foreground", title: "Used Laptops from Rs. 26,500", sub: "i3/i5 up to 7th gen — imported A-grade.", image: offerLaptop },
    { id: "under-1000", tag: "Under 1000", tagColor: "bg-foreground text-background", title: "Daily-use gear under Rs.1000", sub: "Cables, OTGs, mouse pads & more.", image: offerAccessories },
  ];
  const promoById = Object.fromEntries(promos.map((p) => [p.id, p]));

  // Duplicate categories for seamless marquee loop
  const marqueeCats = [...categories, ...categories];

  return (
    <>
      <HeroCarousel />

      {/* TRUST STRIP */}
      <section className="container-px mx-auto mt-10 max-w-7xl">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
          {[
            { icon: Truck, title: "Local Delivery", sub: "Bahria Town Karachi only" },
            { icon: RotateCcw, title: "Easy Returns", sub: "7-day return policy" },
            { icon: ShieldCheck, title: "Warranty", sub: "Tested & verified" },
            { icon: Headphones, title: "Friendly Support", sub: "Call or WhatsApp" },
          ].map((f) => (
            <div key={f.title} className="group flex items-center gap-4 rounded-lg border border-border bg-card p-4 shadow-soft transition hover:border-primary hover:shadow-card">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary transition group-hover:bg-primary group-hover:text-primary-foreground">
                <f.icon className="h-5 w-5" />
              </span>
              <div className="leading-tight">
                <p className="text-sm font-semibold">{f.title}</p>
                <p className="text-xs text-muted-foreground">{f.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SHOP BY CATEGORY — sliding marquee with real images */}
      <section className="container-px mx-auto mt-16 max-w-7xl">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-extrabold tracking-normal md:text-3xl">Shop by Category</h2>
            <p className="mt-1 text-sm text-muted-foreground">Browse our most popular collections</p>
          </div>
          <Link to="/categories" className="inline-flex items-center gap-1 text-sm font-semibold text-primary transition hover:gap-2">
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="marquee-pause relative overflow-hidden">
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-12 bg-gradient-to-r from-background to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-12 bg-gradient-to-l from-background to-transparent" />
          <div className="marquee-track gap-4 py-2" data-marquee>
            {marqueeCats.map((c, i) => (
              <Link
                key={`${c.slug}-${i}`}
                to="/products"
                search={{ cat: c.slug } as any}
                className="group flex w-[170px] shrink-0 flex-col items-center gap-2 rounded-lg border border-border bg-card p-3 shadow-soft transition hover:-translate-y-1 hover:border-primary hover:shadow-hover"
              >
                <div className="aspect-square w-full overflow-hidden rounded-xl bg-muted">
                  <img src={c.image} alt={c.name} className="h-full w-full object-cover transition duration-500 group-hover:scale-110" />
                </div>
                <p className="mt-1 text-[13px] font-semibold leading-tight">{c.name}</p>
                <p className="text-[11px] text-primary">View Collection</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* PROMO BANNERS — 4 special offer cards */}
      <section className="container-px mx-auto mt-16 max-w-7xl">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {promos.map((p) => (
            <a
              key={p.title}
              href={`#${p.id}`}
              className="group relative flex aspect-[4/3] flex-col justify-between overflow-hidden rounded-lg bg-hero p-5 text-hero-foreground shadow-soft transition hover:-translate-y-1 hover:shadow-hover"
            >
              <img
                src={p.image}
                alt={p.title}
                loading="lazy"
                className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-hero/80 via-hero/30 to-hero/10" />
              <span className={`relative inline-flex w-fit items-center rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-normal ${p.tagColor}`}>{p.tag}</span>
              <div className="relative">
                <p className="text-lg font-extrabold leading-tight drop-shadow-lg">{p.title}</p>
                <p className="mt-1 text-xs text-hero-foreground/90 drop-shadow">{p.sub}</p>
                <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold">
                  Shop Now <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                </span>
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* MOST SELLING PRODUCTS */}
      <Section id="most-selling" poster={promoById["most-selling"]} title="Most Selling Products" eyebrow="Customer favourites this month" link="/products">
        <Grid>
          {mostSelling.map((p) => <ProductCard key={p.id} product={p} />)}
        </Grid>
      </Section>

      {/* USED LAPTOPS */}
      <Section id="used-laptops" poster={promoById["used-laptops"]} title="Used Laptops (i3 / i5 — up to 7th Gen)" eyebrow="Imported A-grade business laptops at unbeatable prices" link="/products">
        <Grid>
          {usedLaptops.map((p) => <ProductCard key={p.id} product={p} />)}
        </Grid>
      </Section>

      {/* UNDER Rs. 1,000 */}
      <Section id="under-1000" poster={promoById["under-1000"]} title="Daily Essentials — Under Rs. 1,000" eyebrow="Cables, adapters, mouse pads and more" link="/products">
        <Grid>
          {under1000.map((p) => <ProductCard key={p.id} product={p} />)}
        </Grid>
      </Section>

      {/* OFFICE COLLECTION */}
      <Section id="office-printers" poster={promoById["office-printers"]} title="Office Collection" eyebrow="Printers, scanners & office essentials" link="/products">
        <Grid>
          {office.map((p) => <ProductCard key={p.id} product={p} />)}
        </Grid>
      </Section>

      {/* TRUST STRIP */}
      <section className="container-px mx-auto mt-20 max-w-7xl">
        <div className="grid items-center gap-6 rounded-lg bg-gradient-to-br from-primary to-primary px-6 py-10 text-primary-foreground md:grid-cols-3 md:px-12">
          {[
            { icon: Star, title: "4.9 / 5", sub: "Average rating from 8,200+ reviews" },
            { icon: Clock, title: "1-2 Day", sub: "Bahria Town Karachi delivery" },
            { icon: ShieldCheck, title: "100% Genuine", sub: "Tested before dispatch" },
          ].map((s) => (
            <div key={s.title} className="flex items-center gap-4">
              <span className="grid h-12 w-12 place-items-center rounded-xl bg-primary-foreground/15 backdrop-blur">
                <s.icon className="h-6 w-6" />
              </span>
              <div>
                <p className="text-2xl font-extrabold">{s.title}</p>
                <p className="text-sm text-hero-foreground/80">{s.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

type Poster = { tag: string; tagColor: string; title: string; sub: string; image: string };

function Section({ id, poster, title, eyebrow, link, children }: { id?: string; poster?: Poster; title: string; eyebrow?: string; link?: string; children: React.ReactNode }) {
  return (
    <section id={id} className="container-px mx-auto mt-16 max-w-7xl scroll-mt-28">
      {poster && (
        <div className="relative mb-6 overflow-hidden rounded-lg bg-hero shadow-card">
          <img src={poster.image} alt={poster.title} loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-hero/85 via-hero/55 to-transparent" />
          <div className="relative flex min-h-[160px] flex-col justify-center gap-2 px-6 py-8 text-hero-foreground md:px-10">
            <span className={`inline-flex w-fit items-center rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-normal ${poster.tagColor}`}>{poster.tag}</span>
            <p className="text-2xl font-extrabold leading-tight drop-shadow-lg md:text-3xl">{poster.title}</p>
            <p className="text-sm text-hero-foreground/85 drop-shadow">{poster.sub}</p>
          </div>
        </div>
      )}
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold tracking-normal md:text-3xl">{title}</h2>
          {eyebrow && <p className="mt-1 text-sm text-muted-foreground">{eyebrow}</p>}
        </div>
        {link && (
          <Link to={link as any} className="inline-flex items-center gap-1 text-sm font-semibold text-primary transition hover:gap-2">
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        )}
      </div>
      {children}
    </section>
  );
}

function Grid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">{children}</div>;
}
