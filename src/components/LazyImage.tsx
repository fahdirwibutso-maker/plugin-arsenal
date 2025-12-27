import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
}

const LazyImage = ({ src, alt, className }: LazyImageProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: "50px",
        threshold: 0.01,
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={imgRef} className={cn("relative overflow-hidden", className)}>
      {/* Blur placeholder */}
      <div
        className={cn(
          "absolute inset-0 bg-gradient-to-br from-primary/20 via-secondary/30 to-accent/20 animate-pulse transition-opacity duration-500",
          isLoaded ? "opacity-0" : "opacity-100"
        )}
      />
      
      {/* Shimmer effect while loading */}
      {!isLoaded && (
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
        </div>
      )}

      {/* Actual image */}
      {isInView && (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          onLoad={() => setIsLoaded(true)}
          className={cn(
            "h-full w-full object-cover transition-all duration-500",
            isLoaded ? "opacity-100 scale-100" : "opacity-0 scale-105"
          )}
        />
      )}
    </div>
  );
};

export default LazyImage;
