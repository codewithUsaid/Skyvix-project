import { Link } from "@tanstack/react-router";
import { Star, Heart } from "lucide-react";
import type { Product } from "@/lib/products";
import { formatPrice } from "@/lib/products";
import { wishlist, useWishlist } from "@/lib/wishlist-store";
import { ProductImage } from "./ProductImage";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function ProductCard({ product }: { product: Product }) {
  const { has } = useWishlist();
  const saved = has(product.id);
  const discount = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);

  return (
    <div className="group relative flex flex-col overflow-hidden min-w-0 rounded-lg border border-border bg-card shadow-soft transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-hover">
      <Link
        to="/products/$slug"
        params={{ slug: product.slug }}
        className="relative block aspect-square overflow-hidden bg-card"
      >
        <ProductImage
          gradient={product.gradient}
          emoji={product.emoji}
          image={product.image}
          alt={product.title}
          className="h-full w-full transition-transform duration-500 group-hover:scale-110"
        />
        {/* Discount badge — pill, top-left */}
        {discount > 0 && (
          <span className="absolute left-3 top-3 rounded-full bg-destructive px-2.5 py-1 text-[11px] font-bold tracking-normal text-destructive-foreground shadow-md">
            -{discount}%
          </span>
        )}
        {product.badge === "USED" && (
          <span className="absolute right-3 top-12 rounded-full bg-foreground/90 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-normal text-background">
            Used
          </span>
        )}
      </Link>

      <Button variant="ghost" size="icon"
        onClick={() => {
          const added = wishlist.toggle(product.id);
          toast.success(added ? "Saved to wishlist" : "Removed from wishlist", { description: product.title });
        }}
        aria-label={saved ? "Remove from wishlist" : "Save to wishlist"}
        className="absolute right-3 top-3 z-10 grid h-8 w-8 place-items-center rounded-full border border-border bg-card/95 shadow-sm transition hover:border-destructive"
      >
        <Heart className={`h-4 w-4 ${saved ? "fill-destructive text-destructive" : "text-muted-foreground"}`} />
      </Button>


      <div className="flex flex-1 flex-col min-w-0 gap-1.5 p-3 sm:p-4">
        <p className="text-[12px] font-bold uppercase tracking-normal text-muted-foreground">{product.brand}</p>
        <Link
          to="/products/$slug"
          params={{ slug: product.slug }}
          className="line-clamp-2 h-[2.6rem] overflow-hidden break-words text-[14px] font-semibold leading-snug text-foreground transition-colors hover:text-primary"
        >
          {product.title}
        </Link>

        <div className="flex min-w-0 items-center gap-1 text-[10px] text-muted-foreground">
          <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((i) => (
              <Star
                key={i}
                className={`h-3.5 w-3.5 ${
                  i <= Math.round(product.rating) ? "fill-warning text-warning" : "text-muted"
                }`}
              />
            ))}
          </div>
          <span className="font-semibold text-foreground/80">{product.rating.toFixed(1)}</span>
          <span>({product.reviews})</span>
          <span className="ml-auto hidden text-[10px] xl:inline">{product.sold.toLocaleString()} sold</span>
        </div>

        <div className="mt-auto flex min-w-0 flex-col items-start gap-1 pt-3">
          <p className="whitespace-nowrap text-[15px] font-extrabold sm:text-[17px] text-foreground">{formatPrice(product.price)}</p>
          {product.originalPrice > product.price && (
            <p className="text-xs text-muted-foreground line-through">{formatPrice(product.originalPrice)}</p>
          )}
        </div>
      </div>
    </div>
  );
}
