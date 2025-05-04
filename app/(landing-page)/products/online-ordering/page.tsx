// app/(landing-page)/products/online-ordering/page.tsx
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Percent, Smartphone, CreditCard } from "lucide-react";
import { cn } from "@/lib/utils"; // Make sure to import cn

// Placeholder for Image
const ImagePlaceholder = ({ className = "" }: { className?: string }) => (
  <div
    className={cn(
      "bg-gray-200 aspect-video rounded-lg shadow-md flex items-center justify-center text-gray-500",
      className,
    )}
  >
    Product Feature Image
  </div>
);

export default function OnlineOrderingPage() {
  return (
    <>
      {/* Product Hero */}
      <section className="bg-gray-50 py-20 md:py-28">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
                Your Own Commission-Free Online Ordering System
              </h1>
              <p className="mt-6 text-lg leading-8 text-gray-600">
                Stop paying high commissions to third-party apps. Launch your
                branded online ordering website with BistroKit and keep more of
                your revenue.
              </p>
              <div className="mt-10 flex items-center gap-x-6">
                <Button size="lg" asChild>
                  <Link href="/store/menu">Get Started Free</Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="/pricing">View Pricing</Link>
                </Button>
              </div>
            </div>
            <div className="mt-10 md:mt-0">
              <ImagePlaceholder className="aspect-[4/3]" />
            </div>
          </div>
        </div>
      </section>

      {/* Key Features */}
      <section className="py-16 lg:py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-semibold tracking-tight text-gray-900 sm:text-4xl">
              Take Control of Your Online Presence
            </h2>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
              Build direct relationships with your customers and own your brand.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <Percent className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Zero Commissions</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Keep 100% of the revenue from orders placed directly through
                  your BistroKit site. More profit in your pocket.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <Smartphone className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Mobile-Optimized</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Your customers get a seamless ordering experience on any
                  device – desktop, tablet, or smartphone.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CreditCard className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Secure Payments</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Accept online payments securely through our integrated payment
                  processor (Stripe integration).
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How it Works / Benefits */}
      <section className="py-16 lg:py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-semibold tracking-tight text-gray-900 sm:text-4xl mb-4">
                Easy Menu Management & Customization
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                Update your menu, add photos, manage modifiers, and customize
                your site's look and feel with just a few clicks.
              </p>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-primary mr-3 mt-1 flex-shrink-0" />
                  <span>Intuitive interface for menu updates.</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-primary mr-3 mt-1 flex-shrink-0" />
                  <span>Support for complex modifiers and options.</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-primary mr-3 mt-1 flex-shrink-0" />
                  <span>Add your logo and brand colors.</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-primary mr-3 mt-1 flex-shrink-0" />
                  <span>Temporarily disable items or entire categories.</span>
                </li>
              </ul>
            </div>
            <div className="mt-10 md:mt-0">
              <ImagePlaceholder />
            </div>
          </div>
        </div>
      </section>

      {/* Add more sections: Customer data ownership, Marketing tools (future) */}

      {/* Final CTA for this product */}
      <section className="bg-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Start Taking Commission-Free Orders Today
          </h2>
          <p className="mt-4 text-lg leading-8 text-gray-600">
            Launch your own online ordering platform with BistroKit.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Button size="lg" asChild>
              <Link href="/store/menu">Get Started Free</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
