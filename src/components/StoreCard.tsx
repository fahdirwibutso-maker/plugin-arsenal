import { Link } from "react-router-dom";
import { MapPin, Store as StoreIcon, Clock } from "lucide-react";
import type { Store } from "@/hooks/useStores";

const StoreCard = ({ store, productCount }: { store: Store; productCount?: number }) => (
  <Link
    to={`/store/${store.slug}`}
    className="futuristic-card group flex items-center gap-3 p-3 min-w-[220px] transition-all duration-300 hover:scale-[1.02]"
  >
    <div className="h-14 w-14 shrink-0 rounded-lg overflow-hidden bg-primary/10 flex items-center justify-center">
      {store.logo ? (
        <img src={store.logo} alt={store.name} className="h-full w-full object-cover" loading="lazy" />
      ) : (
        <StoreIcon className="h-6 w-6 text-primary" />
      )}
    </div>
    <div className="min-w-0">
      <h3 className="font-semibold text-sm text-foreground group-hover:text-primary truncate">{store.name}</h3>
      {store.location && (
        <p className="text-[11px] text-muted-foreground flex items-center gap-1 truncate">
          <MapPin className="h-3 w-3 shrink-0" /> {store.location}
        </p>
      )}
      {store.opening_hours && (
        <p className="text-[11px] text-muted-foreground flex items-center gap-1 truncate">
          <Clock className="h-3 w-3 shrink-0" /> {store.opening_hours}
        </p>
      )}
      {productCount != null && (
        <p className="text-[10px] text-primary/80 font-medium">{productCount} products</p>
      )}
    </div>
  </Link>
);

export default StoreCard;
