// app/(landing-page)/products/delivery/page.tsx
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Truck, MapPin, UserCheck } from "lucide-react";
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

export default function DeliveryPage() {
  return (
    <>
      {/* Product Hero */}
      <section className="bg-gray-50 py-20 md:py-28">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
                Flexible Delivery Solutions for Your Restaurant
              </h1>
              <p className="mt-6 text-lg leading-8 text-gray-600">
                Integrate with third-party delivery fleets like DoorDash Drive
                or manage your own in-house drivers, all from the BistroKit
                platform.
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
              Deliver Orders Your Way
            </h2>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
              Choose the delivery model that works best for your business and
              customers.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <Truck className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Third-Party Integration</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Seamlessly dispatch orders to DoorDash Drive and other
                  on-demand fleets directly from BistroKit. (More integrations
                  coming soon!)
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <UserCheck className="h-8 w-8 text-primary mb-2" />
                <CardTitle>In-House Driver Management</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Assign orders to your own delivery team, track their
                  progress, and manage zones. (Feature coming soon)
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <MapPin className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Real-Time Tracking</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Provide customers with live tracking links (via integrated
                  partners) for a transparent delivery experience.
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
                Keep Customers Happy & Informed
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                Reduce "Where's my order?" calls. Automated status updates and
                tracking links build trust and improve the customer experience.
              </p>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-primary mr-3 mt-1 flex-shrink-0" />
                  <span>Automated SMS/email notifications (optional).</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-primary mr-3 mt-1 flex-shrink-0" />
                  <span>Live map tracking via delivery partners.</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-primary mr-3 mt-1 flex-shrink-0" />
                  <span>Accurate estimated delivery times.</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-primary mr-3 mt-1 flex-shrink-0" />
                  <span>Reduced support overhead for your team.</span>
                </li>
              </ul>
            </div>
            <div className="mt-10 md:mt-0">
              <ImagePlaceholder />
            </div>
          </div>
        </div>
      </section>

      {/* Add more sections: Cost savings, Delivery zone setup */}

      {/* Final CTA for this product */}
      <section className="bg-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Streamline Your Delivery Operations
          </h2>
          <p className="mt-4 text-lg leading-8 text-gray-600">
            Offer reliable delivery without the hassle using BistroKit.
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
