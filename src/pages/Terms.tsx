import Header from "@/components/Header";
import { Card } from "@/components/ui/card";

const Terms = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header cartItemCount={0} />
      
      <main className="container py-8 max-w-4xl">
        <h1 className="text-4xl font-bold text-foreground mb-8">Terms and Conditions</h1>
        
        <Card className="p-6 space-y-6">
          <section>
            <h2 className="text-2xl font-semibold mb-3">1. Agreement to Terms</h2>
            <p className="text-muted-foreground">
              By accessing and using FreshMart, you accept and agree to be bound by the terms 
              and provision of this agreement.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">2. Use License</h2>
            <p className="text-muted-foreground">
              Permission is granted to temporarily access the materials on FreshMart for personal, 
              non-commercial transitory viewing only.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">3. Account Terms</h2>
            <p className="text-muted-foreground">
              You are responsible for maintaining the security of your account and password. 
              FreshMart cannot and will not be liable for any loss or damage from your failure 
              to comply with this security obligation.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">4. Products and Pricing</h2>
            <p className="text-muted-foreground">
              All products and prices are subject to change without notice. We reserve the right 
              to limit quantities and refuse service to anyone.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">5. Payment Terms</h2>
            <p className="text-muted-foreground">
              Payment is due at the time of purchase. We accept various payment methods as indicated 
              during checkout.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">6. Shipping and Delivery</h2>
            <p className="text-muted-foreground">
              We aim to process and ship orders within 1-2 business days. Delivery times may vary 
              based on location.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">7. Returns and Refunds</h2>
            <p className="text-muted-foreground">
              Items may be returned within 7 days of delivery in original condition. 
              Perishable items are non-refundable.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">8. Contact Information</h2>
            <p className="text-muted-foreground">
              For questions about these Terms, contact us at support@freshmart.com
            </p>
          </section>
        </Card>
      </main>
    </div>
  );
};

export default Terms;
