import { useState } from "react";
import { cn } from "@/lib/utils";
import { buildSrcSet, transformedImageUrl } from "@/lib/imageUrl";

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  /** Intrinsic width hint in CSS px — used for width/height attrs to prevent CLS */
  width?: number;
  /** Intrinsic height hint in CSS px — defaults to width for square product images */
  height?: number;
  /** Responsive sizes attribute, e.g. "(min-width: 1024px) 200px, 50vw" */
  sizes?: string;
  /** Skip lazy-loading for above-the-fold images so they appear instantly */
  priority?: boolean;
}

const LazyImage = ({
  src,
  alt,
  className,
  width = 400,
  height,
  sizes = "(min-width: 1280px) 200px, (min-width: 768px) 25vw, 50vw",
  priority = false,
}: LazyImageProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const h = height ?? width;

  const srcSet = buildSrcSet(src);
  const optimizedSrc = transformedImageUrl(src, width);

  return (
    <div className={cn("relative overflow-hidden", className)}>
      {!isLoaded && (
        <>
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-secondary/30 to-accent/20" />
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
          </div>
        </>
      )}

      <img
        src={optimizedSrc}
        srcSet={srcSet || undefined}
        sizes={srcSet ? sizes : undefined}
        alt={alt}
        width={width}
        height={h}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        // @ts-expect-error fetchpriority is a valid HTML attr, not yet in React types
        fetchpriority={priority ? "high" : "auto"}
        onLoad={() => setIsLoaded(true)}
        onError={(e) => {
          // Fallback to original URL if the transform endpoint fails (e.g. plan-gated)
          const img = e.currentTarget;
          if (img.src !== src) {
            img.srcset = "";
            img.src = src;
          }
        }}
        className={cn(
          "h-full w-full object-cover transition-opacity duration-200",
          isLoaded ? "opacity-100" : "opacity-0"
        )}
      />
    </div>
  );
};

export default LazyImage;
