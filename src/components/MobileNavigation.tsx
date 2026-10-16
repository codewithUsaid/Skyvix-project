import { Link } from "@tanstack/react-router";
import { Home, Grid2X2, ShoppingCart, User } from "lucide-react";
import { useCart } from "@/lib/cart-store";

export function MobileNavigation() {
  const { count } = useCart();
  return (
    <nav aria-label="Mobile navigation" className="mobile-navigation fixed inset-x-0 bottom-0 z-50 grid grid-cols-4 border-t border-border bg-background/95 backdrop-blur-xl md:hidden">
      {[{ to: "/", label: "Home", icon: Home }, { to: "/products", label: "Products", icon: Grid2X2 }, { to: "/cart", label: "Cart", icon: ShoppingCart }, { to: "/account", label: "Account", icon: User }].map(({ to, label, icon: Icon }) => (
        <Link key={to} to={to} activeOptions={{ exact: to === "/" }} activeProps={{ className: "text-primary bg-primary-soft" }} className="relative flex min-h-16 flex-col items-center justify-center gap-1 text-[11px] font-semibold text-muted-foreground">
          <span className="relative"><Icon className="h-5 w-5" />{to === "/cart" && count > 0 && <span className="absolute -right-3 -top-2 rounded-full bg-primary px-1 text-[9px] text-primary-foreground">{count}</span>}</span>{label}
        </Link>
      ))}
    </nav>
  );
}