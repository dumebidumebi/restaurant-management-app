"use client";
import Image from "next/image";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { SignInButton, SignOutButton } from "@clerk/nextjs";
import { ChevronRight, TextQuote } from "lucide-react";
import { useEffect, useState } from "react";
import Error from "next/error";
import banner from "@/images/banner-img.png"; // Example image, replace with your own
import menuScreen from "@/images/menuScreen.png";
import orderScreen from "@/images/orderScreen.png";
import orderScreen2 from "@/images/orderScreen3.png";
import orderingScreen from "@/images/orderingScreen.png";

export default function Home() {
  return (
    <>
      {/* Hero Section */}
      <section className="bg-white py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
                Take Control of Your Restaurant's Online Ordering with BistroKit
              </h1>
              <p className="text-lg text-gray-700 mb-8">
                Simplify online order management and grow your restaurant's
                revenue. BistroKit provides a seamless experience for you and
                your customers.
              </p>
              <div className="space-x-4">
                <Button size="lg">Get Started Free</Button>
                <Button variant="outline" size="lg">
                  Learn More
                </Button>
              </div>
            </div>
            <div>
              <Image
                src={menuScreen} // Replace with your actual banner image
                alt="BistroKit Interface"
                className="rounded-lg shadow-md"
                width={900}
                height={700}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Section 1: Streamline Your Operations */}
      <section className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <Image
                src={orderScreen} // Replace with your screenshot image 1
                alt="Screenshot of BistroKit Interface"
                className="rounded-lg shadow-md"
                width={800}
                height={700}
              />
            </div>
            <div>
              <h2 className="text-3xl font-semibold text-gray-900 mb-4">
                Streamline Your Online Ordering
              </h2>
              <p className="text-gray-700 text-lg mb-6">
                BistroKit centralizes all your online orders into one simple
                system. No more juggling multiple tablets or missed orders.
                Integrate with popular platforms and manage everything in one
                place.
              </p>
              <ul className="list-disc list-inside text-gray-700">
                <li>
                  Consolidate orders from all your online channels (e.g.,
                  DoorDash, Uber Eats).
                </li>
                <li>Automate order acceptance and routing to your kitchen.</li>
                <li>Reduce errors and improve order accuracy.</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: Boost Efficiency */}
      <section className="bg-white py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-3xl font-semibold text-gray-900 mb-4">
                Boost Kitchen Efficiency & Reduce Errors
              </h2>
              <p className="text-gray-700 text-lg mb-6">
                Automate your ordering process from start to finish. BistroKit's
                smart routing system sends orders directly to the kitchen,
                optimizing workflow and minimizing delays.
              </p>
              <ul className="list-disc list-inside text-gray-700">
                <li>
                  Automated order printing or display on kitchen screens (KDS).
                </li>
                <li>
                  Real-time order status updates for kitchen staff and
                  customers.
                </li>
                <li>
                  Intelligent routing based on item preparation time and station
                  load.
                </li>
              </ul>
            </div>
            <div>
              <Image
                src={orderScreen2} // Replace with your screenshot image 2
                alt="Screenshot of BistroKit Kitchen Display"
                className="rounded-lg shadow-md"
                width={900}
                height={700}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: Delight Your Customers */}
      <section className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <Image
                src={orderingScreen} // Replace with your screenshot image 3
                alt="Screenshot of Customer Order Tracking"
                className="rounded-lg shadow-md"
                width={900}
                height={700}
              />
            </div>
            <div>
              <h2 className="text-3xl font-semibold text-gray-900 mb-4">
                Delight Your Customers with Real-Time Tracking
              </h2>
              <p className="text-gray-700 text-lg mb-6">
                Keep your customers informed every step of the way. With
                BistroKit, customers can track their order status in real-time,
                reducing anxiety and building trust.
              </p>
              <ul className="list-disc list-inside text-gray-700">
                <li>
                  Branded order tracking pages for a consistent customer
                  experience.
                </li>
                <li>SMS and email notifications for order updates.</li>
                <li>
                  Estimated delivery times and driver tracking (if applicable).
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-8">
            Ready to Transform Your Restaurant's Online Ordering?
          </h2>
          <p className="text-lg text-gray-700 mb-8">
            Start your free trial today and experience the power of BistroKit.
          </p>
          <Button size="lg">Get Started Free</Button>
        </div>
      </section>
    </>
  );
}
