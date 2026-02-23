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
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface HeaderProps {
  cartItemCount?: number;
  isWholesale?: boolean;
  onWholesaleToggle?: (value: boolean) => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
}

const Header = ({ 
  cartItemCount = 0, 
  isWholesale = false, 
  onWholesaleToggle,
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
        setTimeout(() => {
          fetchUsername(session.user.id);
        }, 0);
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
    
    if (data) {
      setUsername(data.username);
    }
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
      <div className="container flex h-16 items-center justify-between">
        {/* Logo and Desktop Navigation */}
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-accent" />
            <span className="text-xl font-bold text-foreground">Wellar<span className="text-primary">Shop</span></span>
          </Link>
          
          {/* Desktop Navigation */}
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
        
        {/* Right Side Actions */}
        <div className="flex items-center gap-3">
          {/* Wholesale/Retail Toggle */}
          <div className="hidden md:flex items-center gap-2 px-3 py-2 rounded-lg bg-card border border-border">
            <Label htmlFor="wholesale-mode" className="text-sm font-medium flex items-center gap-1.5 cursor-pointer">
              <Package className="h-4 w-4 text-primary" />
              <span className={!isWholesale ? "text-muted-foreground" : ""}>Retail</span>
            </Label>
            <Switch 
              id="wholesale-mode" 
              checked={isWholesale}
              onCheckedChange={onWholesaleToggle}
            />
            <span className={isWholesale ? "text-primary font-semibold" : "text-muted-foreground"}>
              Wholesale
            </span>
          </div>
          
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
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">{username}</span>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                Logout
              </Button>
            </div>
          ) : (
            <Link to="/auth">
              <Button variant="ghost" size="icon">
                <User className="h-5 w-5" />
              </Button>
            </Link>
          )}
          
          {/* Cart */}
          <Link to="/cart">
            <Button variant="ghost" size="icon" className="relative">
              <ShoppingCart className="h-5 w-5" />
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-semibold">
                  {cartItemCount}
                </span>
              )}
            </Button>
          </Link>

          {/* Mobile Menu */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
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
                <div className="pt-4 border-t border-border">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="wholesale-mode-mobile" className="text-sm font-medium flex items-center gap-2">
                      <Package className="h-4 w-4 text-primary" />
                      Wholesale Mode
                    </Label>
                    <Switch 
                      id="wholesale-mode-mobile" 
                      checked={isWholesale}
                      onCheckedChange={onWholesaleToggle}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    {isWholesale ? "Bulk pricing active" : "Retail pricing active"}
                  </p>
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default Header;
