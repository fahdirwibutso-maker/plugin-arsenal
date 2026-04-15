import { Link } from "react-router-dom";
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin } from "lucide-react";
import { Separator } from "@/components/ui/separator";

const Footer = () => {
  return (
    <footer className="bg-card border-t border-border pt-10 pb-24 lg:pb-10">
      <div className="container px-4 sm:px-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-2 sm:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-3">
              <div className="h-7 w-7 rounded-full bg-gradient-to-br from-primary to-accent" />
              <span className="text-lg font-bold text-foreground">Wellar<span className="text-primary">Shop</span></span>
            </Link>
            <p className="text-xs text-muted-foreground leading-relaxed mb-4">
              Your trusted supermarket for wholesale and retail. Fresh produce, quality groceries, and beverages at the best prices.
            </p>
            <div className="flex gap-3">
              {[Facebook, Instagram, Twitter].map((Icon, i) => (
                <a key={i} href="#" className="p-2 rounded-lg bg-muted hover:bg-primary/10 hover:text-primary transition-colors">
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-3">Quick Links</h4>
            <ul className="space-y-2">
              {[{ name: "Home", path: "/" }, { name: "Shop", path: "/shop" }, { name: "Cart", path: "/cart" }, { name: "My Orders", path: "/orders" }].map(l => (
                <li key={l.path}><Link to={l.path} className="text-xs text-muted-foreground hover:text-primary transition-colors">{l.name}</Link></li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-3">Support</h4>
            <ul className="space-y-2">
              {[{ name: "Privacy Policy", path: "/privacy" }, { name: "Terms of Service", path: "/terms" }, { name: "Sign In", path: "/auth" }].map(l => (
                <li key={l.path}><Link to={l.path} className="text-xs text-muted-foreground hover:text-primary transition-colors">{l.name}</Link></li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-3">Contact Us</h4>
            <ul className="space-y-2.5">
              <li className="flex items-start gap-2 text-xs text-muted-foreground"><MapPin className="h-3.5 w-3.5 mt-0.5 shrink-0 text-primary" />123 Market Street, City Center</li>
              <li className="flex items-center gap-2 text-xs text-muted-foreground"><Phone className="h-3.5 w-3.5 shrink-0 text-primary" />+1 234 567 890</li>
              <li className="flex items-center gap-2 text-xs text-muted-foreground"><Mail className="h-3.5 w-3.5 shrink-0 text-primary" />hello@wellarshop.com</li>
            </ul>
          </div>
        </div>

        <Separator className="my-6" />
        <p className="text-center text-[11px] text-muted-foreground">© {new Date().getFullYear()} WellarShop. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
