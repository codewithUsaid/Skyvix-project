import { useState } from "react";

type Props = { gradient: string; emoji: string; image?: string; alt?: string; className?: string };

export function ProductImage({ gradient, emoji, image, alt, className = "" }: Props) {
  const [failed, setFailed] = useState(false);
  if (image && !failed) {
    return (
      <div className={`relative overflow-hidden bg-white ${className}`}>
        <img
          src={image}
          alt={alt || ""}
          loading="lazy"
          onError={() => setFailed(true)}
          className="absolute inset-0 h-full w-full object-cover"
        />
      </div>
    );
  }
  return (
    <div
      className={`relative flex items-center justify-center overflow-hidden bg-gradient-to-br ${gradient} ${className}`}
    >
      <div className="absolute inset-0 opacity-40 mix-blend-overlay [background-image:radial-gradient(circle_at_30%_20%,white,transparent_50%)]" />
      <span className="relative text-7xl drop-shadow-lg">{emoji}</span>
    </div>
  );
}
