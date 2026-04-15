import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { User, Phone, Package, Shield, LogOut, Loader2 } from "lucide-react";
import { useCartCount } from "@/hooks/useCartCount";
import { useWholesaleStatus } from "@/hooks/useWholesaleStatus";
import WholesaleApplicationForm from "@/components/WholesaleApplicationForm";
import { z } from "zod";

const profileSchema = z.object({
  username: z.string().trim().min(3, "Username must be at least 3 characters").max(50),
  phone_number: z.string().trim().min(10, "Phone number must be at least 10 digits").max(20),
});

const Profile = () => {
  const navigate = useNavigate();
  const { count: cartCount } = useCartCount();
  const { isWholesale } = useWholesaleStatus();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [username, setUsername] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const [email, setEmail] = useState("");

  useEffect(() => {
    const load = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        navigate("/auth");
        return;
      }
      setUserId(session.user.id);
      setEmail(session.user.email || "");

      const { data } = await supabase
        .from("profiles")
        .select("username, phone_number")
        .eq("user_id", session.user.id)
        .single();

      if (data) {
        setUsername(data.username);
        setPhoneNumber(data.phone_number);
      }
      setLoading(false);
    };
    load();
  }, [navigate]);

  const handleSave = async () => {
    try {
      const validated = profileSchema.parse({ username, phone_number: phoneNumber });
      setSaving(true);
      const { error } = await supabase
        .from("profiles")
        .update({ username: validated.username, phone_number: validated.phone_number })
        .eq("user_id", userId!);
      if (error) throw error;
      toast.success("Profile updated!");
    } catch (err: any) {
      if (err instanceof z.ZodError) {
        toast.error(err.errors[0].message);
      } else {
        toast.error(err.message || "Failed to update profile");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20 lg:pb-0">
      <Header cartItemCount={cartCount} isWholesale={isWholesale} />

      <div className="container px-4 sm:px-6 py-6 max-w-2xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold text-foreground">My Profile</h1>

        {/* Profile Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <User className="h-5 w-5 text-primary" />
              Account Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" value={email} disabled className="bg-muted" />
              <p className="text-[11px] text-muted-foreground">Email cannot be changed</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Your username"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="Your phone number"
              />
            </div>
            <Button onClick={handleSave} disabled={saving} className="w-full sm:w-auto">
              {saving ? <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Saving...</> : "Save Changes"}
            </Button>
          </CardContent>
        </Card>

        {/* Wholesale Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Package className="h-5 w-5 text-primary" />
              Wholesale Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isWholesale ? (
              <div className="flex items-center gap-3 p-4 rounded-lg bg-primary/10 border border-primary/20">
                <Shield className="h-6 w-6 text-primary" />
                <div>
                  <p className="font-semibold text-primary">Wholesale Account Active</p>
                  <p className="text-xs text-muted-foreground">You have access to bulk pricing on eligible products</p>
                </div>
                <Badge className="ml-auto">Active</Badge>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  You don't have wholesale access yet. Apply below to get bulk pricing on eligible products.
                </p>
                <WholesaleApplicationForm />
              </div>
            )}
          </CardContent>
        </Card>

        <Separator />

        {/* Logout */}
        <Button variant="outline" onClick={handleLogout} className="w-full flex items-center gap-2 text-destructive hover:text-destructive">
          <LogOut className="h-4 w-4" />
          Sign Out
        </Button>
      </div>

      <Footer />
    </div>
  );
};

export default Profile;
