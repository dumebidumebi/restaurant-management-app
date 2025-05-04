import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import Header from "@/components/Header";
import Script from "next/script";
import HeaderWeb from "@/components/Header";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Toaster } from "@/components/ui/toaster";
import { useCartStore } from "@/stores/cartStore";
import { useEffect } from "react";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Online Ordering App",
  description: "Online ordering dashboard",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* <Header/> */}
      <ClerkProvider>
        <html lang="en">
          <head>
            <Script src="http://localhost:3000"></Script>
          </head>
          <body className={inter.className}>
            {/* <HeaderWeb /> */}
            <Navbar />
            <main className="w-full">{children}</main>
            <Footer />
          </body>
        </html>
      </ClerkProvider>
    </>
  );
}
