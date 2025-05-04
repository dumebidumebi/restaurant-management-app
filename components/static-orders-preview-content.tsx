// app/(landing-page)/components/static-orders-preview-content.tsx
"use client";

import { useState } from "react";

// ShadCN UI Components (Import necessary components)
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

// Lucide Icons (Import necessary icons)
import {
  Bell,
  Search,
  Clock,
  Package,
  Printer,
  ChevronDown,
  Filter,
  CheckCircle,
  Truck,
  ExternalLink,
  MapPin,
  Phone,
  Mail,
  AlertCircle,
  Plus,
} from "lucide-react";

// Types (Can reuse from original OrdersPage or define here)
interface OrderItem {
  name: string;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  status: "NEW" | "ACCEPTED" | "PREPARING" | "READY" | "COMPLETED" | "CANCELED";
  orderNumber: string;
  customerName: string;
  customerPhone?: string;
  customerEmail?: string;
  customerAddress?: string;
  total: number;
  subtotal: number;
  tax: number;
  deliveryFee?: number;
  items: OrderItem[];
  deliveryStatus?: string; // e.g., 'ASSIGNED', 'PICKED_UP', 'DROPPED_OFF'
  tracking_url?: string;
  dasherName?: string;
  dasherPhone?: string;
  pickup_time_estimated?: string;
  dropoff_time_estimated?: string;
  doordashStatus?: string; // More specific status
  notes?: string;
}

// --- DUMMY DATA ---
const dummyOrders: Order[] = [
  {
    id: "order-1",
    status: "NEW",
    orderNumber: "1001",
    customerName: "Alice Smith",
    customerPhone: "555-1234",
    customerAddress: "123 Main St, Anytown USA",
    total: 35.5,
    subtotal: 30.0,
    tax: 2.5,
    deliveryFee: 3.0,
    items: [
      { name: "Cheeseburger", quantity: 1, price: 12.0 },
      { name: "Fries", quantity: 1, price: 5.0 },
      { name: "Soda", quantity: 1, price: 3.0 },
      { name: "Extra Patty", quantity: 1, price: 10.0 },
    ],
    deliveryStatus: "SCHEDULED",
    doordashStatus: "Delivery Scheduled",
    notes: "No onions on the burger please.",
  },
  {
    id: "order-2",
    status: "NEW",
    orderNumber: "1002",
    customerName: "Bob Johnson",
    customerPhone: "555-5678",
    total: 22.0,
    subtotal: 20.0,
    tax: 2.0,
    items: [
      { name: "Chicken Sandwich", quantity: 1, price: 11.0 },
      { name: "Salad", quantity: 1, price: 9.0 },
    ],
  },
  {
    id: "order-3",
    status: "ACCEPTED",
    orderNumber: "1003",
    customerName: "Charlie Brown",
    customerEmail: "charlie@example.com",
    customerAddress: "456 Oak Ave, Anytown USA",
    total: 45.0,
    subtotal: 40.0,
    tax: 3.0,
    deliveryFee: 2.0,
    items: [
      { name: "Pizza", quantity: 1, price: 25.0 },
      { name: "Wings", quantity: 1, price: 15.0 },
    ],
    deliveryStatus: "ASSIGNED",
    doordashStatus: "Dasher Assigned",
    dasherName: "Dave Dasher",
    dasherPhone: "555-1111",
    pickup_time_estimated: new Date(Date.now() + 10 * 60000).toISOString(), // 10 mins from now
    dropoff_time_estimated: new Date(Date.now() + 35 * 60000).toISOString(), // 35 mins from now
    tracking_url: "#",
  },
  {
    id: "order-4",
    status: "PREPARING",
    orderNumber: "1004",
    customerName: "Diana Prince",
    total: 15.0,
    subtotal: 14.0,
    tax: 1.0,
    items: [{ name: "Taco Platter", quantity: 1, price: 14.0 }],
  },
  {
    id: "order-5",
    status: "READY",
    orderNumber: "1005",
    customerName: "Ethan Hunt",
    customerAddress: "789 Pine Ln, Anytown USA",
    total: 28.5,
    subtotal: 25.0,
    tax: 1.5,
    deliveryFee: 2.0,
    items: [
      { name: "Sushi Combo", quantity: 1, price: 25.0 },
    ],
    deliveryStatus: "ARRIVING_FOR_PICKUP",
    doordashStatus: "Dasher Arriving",
    dasherName: "Fiona Flyer",
    tracking_url: "#",
  },
  {
    id: "order-6",
    status: "COMPLETED",
    orderNumber: "1006",
    customerName: "Fiona Gallagher",
    total: 18.0,
    subtotal: 16.0,
    tax: 2.0,
    items: [{ name: "Pasta Carbonara", quantity: 1, price: 16.0 }],
  },
  {
    id: "order-7",
    status: "CANCELED",
    orderNumber: "1007",
    customerName: "George Costanza",
    total: 30.0,
    subtotal: 28.0,
    tax: 2.0,
    items: [{ name: "Large Salad", quantity: 2, price: 14.0 }],
  },
];
// --- END DUMMY DATA ---

export default function StaticOrdersPreviewContent() {
  const [activeTab, setActiveTab] = useState<"new" | "inProgress" | "completed">("new");
  const [activeOrder, setActiveOrder] = useState<Order | null>(dummyOrders[0]); // Start with first order selected

  // Group dummy orders
  const groupedOrders = {
    new: dummyOrders.filter((order) => order.status === "NEW"),
    inProgress: dummyOrders.filter((order) =>
      ["ACCEPTED", "PREPARING", "READY"].includes(order.status),
    ),
    completed: dummyOrders.filter((order) =>
      ["COMPLETED", "CANCELED"].includes(order.status),
    ),
  };

  // Update active order when tab changes
  const handleTabChange = (tab: "new" | "inProgress" | "completed") => {
    setActiveTab(tab);
    const currentTabOrders = groupedOrders[tab];
    setActiveOrder(currentTabOrders.length > 0 ? currentTabOrders[0] : null);
  };

  const getDeliveryStatusColor = (status?: string) => {
    if (!status) return "bg-gray-100 text-gray-800";
    const statusLower = status.toLowerCase();
    if (statusLower.includes("assigned")) return "bg-yellow-100 text-yellow-800";
    if (statusLower.includes("arriving")) return "bg-indigo-100 text-indigo-800";
    if (statusLower.includes("picked_up")) return "bg-blue-100 text-blue-800";
    if (statusLower.includes("dropp")) return "bg-green-100 text-green-800";
    if (statusLower.includes("scheduled")) return "bg-yellow-100 text-yellow-800";
    if (statusLower.includes("failed")) return "bg-red-100 text-red-800";
    return "bg-gray-100 text-gray-800";
  };

  const formatDateTime = (dateString?: string) => {
    if (!dateString) return "";
    try {
      return new Date(dateString).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (e) {
      return "Invalid Date";
    }
  };

  // Simplified action button logic for preview
  const getActionButton = () => {
    if (!activeOrder) return null;

    if (activeOrder.status === "NEW") {
      return (
        <Button className="text-white w-full" disabled>
          Accept (Preview)
        </Button>
      );
    }
    if (["ACCEPTED", "PREPARING"].includes(activeOrder.status)) {
      return (
        <Button
          className="bg-blue-500 hover:bg-blue-600 text-white w-full"
          disabled
        >
          <CheckCircle className="mr-1 h-4 w-4" />
          Mark as Ready (Preview)
        </Button>
      );
    }
    if (activeOrder.status === "READY") {
      return (
        <Button
          className="bg-blue-500 hover:bg-blue-600 text-white w-full"
          disabled
        >
          <Truck className="mr-1 h-4 w-4" /> Hand off (Preview)
        </Button>
      );
    }
    return null; // No action for completed/canceled in preview
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header (Simplified for Preview) */}
      <div className="bg-white p-3 flex items-center border-b">
        <div className="flex-1">
          <div className="font-bold text-lg">
            Orders <ChevronDown className="inline h-4 w-4" />
          </div>
        </div>
        <div className="flex space-x-2">
          <Button variant="default" disabled className="mr-2">
            <Plus className="h-4 w-4 mr-1" /> New Order (Preview)
          </Button>
          <div className="relative">
            <Input
              placeholder="Search orders..."
              className="pl-8 w-[180px] sm:w-[220px]"
              disabled
            />
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
          </div>
          <Button variant="outline" size="icon" disabled>
            <Filter className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" className="relative" disabled>
            <Bell className="h-4 w-4" />
            {groupedOrders.new.length > 0 && (
              <Badge className="absolute -top-1 -right-1 bg-red-500 text-white h-5 w-5 flex items-center justify-center p-0 text-xs rounded-full">
                {groupedOrders.new.length}
              </Badge>
            )}
          </Button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <Tabs
        value={activeTab}
        onValueChange={(value) => handleTabChange(value as any)}
        className="w-full bg-white"
      >
        <TabsList className="grid grid-cols-3 w-full px-2">
          {(["new", "inProgress", "completed"] as const).map((tab) => (
            <TabsTrigger key={tab} value={tab} className="relative text-xs sm:text-sm">
              {tab === "new"
                ? "New"
                : tab === "inProgress"
                ? "In Progress"
                : "Completed"}
              <Badge className="ml-1 bg-gray-200 text-gray-800 hover:bg-gray-200 px-1.5 sm:px-2">
                {groupedOrders[tab].length}
              </Badge>
              {/* Simple indicator for new orders */}
              {tab === "new" && groupedOrders.new.length > 0 && (
                 <span className="absolute top-0 right-1 h-2 w-2 rounded-full bg-red-500"></span>
              )}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden"> {/* Added overflow-hidden */}
        {/* Left Panel - Order List */}
        <div className="w-1/3 border-r overflow-y-auto bg-white"> {/* Added overflow-y-auto */}
          {groupedOrders[activeTab].length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500 p-4 text-center">
              <Package className="h-10 w-10 mb-3" />
              <p className="text-sm">
                No {activeTab === "inProgress" ? "in progress" : activeTab}{" "}
                orders in this preview
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {groupedOrders[activeTab].map((order) => (
                <div
                  key={order.id}
                  className={`p-3 cursor-pointer hover:bg-gray-50 ${
                    activeOrder?.id === order.id
                      ? "bg-blue-50 border-l-4 border-blue-500"
                      : ""
                  }`}
                  onClick={() => setActiveOrder(order)}
                >
                  {/* Simplified List Item View */}
                  <div className="flex items-start gap-2">
                    <div
                      className={`h-8 w-8 rounded-md flex items-center justify-center text-white text-sm font-medium flex-shrink-0 ${
                        order.status === "NEW" ? "bg-yellow-500" :
                        ["ACCEPTED", "PREPARING"].includes(order.status) ? "bg-blue-500" :
                        order.status === "READY" ? "bg-green-500" :
                        order.status === "CANCELED" ? "bg-red-500" : "bg-gray-500"
                      }`}
                    >
                      {order.customerName.charAt(0)}
                    </div>
                    <div className="overflow-hidden"> {/* Prevent text overflow */}
                      <div className="text-sm font-bold truncate">
                        {order.customerName}
                      </div>
                      <div className="text-xs text-gray-500 truncate">
                        #{order.orderNumber}
                      </div>
                      <div className="text-xs text-gray-600 truncate">
                        {order.customerAddress ? "Delivery" : "Pickup"} • $
                        {order.total?.toFixed(2)}
                      </div>
                      {order.doordashStatus && (
                        <Badge
                          variant="outline"
                          className={`mt-1 text-xs ${getDeliveryStatusColor(order.doordashStatus)}`}
                        >
                          {order.doordashStatus}
                        </Badge>
                      )}
                       {order.status === "CANCELED" && (
                          <Badge variant="destructive" className="mt-1 text-xs">
                            CANCELED
                          </Badge>
                        )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Panel - Order Details */}
        <div className="flex-1 bg-white overflow-y-auto"> {/* Added overflow-y-auto */}
          {activeOrder ? (
            <div className="flex flex-col h-full">
              {/* Order Header */}
              <div className="px-4 py-3 border-b sticky top-0 bg-white z-10">
                 <div className="flex items-center gap-3">
                  <div
                    className={`h-10 w-10 rounded-md flex items-center justify-center text-white text-base font-medium flex-shrink-0 ${
                      activeOrder.status === "NEW" ? "bg-yellow-500" :
                      ["ACCEPTED", "PREPARING"].includes(activeOrder.status) ? "bg-blue-500" :
                      activeOrder.status === "READY" ? "bg-green-500" :
                      activeOrder.status === "CANCELED" ? "bg-red-500" : "bg-gray-500"
                    }`}
                  >
                    {activeOrder.customerName.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-bold truncate">
                        {activeOrder.customerName}
                      </h2>
                       <Badge
                        variant="outline"
                        className={`text-xs ${
                          activeOrder.status === "NEW" ? "border-yellow-300 bg-yellow-50 text-yellow-800" :
                          activeOrder.status === "ACCEPTED" ? "border-blue-300 bg-blue-50 text-blue-800" :
                          activeOrder.status === "PREPARING" ? "border-purple-300 bg-purple-50 text-purple-800" :
                          activeOrder.status === "READY" ? "border-green-300 bg-green-50 text-green-800" :
                          activeOrder.status === "CANCELED" ? "border-red-300 bg-red-50 text-red-800" :
                          "border-gray-300 bg-gray-50 text-gray-800"
                        }`}
                      >
                        {activeOrder.status}
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-500">
                      #{activeOrder.orderNumber}
                    </div>
                  </div>
                </div>
              </div>

              {/* Customer & Delivery Info Tabs (Optional Simplification) */}
              <Tabs defaultValue="customer" className="w-full px-4 pt-3">
                 <TabsList className="grid w-full grid-cols-2 h-9">
                    <TabsTrigger value="customer" className="text-xs">Customer</TabsTrigger>
                    <TabsTrigger value="delivery" className="text-xs" disabled={!activeOrder.customerAddress}>Delivery</TabsTrigger>
                 </TabsList>
                 <TabsContent value="customer" className="pt-3 text-sm space-y-2">
                    {activeOrder.customerPhone && (
                      <div className="flex items-center">
                        <Phone className="h-4 w-4 mr-2 text-gray-500 flex-shrink-0" />
                        <span>{activeOrder.customerPhone}</span>
                      </div>
                    )}
                    {activeOrder.customerEmail && (
                      <div className="flex items-center">
                        <Mail className="h-4 w-4 mr-2 text-gray-500 flex-shrink-0" />
                        <span className="truncate">{activeOrder.customerEmail}</span>
                      </div>
                    )}
                    {activeOrder.customerAddress && (
                      <div className="flex items-start">
                        <MapPin className="h-4 w-4 mr-2 text-gray-500 mt-0.5 flex-shrink-0" />
                        <span>{activeOrder.customerAddress}</span>
                      </div>
                    )}
                    {activeOrder.notes && (
                      <div className="flex items-start pt-2 border-t mt-2">
                        <AlertCircle className="h-4 w-4 mr-2 text-orange-500 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700 italic">{activeOrder.notes}</span>
                      </div>
                    )}
                 </TabsContent>
                 <TabsContent value="delivery" className="pt-3 text-sm space-y-2">
                    {activeOrder.deliveryStatus && (
                       <div>
                          <div className="text-gray-500 text-xs mb-1">Status</div>
                          <Badge variant="outline" className={getDeliveryStatusColor(activeOrder.doordashStatus)}>
                             {activeOrder.doordashStatus}
                          </Badge>
                       </div>
                    )}
                     {activeOrder.tracking_url && (
                      <div>
                        <a
                          href={activeOrder.tracking_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center text-blue-600 hover:underline text-xs"
                          onClick={(e) => e.preventDefault()} // Disable link in preview
                        >
                          <ExternalLink className="mr-1 h-3 w-3" />
                          Track Delivery (Preview)
                        </a>
                      </div>
                    )}
                    {activeOrder.pickup_time_estimated && (
                      <div>
                        <div className="text-gray-500 text-xs mb-1">Est. Pickup</div>
                        <div className="flex items-center">
                          <Clock className="mr-1 h-4 w-4" />
                          {formatDateTime(activeOrder.pickup_time_estimated)}
                        </div>
                      </div>
                    )}
                    {activeOrder.dropoff_time_estimated && (
                       <div>
                        <div className="text-gray-500 text-xs mb-1">Est. Delivery</div>
                        <div className="flex items-center">
                          <MapPin className="mr-1 h-4 w-4" />
                          {formatDateTime(activeOrder.dropoff_time_estimated)}
                        </div>
                      </div>
                    )}
                     {activeOrder.dasherName && (
                      <div>
                        <div className="text-gray-500 text-xs mb-1">Courier</div>
                        <div>{activeOrder.dasherName}</div>
                        {activeOrder.dasherPhone && (
                          <div className="text-gray-600 text-xs">
                            {activeOrder.dasherPhone}
                          </div>
                        )}
                      </div>
                    )}
                 </TabsContent>
              </Tabs>

              <Separator className="my-3" />

              {/* Order Items */}
              <div className="px-4 pb-2 flex-grow"> {/* Added flex-grow */}
                <div className="text-sm font-medium mb-2">Order Items</div>
                <div className="space-y-1">
                  {activeOrder.items.map((item, idx) => (
                    <div key={idx} className="py-1 flex items-center text-sm">
                      <div className="w-8 text-center text-gray-600">{item.quantity}x</div>
                      <div className="flex-1 truncate">{item.name}</div>
                      <div className="ml-2">
                        ${((item.price || 0) * (item.quantity || 0))?.toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Transaction Details */}
              <div className="px-4 py-3 border-t bg-gray-50/50 text-sm">
                <div className="space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span>${activeOrder.subtotal?.toFixed(2)}</span>
                  </div>
                  {activeOrder.tax > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tax</span>
                      <span>${activeOrder.tax?.toFixed(2)}</span>
                    </div>
                  )}
                  {activeOrder.deliveryFee !== undefined && activeOrder.deliveryFee > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Delivery Fee</span>
                      <span>${activeOrder.deliveryFee?.toFixed(2)}</span>
                    </div>
                  )}
                  <Separator className="my-1" />
                  <div className="flex justify-between font-semibold text-base">
                    <span>Total</span>
                    <span>${activeOrder.total?.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Sticky Actions bar (Disabled) */}
              <div className="sticky bottom-0 p-3 border-t flex items-center gap-2 bg-white shadow-md">
                <Button variant="ghost" size="icon" disabled>
                  <Printer className="h-5 w-5" />
                </Button>
                {!["COMPLETED", "CANCELED"].includes(activeOrder.status) && (
                  <Button
                    variant="outline"
                    disabled
                    className="text-red-600 border-red-200"
                  >
                    Cancel Order (Preview)
                  </Button>
                )}
                <div className="flex-1">{getActionButton()}</div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-500 p-4 text-center">
              <Package className="h-12 w-12 mb-4" />
              <p>Select an order to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
