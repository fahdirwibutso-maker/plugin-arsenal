import { useState, useRef, useEffect, useMemo } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { products } from "@/data/products";
import { useNavigate } from "react-router-dom";
import LazyImage from "@/components/LazyImage";

interface SearchAutocompleteProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  className?: string;
}

const SearchAutocomplete = ({ searchQuery, onSearchChange, className }: SearchAutocompleteProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const suggestions = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return products
      .filter(p => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q))
      .slice(0, 8);
  }, [searchQuery]);

  const categoryMatches = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    const cats = [...new Set(products.map(p => p.category))];
    return cats.filter(c => c.toLowerCase().includes(q)).slice(0, 3);
  }, [searchQuery]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (productId: number) => {
    setIsOpen(false);
    navigate(`/product/${productId}`);
  };

  const handleCategorySelect = (category: string) => {
    onSearchChange(category);
    setIsOpen(false);
    navigate("/shop");
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
      <Input
        type="search"
        placeholder="Search products..."
        className="pl-9 pr-8"
        value={searchQuery}
        onChange={(e) => {
          onSearchChange(e.target.value);
          setIsOpen(true);
        }}
        onFocus={() => searchQuery.trim() && setIsOpen(true)}
      />
      {searchQuery && (
        <button
          onClick={() => { onSearchChange(""); setIsOpen(false); }}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
      )}

      {isOpen && searchQuery.trim() && (suggestions.length > 0 || categoryMatches.length > 0) && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-popover border border-border rounded-lg shadow-lg z-50 overflow-hidden max-h-[400px] overflow-y-auto">
          {categoryMatches.length > 0 && (
            <div className="p-2 border-b border-border">
              <p className="text-xs font-medium text-muted-foreground px-2 pb-1">Categories</p>
              {categoryMatches.map(cat => (
                <button
                  key={cat}
                  onClick={() => handleCategorySelect(cat)}
                  className="w-full text-left px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors flex items-center gap-2"
                >
                  <Search className="h-3 w-3 text-muted-foreground" />
                  {cat}
                </button>
              ))}
            </div>
          )}
          
          {suggestions.length > 0 && (
            <div className="p-2">
              <p className="text-xs font-medium text-muted-foreground px-2 pb-1">Products</p>
              {suggestions.map(product => (
                <button
                  key={product.id}
                  onClick={() => handleSelect(product.id)}
                  className="w-full text-left px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors flex items-center gap-3"
                >
                  <div className="h-8 w-8 rounded-md overflow-hidden flex-shrink-0 bg-muted">
                    <LazyImage src={product.image} alt={product.name} className="h-full w-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{product.name}</p>
                    <p className="text-xs text-muted-foreground">{product.category}</p>
                  </div>
                  <span className="text-xs font-semibold text-primary">${product.price.toFixed(2)}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {isOpen && searchQuery.trim() && suggestions.length === 0 && categoryMatches.length === 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-popover border border-border rounded-lg shadow-lg z-50 p-4 text-center text-sm text-muted-foreground">
          No products found for "{searchQuery}"
        </div>
      )}
    </div>
  );
};

export default SearchAutocomplete;
