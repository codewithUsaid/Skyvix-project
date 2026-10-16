import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import gamingPoster from "@/assets/skyvix-gaming-poster.jpg";
import officePoster from "@/assets/skyvix-office-poster.jpg";
import laptopPoster from "@/assets/hero-laptop.jpg";

const slides = [
  { image: gamingPoster, eyebrow: "PERFORMANCE WITHOUT COMPROMISE", title: "Gaming laptops.", subtitle: "Power for your next level.", copy: "Discover laptops, hardware and everyday electronics at Skyvix", category: "laptops", action: "Explore laptops" },
  { image: officePoster, eyebrow: "YOUR WORKSPACE, UPGRADED", title: "Office essentials.", subtitle: "Built for your everyday.", copy: "Printers, networking and accessories for a better-connected workspace.", category: "printers", action: "Shop office tech" },
  { image: laptopPoster, eyebrow: "SMART TECH. BETTER VALUE.", title: "Business laptops.", subtitle: "A smarter way to work.", copy: "Browse imported used laptops and practical upgrades for home and work.", category: "laptops", action: "Browse the collection" },
];

export function HeroCarousel() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    if (paused || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(() => setIndex((i) => (i + 1) % slides.length), 5000);
    return () => window.clearInterval(timer);
  }, [paused]);
  const slide = slides[index] ?? slides[0];
  if (!slide) return null;
  return (
    <section aria-roledescription="carousel" aria-label="Skyvix collections" className="skyvix-hero relative w-full overflow-hidden bg-hero text-hero-foreground">
      {slides.map((s, i) => <img key={s.title} src={s.image} alt={s.title} width={1920} height={1024} loading={i === 0 ? "eager" : "lazy"} className={`hero-poster absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${index === i ? "opacity-100" : "opacity-0"}`} />)}
      <div className="hero-shade absolute inset-0" />
      <div className="container-px relative mx-auto flex min-h-[450px] max-w-7xl items-center py-16 md:min-h-[500px]">
        <div className="max-w-lg min-w-0">
          <p className="text-[11px] font-bold text-hero-foreground/75">{slide.eyebrow}</p>
          <h1 className="mt-4 text-4xl font-extrabold leading-tight md:text-5xl">Skyvix</h1>
          <h2 className="mt-2 text-3xl font-bold leading-tight md:text-4xl">{slide.title}<br /><span className="text-hero-accent">{slide.subtitle}</span></h2>
          <p className="mt-5 max-w-sm text-sm leading-relaxed text-hero-foreground/75">{slide.copy}</p>
          <Button asChild size="lg" className="mt-7 h-12 rounded-full"><Link to="/products" search={{ cat: slide.category }}>{slide.action}<ArrowRight /></Link></Button>
          <p className="mt-5 text-xs text-hero-foreground/70">Delivery exclusively in Bahria Town Karachi</p>
        </div>
      </div>
      <div className="container-px absolute bottom-5 left-0 right-0 mx-auto flex max-w-7xl items-center justify-between">
        <div className="flex gap-2">{slides.map((s, i) => <Button key={s.title} variant="ghost" aria-label={`Show poster ${i + 1}`} aria-pressed={i === index} onClick={() => setIndex(i)} className={`h-2 min-w-0 rounded-full p-0 ${i === index ? "w-8 bg-primary" : "w-2 bg-hero-foreground/40"}`} />)}</div>
        <div className="flex gap-1"><Button variant="ghost" size="icon" aria-label="Previous poster" onClick={() => setIndex((index + 2) % 3)}><ChevronLeft /></Button><Button variant="ghost" size="icon" aria-label={paused ? "Play posters" : "Pause posters"} onClick={() => setPaused(!paused)}>{paused ? <Play /> : <Pause />}</Button><Button variant="ghost" size="icon" aria-label="Next poster" onClick={() => setIndex((index + 1) % 3)}><ChevronRight /></Button></div>
      </div>
    </section>
  );
}