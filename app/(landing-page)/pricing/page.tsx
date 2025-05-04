// app/(landing-page)/pricing/page.tsx
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Check } from "lucide-react";

const PricingTier = ({
  title,
  price,
  description,
  features,
  popular = false,
  ctaText = "Get Started",
  ctaLink = "/store/menu",
}: {
  title: string;
  price: string;
  description: string;
  features: string[];
  popular?: boolean;
  ctaText?: string;
  ctaLink?: string;
}) => (
  <Card className={popular ? "border-primary border-2 relative" : ""}>
    {popular && (
      <div className="absolute -top-3 right-4 bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full">
        Most Popular
      </div>
    )}
    <CardHeader>
      <CardTitle>{title}</CardTitle>
      <CardDescription>{description}</CardDescription>
      <div className="pt-4">
        <span className="text-4xl font-bold">${price}</span>
        <span className="text-muted-foreground">/mo</span>
      </div>
    </CardHeader>
    <CardContent>
      <ul className="space-y-3">
        {features.map((feature, index) => (
          <li key={index} className="flex items-center">
            <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
            <span className="text-sm text-muted-foreground">{feature}</span>
          </li>
        ))}
      </ul>
    </CardContent>
    <CardFooter>
      <Button className="w-full" asChild variant={popular ? "default" : "outline"}>
        <Link href={ctaLink}>{ctaText}</Link>
      </Button>
    </CardFooter>
  </Card>
);

export default function PricingPage() {
  return (
    <>
      {/* Pricing Hero */}
      <section className="bg-white py-20 md:py-28 text-center">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
            Simple Pricing for Every Restaurant
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-600 max-w-2xl mx-auto">
            Choose the plan that fits your needs. No hidden fees, cancel anytime.
          </p>
        </div>
      </section>

      {/* Pricing Tiers */}
      <section className="py-16 lg:pb-24 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <PricingTier
              title="Lite"
              price="49"
              description="Essential tools to get started with online ordering."
              features={[
                "Order Management Dashboard",
                "Basic Online Ordering Page",
                "Menu Management",
                "Email Support",
              ]}
            />
            <PricingTier
              title="Standard"
              price="99"
              description="Grow your business with more integrations and features."
              features={[
                "Everything in Lite, plus:",
                "DoorDash/Uber Eats Integration",
                "Customer Database",
                "Basic Analytics",
                "Priority Support",
              ]}
              popular={true}
            />
            <PricingTier
              title="Pro"
              price="149"
              description="Advanced features for high-volume restaurants."
              features={[
                "Everything in Standard, plus:",
                "Advanced Reporting",
                "Marketing Tools (Coming Soon)",
                "API Access (Coming Soon)",
                "Dedicated Account Manager",
              ]}
              ctaText="Contact Sales"
              ctaLink="/contact" // Example link
            />
          </div>
        </div>
      </section>

      {/* Add FAQ Section if needed */}
      {/* Add Enterprise CTA if needed */}
    </>
  );
}
