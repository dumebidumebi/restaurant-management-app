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

// Menu items.
const items = [
  {
    title: "Home",
    url: "/",
    icon: Home,
  },
  {
    title: "Reports",
    url: "/report",
    icon: LineChart,
  },
  {
    title: "Store",
    url: "#",
    icon: Store,
    subItems: [
      { title: "Menu", url: "/store/menu" },
      { title: "Orders", url: "/store/orders" },
      { title: "Order History", url: "/store/order-history" },
      { title: "Locations", url: "/store/locations" },
      // { title: "Reservations", url: "/store/reservations" },
    ],
  },
  {
    title: "Settings",
    url: "/settings",
    icon: Settings,
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
          <SidebarGroupLabel>Dashboard app</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
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
                        <SidebarMenuItem key={subItem.title}>
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
