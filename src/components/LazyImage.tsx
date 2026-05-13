import { useState } from "react";
import { cn } from "@/lib/utils";

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  /** Skip lazy-loading for above-the-fold images so they appear instantly */
  priority?: boolean;
}

const LazyImage = ({ src, alt, className, priority = false }: LazyImageProps) => {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div className={cn("relative overflow-hidden", className)}>
      {/* Lightweight placeholder — only visible until the image paints */}
      {!isLoaded && (
        <>
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-secondary/30 to-accent/20" />
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
          </div>
        </>
      )}

      {/* Render the <img> immediately so the browser can start fetching.
          Native loading="lazy" still defers off-screen images, but without the
          extra IntersectionObserver round-trip that delayed paint. */}
      <img
        src={src}
        alt={alt}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        // @ts-expect-error fetchpriority is a valid HTML attr, not yet in React types
        fetchpriority={priority ? "high" : "auto"}
        onLoad={() => setIsLoaded(true)}
        className={cn(
          "h-full w-full object-cover transition-opacity duration-200",
          isLoaded ? "opacity-100" : "opacity-0"
        )}
      />
    </div>
  );
};

export default LazyImage;
