// app/(landing-page)/products/order-management/page.tsx
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, TabletSmartphone, Printer, BellRing } from "lucide-react";
import { cn } from "@/lib/utils";

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

export default function OrderManagementPage() {
  return (
    <>
      {/* Product Hero */}
      <section className="bg-gray-50 py-20 md:py-28">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
                Restaurant Order Management, Simplified.
              </h1>
              <p className="mt-6 text-lg leading-8 text-gray-600">
                Consolidate all your online and offline orders into one easy-to-use
                tablet. Eliminate tablet chaos and never miss an order again.
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
              All Your Orders in One Place
            </h2>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
              BistroKit integrates seamlessly with the platforms you already use.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <TabletSmartphone className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Unified Dashboard</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  View and manage orders from DoorDash, Uber Eats, Grubhub,
                  your website, and phone-ins all on a single screen.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <Printer className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Automated Printing</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Automatically print order tickets to your kitchen printers
                  (compatible printers required) as soon as they're accepted.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <BellRing className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Real-Time Alerts</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Get instant audio and visual notifications for new orders so
                  your team can react quickly.
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
                Reduce Errors & Speed Up Service
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                Manual order entry is slow and prone to mistakes. BistroKit
                automates the process, ensuring accuracy and getting orders to
                your kitchen faster.
              </p>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-primary mr-3 mt-1 flex-shrink-0" />
                  <span>Eliminate manual re-typing of orders.</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-primary mr-3 mt-1 flex-shrink-0" />
                  <span>Standardized ticket format for kitchen clarity.</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-primary mr-3 mt-1 flex-shrink-0" />
                  <span>Faster order processing means quicker turnaround times.</span>
                </li>
              </ul>
            </div>
            <div className="mt-10 md:mt-0">
              <ImagePlaceholder />
            </div>
          </div>
        </div>
      </section>

      {/* Add more sections as needed: Testimonials, Integration logos, etc. */}

      {/* Final CTA for this product */}
      <section className="bg-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Ready to Ditch the Tablet Farm?
          </h2>
          <p className="mt-4 text-lg leading-8 text-gray-600">
            Start managing your orders efficiently with BistroKit.
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
