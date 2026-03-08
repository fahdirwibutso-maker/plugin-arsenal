import { ShoppingCart, Menu, User, Package } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import SearchAutocomplete from "@/components/SearchAutocomplete";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User as SupabaseUser } from "@supabase/supabase-js";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";

interface HeaderProps {
  cartItemCount?: number;
  isWholesale?: boolean;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
}

const Header = ({ 
  cartItemCount = 0, 
  isWholesale = false, 
  searchQuery = "",
  onSearchChange 
}: HeaderProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [username, setUsername] = useState<string>("");
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUsername(session.user.id);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        setTimeout(() => fetchUsername(session.user.id), 0);
      } else {
        setUsername("");
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUsername = async (userId: string) => {
    const { data } = await supabase
      .from('profiles')
      .select('username')
      .eq('user_id', userId)
      .single();
    if (data) setUsername(data.username);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/auth');
  };

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Shop", path: "/shop" },
    { name: "Collections", path: "/shop" },
    { name: "About", path: "/" },
    { name: "Contact", path: "/" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 sm:h-16 items-center justify-between">
        <div className="flex items-center gap-4 sm:gap-8">
          <Link to="/" className="flex items-center gap-2">
            <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-gradient-to-br from-primary to-accent" />
            <span className="text-lg sm:text-xl font-bold text-foreground">Wellar<span className="text-primary">Shop</span></span>
          </Link>
          
          <nav className="hidden lg:flex gap-6">
            {navLinks.map((link) => (
              <Link 
                key={link.name}
                to={link.path} 
                className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
              >
                {link.name}
              </Link>
            ))}
          </nav>
        </div>
        
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Wholesale Badge */}
          {isWholesale && (
            <Badge variant="default" className="hidden sm:flex items-center gap-1 text-xs">
              <Package className="h-3 w-3" />
              Wholesale
            </Badge>
          )}

          {/* Search Bar - Desktop */}
          <div className="hidden md:flex items-center gap-2">
            <SearchAutocomplete
              searchQuery={searchQuery}
              onSearchChange={(q) => onSearchChange?.(q)}
              className="w-64"
            />
          </div>
          
          {/* User Account */}
          {user && username ? (
            <div className="flex items-center gap-1 sm:gap-2">
              <Link to="/orders">
                <Button variant="ghost" size="icon" title="My Orders" className="h-8 w-8 sm:h-9 sm:w-9">
                  <Package className="h-4 w-4 sm:h-5 sm:w-5" />
                </Button>
              </Link>
              <span className="text-xs sm:text-sm font-medium hidden sm:inline">{username}</span>
              <Button variant="ghost" size="sm" onClick={handleLogout} className="text-xs sm:text-sm h-8 sm:h-9">
                Logout
              </Button>
            </div>
          ) : (
            <Link to="/auth">
              <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-9 sm:w-9">
                <User className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
            </Link>
          )}
          
          {/* Cart */}
          <Link to="/cart">
            <Button variant="ghost" size="icon" className="relative h-8 w-8 sm:h-9 sm:w-9">
              <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5" />
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 h-4 w-4 sm:h-5 sm:w-5 rounded-full bg-primary text-primary-foreground text-[10px] sm:text-xs flex items-center justify-center font-semibold">
                  {cartItemCount}
                </span>
              )}
            </Button>
          </Link>

          {/* Mobile Menu */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-9 sm:w-9">
                <Menu className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Menu</SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-4 mt-6">
                {navLinks.map((link) => (
                  <Link 
                    key={link.name}
                    to={link.path}
                    onClick={() => setIsOpen(false)}
                    className="text-lg font-medium text-foreground hover:text-primary transition-colors py-2"
                  >
                    {link.name}
                  </Link>
                ))}
                <div className="pt-4 border-t border-border">
                  <SearchAutocomplete
                    searchQuery={searchQuery}
                    onSearchChange={(q) => onSearchChange?.(q)}
                    className="w-full"
                  />
                </div>
                {isWholesale && (
                  <div className="pt-4 border-t border-border">
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-primary/10 border border-primary/20">
                      <Package className="h-4 w-4 text-primary" />
                      <span className="text-sm font-semibold text-primary">Wholesale Account Active</span>
                    </div>
                  </div>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default Header;
