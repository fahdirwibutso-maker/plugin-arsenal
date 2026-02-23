import { useEffect, useState } from "react";
import { ShoppingCart } from "lucide-react";

const SplashScreen = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [isAnimating, setIsAnimating] = useState(true);

  useEffect(() => {
    // Check if this is a PWA launch
    const isPWA = window.matchMedia('(display-mode: standalone)').matches ||
                  (window.navigator as any).standalone === true;
    
    // Always show splash on PWA, or first visit
    const hasSeenSplash = sessionStorage.getItem('hasSeenSplash');
    
    if (!isPWA && hasSeenSplash) {
      setIsVisible(false);
      return;
    }

    sessionStorage.setItem('hasSeenSplash', 'true');

    const animationTimer = setTimeout(() => {
      setIsAnimating(false);
    }, 2500);

    const hideTimer = setTimeout(() => {
      setIsVisible(false);
    }, 3000);

    return () => {
      clearTimeout(animationTimer);
      clearTimeout(hideTimer);
    };
  }, []);

  if (!isVisible) return null;

  return (
    <div 
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-background transition-opacity duration-500 ${
        !isAnimating ? 'opacity-0' : 'opacity-100'
      }`}
    >
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-primary/10 rounded-full blur-3xl animate-pulse delay-300" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-primary/10 rounded-full animate-spin" style={{ animationDuration: '20s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] border border-primary/5 rounded-full animate-spin" style={{ animationDuration: '15s', animationDirection: 'reverse' }} />
      </div>

      {/* Logo container */}
      <div className="relative z-10 flex flex-col items-center">
        {/* Icon with glow */}
        <div className="relative mb-6 animate-bounce" style={{ animationDuration: '2s' }}>
          <div className="absolute inset-0 bg-primary/50 blur-2xl rounded-full scale-150" />
          <div className="relative p-6 bg-gradient-to-br from-primary to-primary/70 rounded-2xl shadow-2xl shadow-primary/50">
            <ShoppingCart className="w-16 h-16 text-primary-foreground" />
          </div>
        </div>

        {/* App name */}
        <h1 className="text-4xl font-bold text-foreground mb-2 tracking-tight">
          Wellar<span className="text-primary">Shop</span>
        </h1>
        <p className="text-muted-foreground text-sm tracking-widest uppercase">
          Your Smart Supermarket
        </p>

        {/* Loading indicator */}
        <div className="mt-8 flex gap-1">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 bg-primary rounded-full animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
      </div>

      {/* Bottom gradient line */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent" />
    </div>
  );
};

export default SplashScreen;