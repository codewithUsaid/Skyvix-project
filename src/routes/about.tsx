import { createFileRoute } from "@tanstack/react-router";
import { ShieldCheck, Users, Truck, Award } from "lucide-react";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Us — Skyvix" },
      { name: "description", content: "Pakistan's trusted destination for premium electronics. Genuine products, fast delivery, and customer-first service since 2018." },
      { property: "og:url", content: "/about" },
    ],
    links: [{ rel: "canonical", href: "/about" }],
  }),
  component: () => (
    <div className="container-px mx-auto max-w-4xl py-16">
      <span className="inline-flex rounded-full bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary">About Skyvix</span>
      <h1 className="mt-4 text-4xl font-extrabold leading-tight md:text-5xl">Tech you can trust, prices you'll love.</h1>
      <p className="mt-5 text-lg text-muted-foreground">
        Founded in 2018, Skyvix has grown into Pakistan's most reliable destination for premium electronics. We source directly from authorized distributors and partner with top brands to bring you genuine products with full warranty support.
      </p>
      <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { icon: Users, num: "15,000+", label: "Happy customers" },
          { icon: Award, num: "4.9 / 5", label: "Average rating" },
          { icon: Truck, num: "1-2 day", label: "Express delivery" },
          { icon: ShieldCheck, num: "100%", label: "Genuine products" },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl border border-border bg-card p-5 shadow-soft">
            <s.icon className="h-6 w-6 text-primary" />
            <p className="mt-3 text-2xl font-extrabold">{s.num}</p>
            <p className="text-sm text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>
      <div className="mt-12 rounded-3xl border border-border bg-card p-8 shadow-soft">
        <h2 className="text-2xl font-bold">Our promise</h2>
        <p className="mt-3 text-muted-foreground">Every product is verified for authenticity. Every order is wrapped with care. Every customer gets the support they deserve — before, during, and after the sale.</p>
      </div>
    </div>
  ),
});
