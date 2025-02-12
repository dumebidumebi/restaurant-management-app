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
            <SidebarProvider>
              <AppSidebar />
              <SidebarTrigger />

              <main className="w-full">
                <Toaster />
                {children}
              </main>
            </SidebarProvider>
          </body>
        </html>
      </ClerkProvider>
    </>
  );
}
