import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Package, Clock, CheckCircle2, XCircle } from "lucide-react";

const businessTypes = [
  "Restaurant / Hotel",
  "Retail Shop",
  "Distributor",
  "School / Institution",
  "Other",
];

const WholesaleApplicationForm = () => {
  const queryClient = useQueryClient();
  const [businessName, setBusinessName] = useState("");
  const [businessType, setBusinessType] = useState("");
  const [reason, setReason] = useState("");

  const { data: existingApplication, isLoading } = useQuery({
    queryKey: ["wholesale-application"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      const { data, error } = await supabase
        .from("wholesale_applications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const submitApplication = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not logged in");
      const { error } = await supabase.from("wholesale_applications").insert({
        user_id: user.id,
        business_name: businessName.trim(),
        business_type: businessType,
        reason: reason.trim(),
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wholesale-application"] });
      toast.success("Application submitted! We'll review it shortly.");
      setBusinessName("");
      setBusinessType("");
      setReason("");
    },
    onError: () => {
      toast.error("Failed to submit application. Please try again.");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessName.trim() || !businessType) {
      toast.error("Please fill in all required fields");
      return;
    }
    submitApplication.mutate();
  };

  if (isLoading) return null;

  // Show status if application exists
  if (existingApplication) {
    const statusConfig = {
      pending: { icon: Clock, color: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20", label: "Pending Review", description: "Your application is being reviewed by our team." },
      approved: { icon: CheckCircle2, color: "bg-green-500/10 text-green-600 border-green-500/20", label: "Approved", description: "Your wholesale access has been activated!" },
      rejected: { icon: XCircle, color: "bg-destructive/10 text-destructive border-destructive/20", label: "Rejected", description: existingApplication.admin_notes || "Your application was not approved at this time." },
    }[existingApplication.status] || { icon: Clock, color: "bg-muted", label: existingApplication.status, description: "" };

    const StatusIcon = statusConfig.icon;

    return (
      <Card className="border-primary/10">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Wholesale Application</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className={`flex items-start gap-3 p-4 rounded-lg border ${statusConfig.color}`}>
            <StatusIcon className="h-5 w-5 mt-0.5 shrink-0" />
            <div>
              <p className="font-semibold text-sm">{statusConfig.label}</p>
              <p className="text-xs mt-1 opacity-80">{statusConfig.description}</p>
              <p className="text-xs mt-2 opacity-60">
                Business: {existingApplication.business_name} • Applied: {new Date(existingApplication.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
          {existingApplication.status === "rejected" && (
            <Button
              variant="outline"
              size="sm"
              className="mt-3 w-full"
              onClick={() => queryClient.setQueryData(["wholesale-application"], null)}
            >
              Submit New Application
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-primary/10">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Package className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg">Apply for Wholesale Access</CardTitle>
        </div>
        <CardDescription className="text-xs">
          Get bulk pricing on all products. Applications are reviewed within 24 hours.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="businessName" className="text-sm">Business Name *</Label>
            <Input
              id="businessName"
              placeholder="Your business name"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              maxLength={100}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="businessType" className="text-sm">Business Type *</Label>
            <Select value={businessType} onValueChange={setBusinessType} required>
              <SelectTrigger>
                <SelectValue placeholder="Select business type" />
              </SelectTrigger>
              <SelectContent>
                {businessTypes.map((type) => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="reason" className="text-sm">Why do you need wholesale access?</Label>
            <Textarea
              id="reason"
              placeholder="Tell us about your business needs..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              maxLength={500}
              rows={3}
            />
          </div>
          <Button type="submit" className="w-full" disabled={submitApplication.isPending}>
            {submitApplication.isPending ? "Submitting..." : "Submit Application"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default WholesaleApplicationForm;
