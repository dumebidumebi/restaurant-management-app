"use client";
import React, { useEffect, useState } from "react";
import { ChevronRight } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
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
import { useCartStore } from "@/stores/cartStore";
import { Checkbox } from "@/components/ui/checkbox";
import logo from "@/images/chikin_logo.png";
import LocationDialog from "@/components/LocationDialog";
import LocationSummary from "@/components/LocationSummary";
import { useRouter } from "next/router";

import { getSiteMenu } from "@/lib/get-site-menu";
import { Modifier } from "@/prisma/generated/client";


export default function MenuPage() {
  const params = useParams();

  const [siteMenu, setSiteMenu] = useState<any>(null); // Replace 'any' with the correct type if needed
  const [quantities, setQuantities] = useState<{ [key: string]: number }>({});
  const [selectedModifiers, setSelectedModifiers] = useState<{
    [key: string]: any;
  }>({});
  const { addToCart } = useCartStore();
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
    return (
      <div className="w-full h-full flex flex-col justify-center items-center content-center my-44">
        {" "}
        <Image
          src={logo}
          alt={"logo"}
          width={500}
          height={500}
          className=" rounded-t-lg object-cover"
        />
      </div>
    );
  }

  return (
    <div>
      <LocationSummary />
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
                className="cursor-pointer hover:bg-yellow-400 text-md font-light lg:w-full flex-auto items-center text-left lg:justify-start"
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
                {category.items.map((item: any) => {
                  const currentQuantity = quantities[item.id] || 1; // to track quanities
                  return (
                    <Dialog
                      key={item.id}
                      onOpenChange={(open) => {
                        if (!open) {
                          setSelectedModifiers({}); // Reset modifiers when dialog closes
                        }
                      }}
                    >
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
                      <DialogContent className="w-5/6 h-fit flex flex-col justify-between rounded-md">
                        <DialogHeader className="my-10">
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
                        {/* modifiergroups and modifiers */}
                        {/* Add this inside DialogContent, after the header */}
                        {item.modifierGroups?.length > 0 && (
                          <div className="overflow-y-auto flex-1">
                            {item.modifierGroups.map((group: any) => (
                              <div key={group.id} className="mb-6">
                                <h4 className="font-medium mb-2">
                                  {group.name}
                                </h4>
                                <p className="text-sm text-gray-500 mb-3">
                                  {group.minSelect > 0 &&
                                    `Minimum ${group.minSelect} selections`}
                                  {group.maxSelect > 0 &&
                                    `Maximum ${group.maxSelect} selections`}
                                </p>
                                <div className="space-y-2">
                                  {group.modifiers.map((modifier: Modifier) => {
                                    const currentModifierQty =
                                      selectedModifiers[modifier.id]
                                        ?.quantity || 0;
                                    const currentTotal = Object.values(
                                      selectedModifiers
                                    ).reduce(
                                      (sum: number, m) => sum + m.quantity,
                                      0
                                    );

                                    return (
                                      <div
                                        key={modifier.id}
                                        className="flex items-center justify-between p-2 border rounded-lg hover:bg-gray-50"
                                      >
                                        <div className="flex items-center gap-2">
                                          <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                              setSelectedModifiers((prev) => {
                                                const newState = { ...prev };
                                                if (currentModifierQty > 1) {
                                                  newState[modifier.id] = {
                                                    ...modifier,
                                                    quantity:
                                                      currentModifierQty - 1,
                                                  };
                                                } else {
                                                  delete newState[modifier.id];
                                                }
                                                return newState;
                                              });
                                            }}
                                            disabled={currentModifierQty === 0}
                                          >
                                            -
                                          </Button>
                                          <span>{currentModifierQty}</span>
                                          <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                              setSelectedModifiers((prev) => ({
                                                ...prev,
                                                [modifier.id]: {
                                                  ...modifier,
                                                  quantity:
                                                    (prev[modifier.id]
                                                      ?.quantity || 0) + 1,
                                                },
                                              }));
                                            }}
                                            disabled={
                                              group.maxSelect > 0 &&
                                              currentTotal >= group.maxSelect
                                            }
                                          >
                                            +
                                          </Button>
                                        </div>

                                        <div className="flex-1 ml-4">
                                          <span>{modifier.name}</span>
                                          {modifier.price > 0 && (
                                            <span className="ml-2">
                                              +${modifier.price.toFixed(2)}
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                        <DialogFooter className="mb-0 bottom-0 flex flex-row">
                          <Select
                            value={currentQuantity.toString()}
                            onValueChange={(value) =>
                              setQuantities((prev) => ({
                                ...prev,
                                [item.id]: Number(value),
                              }))
                            }
                          >
                            <SelectTrigger className="w-32 outline-none">
                              <SelectValue placeholder="1" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectGroup>
                                <SelectLabel>Quantity</SelectLabel>
                                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                                  <SelectItem key={num} value={num.toString()}>
                                    {num}
                                  </SelectItem>
                                ))}
                              </SelectGroup>
                            </SelectContent>
                          </Select>
                          <DialogClose asChild>
                            <Button
                              variant={"default"}
                              className="w-full justify-between"
                              onClick={() => {
                                const cartItem = {
                                  id: item.id,
                                  name: item.name,
                                  price: item.price,
                                  quantity: currentQuantity,
                                  imageUrl: item.imageUrl,
                                  stripePriceId: item.stripePriceId,
                                  modifiers: item.modifiers? item.modifiers: [],
                                  // Initialize modifiers as empty array
                                };

                                // Add modifiers only if they exist
                                if (Object.keys(selectedModifiers).length > 0) {
                                  cartItem.modifiers = Object.values(
                                    selectedModifiers
                                  ).map((m) => ({
                                    id: m.id,
                                    name: m.name,
                                    price: m.price,
                                    stripePriceId: m.stripePriceId,
                                    quantity: m.quantity,
                                  }));
                                }

                                addToCart(cartItem);
                              }}
                            >
                              <p>Add Item</p>
                              <div className="w-fit flex flex-row justify-center">
                                <span>
                                  $
                                  {(
                                    item.price * currentQuantity +
                                    (Object.values(selectedModifiers)?.length >
                                    0
                                      ? Object.values(selectedModifiers).reduce(
                                          (sum, m) =>
                                            sum + m.price * m.quantity,
                                          0
                                        )
                                      : 0)
                                  ).toFixed(2)}
                                </span>
                                <ChevronRight className="mt-0.5" />
                              </div>
                            </Button>
                          </DialogClose>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  );
                })}
              </div>
            </section>
          ))}
        </main>
        <LocationDialog />
      </div>
    </div>
  );
}
