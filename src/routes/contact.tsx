import { createFileRoute } from "@tanstack/react-router";
import { Phone, Mail, MapPin, Clock } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact Us — Skyvix" },
      { name: "description", content: "Get in touch with the Skyvix team. We're here to help via phone, email, or in-store." },
      { property: "og:url", content: "/contact" },
    ],
    links: [{ rel: "canonical", href: "/contact" }],
  }),
  component: () => (
    <div className="container-px mx-auto max-w-6xl py-12">
      <h1 className="text-4xl font-extrabold tracking-tight md:text-5xl">Get in touch</h1>
      <p className="mt-3 text-lg text-muted-foreground">We typically reply within a few hours.</p>
      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            toast.success("Message sent — we'll be in touch soon.");
            (e.target as HTMLFormElement).reset();
          }}
          className="space-y-4 rounded-3xl border border-border bg-card p-6 shadow-card md:p-8"
        >
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Name" />
            <Field label="Email" type="email" />
          </div>
          <Field label="Subject" />
          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold text-muted-foreground">Message</span>
            <textarea rows={5} required className="w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
          </label>
          <button className="rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/30 hover:bg-primary/90">Send message</button>
        </form>
        <div className="space-y-4">
          {[
            { icon: Phone, title: "Phone", value: "+92 300 1234567", sub: "Mon–Sat 9am–9pm" },
            { icon: Mail, title: "Email", value: "hello@supercomputers.pk", sub: "We reply within hours" },
            { icon: MapPin, title: "Visit us", value: "Main Boulevard Gulberg, Lahore", sub: "Pakistan" },
            { icon: Clock, title: "Hours", value: "Mon–Sat · 9am–9pm", sub: "Sunday: 12pm–6pm" },
          ].map((c) => (
            <div key={c.title} className="flex gap-4 rounded-2xl border border-border bg-card p-5 shadow-soft">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary"><c.icon className="h-5 w-5" /></span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{c.title}</p>
                <p className="font-bold">{c.value}</p>
                <p className="text-sm text-muted-foreground">{c.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  ),
});

function Field({ label, type = "text" }: { label: string; type?: string }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold text-muted-foreground">{label}</span>
      <input required type={type} className="w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
    </label>
  );
}
