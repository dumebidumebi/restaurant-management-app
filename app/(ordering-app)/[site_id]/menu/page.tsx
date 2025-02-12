"use client";
import React from "react";
import { BANNER, MENU } from "@/constants";
import { ChevronRight, Ghost, Link } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useRef } from "react";
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

export default function MenuPage() {
  const menu = MENU;
  return (
    <div className="flex flex-col lg:flex-row min-h-screen">
      {/* Sidebar */}
      <div className="border w-full lg:w-52 p-4 sticky  top-12 bg-white z-10">
        <h1 className="text-2xl lg:text-center lg:sticky lg:top-32 font-bold mb-6">
          Categories
        </h1>
        <div className="lg:space-y-4 h-14 flex lg:sticky lg:top-48 lg:flex-col flex-row items-center flex-shrink-0 lg:items-start scroll-auto">
          {Object.keys(menu.categories).map((category) => (
            <Button
              variant={"ghost"}
              onClick={() => {
                const element = document.getElementById(`${category}`);
                element?.scrollIntoView({
                  behavior: "smooth",
                  block: "center",
                  // inline: "center",
                });
              }}
              className="cursor-pointer hover:bg-yellow-400 text-md lg:w-full flex-auto items-center lg:text-left"
            >
              {category}
            </Button>
          ))}
        </div>
      </div>

      {/* Menu Sections */}
      <main className="flex-1 p-4">
        {Object.entries(menu.categories).map(([category, items]) => (
          <section key={category} className="mb-12">
            <h3
              id={`${category}`}
              className="text-2xl font-bold text-gray-800 mb-6"
            >
              {category}
            </h3>
            <div className="grid gap-8 lg:grid-cols-2 ">
              {items.map((item) => (
                <Dialog>
                  <DialogTrigger className="">
                    <div
                      key={item.id}
                      className="border rounded-lg shadow hover:shadow-lg p-4 transition flex lg:h-52 h-40 flex-row"
                    >
                      <Image
                        src={item.imageUrl}
                        alt={item.name}
                        width={158}
                        height={158}
                        className=" object-cover rounded-t-lg"
                      />

                      <div className="ml-4 text-left">
                        <h4 className="text-md font-bold text-gray-900 overflow-clip">
                          {item.name}
                        </h4>
                        <p
                          className="text-gray-600 text-sm mt-2 h-10 overflow-hidden text-wrap truncate"
                          style={{
                            display: "-webkit-box",
                            WebkitLineClamp: 2, // Number of lines to display
                            WebkitBoxOrient: "vertical",
                          }}
                        >
                          {item.description}
                        </p>
                        <p className=" mt-2">${item.price.toFixed(2)}</p>
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
                          className=" object-cover rounded-t-lg "
                        />
                      </div>
                      <DialogTitle className="text-left">
                        {item.name}
                      </DialogTitle>
                      <DialogDescription className="text-left">
                        {item.description}
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="mb-0  bottom-0 flex flex-row">
                      <Select>
                        <SelectTrigger className="w-32 outline-none"> 
                          <SelectValue placeholder="1" />
                          {/* //this should be managed in state */}
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
                        className="w-full justify-between "
                      >
                        <p>Add Item</p>{" "}
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
