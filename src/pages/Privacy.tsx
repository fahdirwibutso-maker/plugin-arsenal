import Header from "@/components/Header";
import { Card } from "@/components/ui/card";

const Privacy = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header cartItemCount={0} />
      
      <main className="container py-8 max-w-4xl">
        <h1 className="text-4xl font-bold text-foreground mb-8">Privacy Policy</h1>
        
        <Card className="p-6 space-y-6">
          <section>
            <h2 className="text-2xl font-semibold mb-3">1. Information We Collect</h2>
            <p className="text-muted-foreground">
              We collect information you provide directly to us, including your username, phone number, 
              and other information when you create an account, make a purchase, or communicate with us.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">2. How We Use Your Information</h2>
            <p className="text-muted-foreground">
              We use the information we collect to process your orders, communicate with you, 
              improve our services, and comply with legal obligations.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">3. Information Sharing</h2>
            <p className="text-muted-foreground">
              We do not sell your personal information. We may share your information with service 
              providers who assist us in operating our website and conducting our business.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">4. Data Security</h2>
            <p className="text-muted-foreground">
              We implement appropriate security measures to protect your personal information from 
              unauthorized access, alteration, disclosure, or destruction.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">5. Your Rights</h2>
            <p className="text-muted-foreground">
              You have the right to access, correct, or delete your personal information. 
              Contact us if you wish to exercise these rights.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">6. Contact Us</h2>
            <p className="text-muted-foreground">
              If you have any questions about this Privacy Policy, please contact us at privacy@freshmart.com
            </p>
          </section>
        </Card>
      </main>
    </div>
  );
};

export default Privacy;
