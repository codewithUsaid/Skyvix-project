import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { ChevronDown, Search, ShoppingCart, User } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useCart } from "@/lib/cart-store";
import { categories } from "@/lib/products";
import { Button } from "@/components/ui/button";

const nav = [
  { to: "/", label: "Home" },
  { to: "/products", label: "Products" },
  { to: "/about", label: "About Us" },
  { to: "/contact", label: "Contact" },
] as const;

export function Header() {
  const [cat, setCat] = useState("All Categories");
  const [q, setQ] = useState("");
  const { count } = useCart();
  const navigate = useNavigate();
  const path = useRouterState({ select: (s) => s.location.pathname });

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate({ to: "/products", search: { q: q || undefined, cat: cat !== "All Categories" ? cat : undefined } as any });
  };

  const isActive = (to: string) => (to === "/" ? path === "/" : path.startsWith(to));

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/90 backdrop-blur-xl">
      <div className="container-px mx-auto grid max-w-7xl grid-cols-[minmax(0,1fr)_auto] items-center gap-3 py-3 md:flex">
        {/* Logo */}
        <Link to="/" className="flex shrink-0 items-center" aria-label="Skyvix home">
          <span className="text-3xl font-extrabold text-primary">Skyvix<span className="text-foreground">.</span></span>
        </Link>

        {/* Desktop Nav */}
        <nav className="ml-2 hidden items-center lg:flex">
          {nav.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className={`nav-link rounded-md px-3 py-2 text-[13px] font-semibold text-foreground/80 transition-colors hover:text-primary ${
                isActive(n.to) ? "nav-link-active" : ""
              }`}
            >
              {n.label}
            </Link>
          ))}
          <CategoriesDropdown />
        </nav>

        {/* Search with solid blue border */}
        <form
          onSubmit={onSearch}
          className="ml-auto hidden min-w-0 flex-1 items-center overflow-hidden rounded-full border-2 border-primary bg-card md:flex md:max-w-xl"
        >
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search laptops, printers, brands..."
            aria-label="Search products"
            className="h-10 min-w-0 flex-1 bg-transparent px-4 text-sm outline-none placeholder:text-muted-foreground"
          />
          <Button type="submit" variant="ghost" className="grid h-10 w-11 rounded-none p-0 place-items-center bg-primary text-primary-foreground transition-colors hover:bg-primary/90" aria-label="Search">
            <Search className="h-4 w-4" />
          </Button>
        </form>

        {/* Right actions — icons turn blue on hover */}
        <div className="ml-auto flex items-center gap-1 md:ml-2">
          <Link
            to="/account"
            className="hidden h-10 items-center gap-1.5 rounded-full px-4 text-[13px] font-medium text-foreground transition-colors duration-200 hover:bg-primary hover:text-primary-foreground md:inline-flex"
          >
            <User className="h-5 w-5" />
            <span>Account</span>
          </Link>
          <Link
            to="/cart"
            aria-label="Cart"
            className="relative grid h-10 w-10 place-items-center rounded-full text-foreground transition-colors duration-200 hover:bg-primary hover:text-primary-foreground"
          >
            <ShoppingCart className="h-5 w-5" />
            {count > 0 && (
              <span className="absolute -right-0.5 -top-0.5 grid h-5 min-w-[20px] place-items-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground ring-2 ring-background">
                {count}
              </span>
            )}
          </Link>
          <Button
            onClick={() => navigate({ to: "/products" })}
            variant="ghost" className="grid h-10 w-10 p-0 place-items-center rounded-full transition-colors hover:text-primary md:hidden"
            aria-label="Search"
          >
            <Search className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Mobile nav strip */}
      <nav className="border-t border-border lg:hidden">
        <div className="container-px mx-auto flex max-w-7xl items-center gap-1 overflow-x-auto py-1.5">
          {nav.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className={`nav-link shrink-0 rounded-md px-3 py-1.5 text-[12px] font-semibold text-foreground/80 transition-colors hover:text-primary ${
                isActive(n.to) ? "nav-link-active" : ""
              }`}
            >
              {n.label}
            </Link>
          ))}
        </div>
      </nav>
    </header>
  );
}

function CategoriesDropdown() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);
  return (
    <div ref={ref} className="relative">
      <Button
        onClick={() => setOpen((o) => !o)}
        variant="ghost" aria-expanded={open} className={`nav-link inline-flex items-center gap-1 rounded-md px-3 py-2 text-[13px] font-semibold text-foreground/80 transition-colors hover:text-primary ${
          open ? "text-primary" : ""
        }`}
      >
        Categories
        <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`} />
      </Button>
      {open && (
        <div className="animate-fade-in absolute left-0 top-full z-50 mt-1 w-max min-w-[9rem] max-w-[calc(100vw-2rem)] max-h-96 overflow-y-auto overflow-hidden rounded-lg border border-border bg-card shadow-elevated">
          <ul className="py-1">
            {categories.map((c) => (
              <li key={c.slug}>
                <Link
                  to="/products"
                  search={{ cat: c.slug } as any}
                  onClick={() => setOpen(false)}
                  className="block whitespace-nowrap px-3 py-1.5 text-[13px] font-medium text-foreground transition hover:bg-primary-soft hover:text-primary"
                >
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
