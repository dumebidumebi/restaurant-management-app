"use client";
import React, { useState } from "react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { PrismaClient } from "@prisma/client";
import { ItemsManager } from "@/components/ItemsManager/itemsManager";
import { CategoryManager } from "@/components/CategoriesManager/categoryManager ";
import { ModifiersManager } from "@/components/ModifiersManager/modifiersManager";
import { ModifierGroupsManager } from "@/components/ModifierGroupsManager/modifierGroupsManager";
import { MenuManager } from "@/components/MenuManager/menuManager";

// use `prisma` in your application to read and write data in your DB

export default function MenuPage() {
  const menu = MENU;
  const [activeTab, setActiveTab] = useState("menus");
  
  const renderTabContent = () => {
    switch (activeTab) {
      case "menus":
        return <MenuManager />;
      case "categories":
        return <CategoryManager />;
      case "items":
        return <ItemsManager />;
      case "modifier groups":
        return <ModifierGroupsManager />;
      case "modifiers":
        return <ModifiersManager />;
      default:
        return null;
    }
  };
  return (
    <div className="flex flex-col min-h-screen min-w-max  my-5 mx-5">
      <h1 className="text-2xl font-bold ">Menu</h1>
      <p className="font-light">
        Set up your menus for online and mobile ordering.
      </p>

      <Tabs
        defaultValue="menus"
        className="my-8 w-full"
        onValueChange={(value) => setActiveTab(value)}
      >
        <div className="flex flex-row justify-between">
          <TabsList className="space-x-5 ">
            <TabsTrigger value="menus">Menus</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
            <TabsTrigger value="items">Items</TabsTrigger>
            <TabsTrigger value="modifier groups">Modifier Groups</TabsTrigger>
            <TabsTrigger value="modifiers">Modifiers</TabsTrigger>
          </TabsList>
        </div>
        <div className="w-full my-8">{renderTabContent()}</div>
      </Tabs>
    </div>
  );
}

// const MenuManager = () =>{
//   return (
//     <div>
//       <Card className="w-full">
//         <CardHeader>
//           <CardTitle>Menus</CardTitle>
//           <CardDescription>
//             Make changes to your account here. Click save when you're done.
//           </CardDescription>
//         </CardHeader>
//         <CardContent className="space-y-2"></CardContent>
//         <CardFooter>
//           <Button>Save changes</Button>
//         </CardFooter>
//       </Card>
//     </div>
//   );
// }

