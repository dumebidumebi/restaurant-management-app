//app sidebar
"use client";
import { useState } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import Link from "next/link";
import {
  Calendar,
  ChevronDown,
  ChevronRight,
  GitGraph,
  Home,
  Inbox,
  LineChart,
  Search,
  Settings,
  Store,
} from "lucide-react";
import { Badge } from "./ui/badge";

// Menu items.
const items = [
  {
    title: "Home",
    url: "/",
    icon: Home,
    key: "home",
  },
  {
    title: (
      <div className="flex flex-row gap-2">
        <p>Reports</p>
        <Badge variant={"outline"}>coming soon</Badge>
      </div>
    ),
    url: "/report",
    icon: LineChart,
    key: "reports",
  },
  {
    title: "Store",
    url: "#",
    icon: Store,
    key: "store",
    subItems: [
      { title: "Menu", url: "/store/menu", key: "menu" },
      { title: "Orders", url: "/store/orders", key: "orders" },
      {
        title: "Order History",
        url: "/store/order-history",
        key: "order-history",
      },
      {
        title: (
          <div className="flex flex-row gap-2">
            <p>Locations</p>
            <Badge variant={"outline"}>coming soon</Badge>
          </div>
        ),
        url: "/store/locations",
        key: "locations",
      },
      // { title: "Reservations", url: "/store/reservations" },
    ],
  },
  {
    title: "Settings",
    url: "/settings",
    icon: Settings,
    key: "settings",
  },
];

export function AppSidebar() {
  const [collapsedItems, setCollapsedItems] = useState<Record<string, boolean>>(
    {}
  );

  const toggleCollapse = (title: string) => {
    setCollapsedItems((prev) => ({
      ...prev,
      [title]: !prev[title],
    }));
  };

  return (
    <Sidebar variant="sidebar" collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="font-bold text-lg mb-2">
            Bistrokit
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.key}>
                  <Link href={item.url} className="">
                    <SidebarMenuButton asChild>
                      <div
                        onClick={() =>
                          item.subItems && toggleCollapse(item.title)
                        }
                        style={{
                          display: "flex",
                          alignItems: "center",
                          cursor: "pointer",
                        }}
                      >
                        <item.icon className="" />
                        <span>{item.title}</span>
                        {item.subItems && (
                          <span style={{ marginLeft: "auto" }}>
                            {collapsedItems[item.title] ? (
                              <ChevronDown />
                            ) : (
                              <ChevronRight />
                            )}
                          </span>
                        )}
                      </div>
                    </SidebarMenuButton>
                  </Link>
                  {item.subItems && collapsedItems[item.title] && (
                    <SidebarMenu style={{ marginLeft: "20px" }}>
                      {item.subItems.map((subItem) => (
                        <SidebarMenuItem key={subItem.key}>
                          <SidebarMenuButton asChild>
                            <Link href={subItem.url}>
                              <span>{subItem.title}</span>
                            </Link>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      ))}
                    </SidebarMenu>
                  )}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
