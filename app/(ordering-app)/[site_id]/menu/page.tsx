"use client";
import React, { useEffect, useState } from "react";
import { ChevronRight } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useParams } from "next/navigation";

export async function getSiteMenu(storeId: string) {
  const response = await fetch("/api/get-store-menu", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ storeId: storeId }),
  });

  if (!response.ok) {
    throw new Error("Failed to fetch items");
  }

  return response.json();
}

export default function MenuPage() {
  const params = useParams();
  const [siteMenu, setSiteMenu] = useState<any>(null); // Replace 'any' with the correct type if needed
  const siteId = params.site_id;

  useEffect(() => {
    async function loadMenu() {
      try {
        if (typeof siteId !== "string") return;
        const menu = await getSiteMenu(siteId);
        console.log("Menus fetched successfully", menu);
        setSiteMenu(menu[0]); // Assuming the API returns an array and you want the first menu
      } catch (error: any) {
        console.error("Error loading menu:", error);
      }
    }

    loadMenu();
  }, [siteId]);

  // If the menu is not yet loaded, show a loading state
  if (!siteMenu) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex flex-col lg:flex-row min-h-screen">
      {/* Sidebar */}
      <div className="border w-full lg:w-52 p-4 sticky top-12 bg-white z-10 text-left">
        <h1 className="text-2xl lg:text-center lg:sticky lg:top-32 font-bold mb-6">
          Categories
        </h1>
        <div className="lg:space-y-4 h-14 flex lg:sticky lg:top-48 lg:flex-col  flex-row items-center text-left flex-shrink-0 lg:items-start scroll-auto">
          {siteMenu.categories.map((category: any) => (
            <Button
              key={category.id}
              variant={"ghost"}
              onClick={() => {
                const element = document.getElementById(`${category.name}`);
                element?.scrollIntoView({
                  behavior: "smooth",
                  block: "center",
                });
              }}
              className="cursor-pointer hover:bg-yellow-400 text-md font-normal lg:w-full flex-auto items-center text-left lg:text-left"
            >
              {category.name}
            </Button>
          ))}
        </div>
      </div>

      {/* Menu Sections */}
      <main className="flex-1 p-4">
        {siteMenu.categories.map((category: any) => (
          <section key={category.id} className="mb-12">
            <h3
              id={`${category.name}`}
              className="text-2xl font-bold text-gray-800 mb-6"
            >
              {category.name}
            </h3>
            <div className="grid gap-8 lg:grid-cols-2">
              {category.items.map((item: any) => (
                <Dialog key={item.id}>
                  <DialogTrigger>
                    <div
                      key={item.id}
                      className="border rounded-lg  shadow hover:shadow-lg p-4 transition flex  h-40 flex-row"
                    >
                      <Image
                        src={item.imageUrl}
                        alt={item.name}
                        width={150}
                        height={150}
                        className=" rounded-t-lg object-contain"
                      />

                      <div className="ml-4 text-left">
                        <h4 className="text-md font-bold text-gray-900 overflow-clip">
                          {item.name}
                        </h4>
                        <p
                          className="text-gray-600 text-sm mt-2 h-10 overflow-hidden text-wrap truncate"
                          style={{
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                          }}
                        >
                          {item.description}
                        </p>
                        <p className="mt-2">${item.price.toFixed(2)}</p>
                      </div>
                    </div>
                  </DialogTrigger>
                  <DialogContent className="w-5/6 h-5/6 flex flex-col justify-between rounded-md">
                    <DialogHeader>
                      <div className="flex flex-row items-start">
                        <Image
                          src={item.imageUrl}
                          alt={item.name}
                          width={158}
                          height={158}
                          className="object-cover rounded-t-lg"
                        />
                      </div>
                      <DialogTitle className="text-left">
                        {item.name}
                      </DialogTitle>
                      <DialogDescription className="text-left">
                        {item.description}
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="mb-0 bottom-0 flex flex-row">
                      <Select>
                        <SelectTrigger className="w-32 outline-none">
                          <SelectValue placeholder="1" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectLabel>Quantity</SelectLabel>
                            <SelectItem value="1">1</SelectItem>
                            <SelectItem value="2">2</SelectItem>
                            <SelectItem value="3">3</SelectItem>
                            <SelectItem value="4">4</SelectItem>
                            <SelectItem value="5">5</SelectItem>
                          </SelectGroup>
                        </SelectContent>
                      </Select>

                      <Button
                        variant={"default"}
                        className="w-full justify-between"
                      >
                        <p>Add Item</p>
                        <div className="w-fit flex flex-row justify-center">
                          <span>${item.price}</span>
                          <ChevronRight className="mt-0.5" />
                        </div>
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              ))}
            </div>
          </section>
        ))}
      </main>
    </div>
  );
}
