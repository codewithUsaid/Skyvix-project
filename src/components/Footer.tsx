import { Link } from "@tanstack/react-router";
import { Facebook, Instagram, Twitter, Youtube, Mail, Phone, MapPin, MessageCircle } from "lucide-react";
import { STORE_ADDRESS } from "@/lib/store-config";

export function Footer() {
  return (
    <footer className="mt-16 border-t border-border bg-surface">
      <div className="container-px mx-auto max-w-7xl py-14">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <Link to="/" className="flex items-center gap-3">
              <span className="text-3xl font-extrabold text-primary">Skyvix</span>
            </Link>
            <p className="mt-4 max-w-xs text-sm text-muted-foreground">
              Premium tech gear for everyone. Genuine products, fast delivery, and a 7-day return promise.
            </p>
            <div className="mt-5 flex gap-2">
              {[
                { Icon: Facebook, href: "#" },
                { Icon: Instagram, href: "#" },
                { Icon: Twitter, href: "#" },
                { Icon: Youtube, href: "#" },
              ].map(({ Icon, href }, i) => (
                <a
                  key={i}
                  href={href}
                  aria-label="social"
                  className="group grid h-10 w-10 place-items-center overflow-hidden rounded-full border border-border bg-card text-muted-foreground transition-all duration-300 hover:-translate-y-1 hover:rotate-[-6deg] hover:border-primary hover:bg-primary hover:text-primary-foreground hover:shadow-hover"
                >
                  <Icon className="h-4 w-4 transition-transform duration-300 group-hover:scale-125" />
                </a>
              ))}
            </div>
          </div>

          <FooterCol
            title="Quick Links"
            links={[
              { to: "/", label: "Home" },
              { to: "/products", label: "Products" },
              { to: "/categories", label: "Categories" },
              { to: "/about", label: "About Us" },
              { to: "/contact", label: "Contact" },
            ]}
          />
          <FooterCol
            title="Customer Service"
            links={[
              { to: "/account", label: "My Account" },
              { to: "/cart", label: "Cart" },
              { to: "/products", label: "Track Order" },
              { to: "/about", label: "Returns & Refunds" },
              { to: "/contact", label: "FAQ" },
            ]}
          />

          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-foreground">Contact Us</h4>
            <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
              <li className="flex items-start gap-3">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <a href="tel:+923322992026" className="hover:text-primary">+92 332 299 2026</a>
              </li>
              <li className="flex items-start gap-3">
                <MessageCircle className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <a href="https://wa.me/923322992026" className="hover:text-primary">WhatsApp: +92 332 299 2026</a>
              </li>
              <li className="flex items-start gap-3">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <div>
                  <p className="font-semibold text-foreground">Memon Usaid Raza</p>
                  <a href="mailto:usaidraza220@gmail.com" className="hover:text-primary">usaidraza220@gmail.com</a>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <span>{STORE_ADDRESS}</span>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <span>Delivery only within Bahria Town Karachi</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div className="border-t border-border px-4 py-5 text-center text-xs text-muted-foreground">© {new Date().getFullYear()} Skyvix All rights reserved.</div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: { to: string; label: string }[] }) {
  return (
    <div>
      <h4 className="text-sm font-bold uppercase tracking-wider text-foreground">{title}</h4>
      <ul className="mt-4 space-y-2.5 text-sm">
        {links.map((l) => (
          <li key={l.label}>
            <Link to={l.to as any} className="text-muted-foreground transition hover:text-primary">{l.label}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
