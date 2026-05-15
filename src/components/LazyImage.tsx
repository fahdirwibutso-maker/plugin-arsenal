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
  /** Responsive sizes attribute */
  sizes?: string;
  /** Skip lazy-loading for above-the-fold images so they appear instantly */
  priority?: boolean;
  /** Aspect ratio fallback (e.g. "1 / 1") when explicit width/height are not provided */
  aspectRatio?: string;
}

const LazyImage = ({
  src,
  alt,
  className,
  width,
  height,
  sizes = "(min-width: 1280px) 200px, (min-width: 768px) 25vw, 50vw",
  priority = false,
  aspectRatio = "1 / 1",
}: LazyImageProps) => {
  const [isLoaded, setIsLoaded] = useState(false);

  const hasExplicitDims = width != null && height != null;
  const renderWidth = width ?? 400;
  const renderHeight = height ?? width ?? 400;

  const srcSet = buildSrcSet(src);
  const optimizedSrc = transformedImageUrl(src, renderWidth);

  // If no explicit dims, reserve space using aspect-ratio so layout doesn't jump
  const wrapperStyle = hasExplicitDims ? undefined : { aspectRatio };

  return (
    <div
      className={cn("relative overflow-hidden", className)}
      style={wrapperStyle}
    >
      {!isLoaded && (
        <div className="absolute inset-0 bg-muted animate-pulse">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-secondary/20 to-accent/10" />
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-foreground/10 to-transparent animate-shimmer" />
          </div>
        </div>
      )}

      <img
        src={optimizedSrc}
        srcSet={srcSet || undefined}
        sizes={srcSet ? sizes : undefined}
        alt={alt}
        width={renderWidth}
        height={renderHeight}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        // @ts-expect-error fetchpriority is a valid HTML attr, not yet in React types
        fetchpriority={priority ? "high" : "auto"}
        onLoad={() => setIsLoaded(true)}
        onError={(e) => {
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
