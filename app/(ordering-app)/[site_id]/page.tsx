"use client";
import Image from "next/image";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { SignInButton, SignOutButton } from "@clerk/nextjs";
import { BANNER, MENU } from "@/constants";
import banner from "@/images/banner-img_enhanced.png";
import { ChevronRight, TextQuote } from "lucide-react";
import { useRouter } from "next/router";
import MenuPage from "./menu/page";

export default function Home() {
  const allItems = Object.values(MENU.categories).flat();

  return (
    <>
      {/* value proposition section */}

      <div>
        <div className="relative isolate">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 -top-40 -z-10 transorfm-gpu overflow-hidden blur-3xl sm:-top-80"
          >
            <div
              style={{
                clipPath:
                  "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
              }}
              className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%-30rem)] smw-[72.1875rem]"
            ></div>
          </div>
          <div>
            <div className=" max-w-4xl">
              <div className="flow-root">
                <div className="relative -m-2 rounded-xl bg-gray-900//5 p-2  ring-gray-900/10 lg:-m-4 lg:rounded-2xl lg:p-4">
                  <div className="relative w-screen h-[80vh]  overflow-hidden">
                    <Image
                      src={banner}
                      alt="banner"
                      fill
                      quality={100}
                      className="object-cover filter saturate-[1.4] brightness-75"
                    />
                    <div className="absolute bottom-8 left-8">
                      <div className="flex flex-row">
                        <TextQuote className="mb-8 mr-5 text-white" />
                        <span className="text-white">
                          Best Rotisserie Chicken in town{" "}
                        </span>
                      </div>
                      <h1 className="text-white mb-8 font-medium text-3xl sm:text-5xl">
                        Delicious Peruvian Chicken
                      </h1>

                      <Link href={"/menu"}>
                        <Button
                          size={"lg"}
                          color=""
                          className="font-semibold py-2 px-4 rounded-md shadow-md"
                        >
                          Order Online <ChevronRight />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 -top-40 -z-10 transorfm-gpu overflow-hidden blur-3xl sm:-top-80"
          >
            <div
              style={{
                clipPath:
                  "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
              }}
              className="relative left-[calc(50%-13rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%-36rem)] smw-[72.1875rem]"
            ></div>
          </div>
        </div>
      </div>
      {/* feature section */}
      <div className="mb-32 mt-32 w-full sm:mt-32">
        <div className="mb-12 px-6 lg:px-8">
          <div className=" max-w-2xl ">
            <h2 className="mt-2 font-bold text-4xl text-gray-900 sm:text-5xl">
              Just Chik'n
            </h2>
            <p className="mt-4 text-xl text-gray-600">Our Menu</p>
          </div>
        </div>
        {/* steps */}
        {/* <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
          {allItems.map((item) => (
            <div
              key={item.id}
              className="flex flex-col items-center bg-white border border-gray-200 rounded-md  overflow-hidden"
            >
              <div className="relative w-56 h-48">
                <Image
                  src={item.imageUrl}
                  alt={item.name}
                  fill
                  className="rounded-t-md p-4 w-48 object-cover"
                />
              </div>
              <h3 className="text-lg font-medium text-center p-4">
                {item.name}
              </h3>
            </div>
          ))}
        </div> */}
        <MenuPage />
        {/* <div className="mx-auto max-w-6xl px-6 lg:px-8">
          <div className="mt-16 flow-root sm:mt-24">
            <div className="-m-2 rounded-xl bg-gray-900//5 p-2 ring-1 ring-inset ring-gray-900/10 lg:-m-4 lg:rounded-2xl lg:p-4"></div>
          </div>
        </div> */}
      </div>
    </>
  );
}
