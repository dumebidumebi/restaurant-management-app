// app/dashboard/orders/page.tsx
"use client";

import { useState, useEffect, useRef } from "react";

// ShadCN UI Components
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

// Lucide Icons
import {
  Bell,
  Search,
  Clock,
  Package,
  Printer,
  Home,
  User,
  ChevronDown,
  Plus,
  ListFilter,
  MoreVertical,
  Filter,
  CheckCircle,
  ChefHat,
} from "lucide-react";

// Custom Components
import OrderDetails from "@/components/OrderDetails";
import NewOrderAlert from "@/components/NewOrderAlert";
import PrepTimeSetter from "@/components/PrepTimeSetter";

// Types
import { Order, OrderItem } from "@/types/index";

export default function OrdersPage() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [activeTab, setActiveTab] = useState<string>("new");
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  const [showPrepTimeDialog, setShowPrepTimeDialog] = useState<boolean>(false);
  const [newOrderAlert, setNewOrderAlert] = useState<Order | null>(null);
  const [isSoundPlaying, setIsSoundPlaying] = useState<boolean>(false);
  const [orders, setOrders] = useState<{
    new: Order[];
    inProgress: Order[];
    ready: Order[];
    completed: Order[];
  }>({
    new: [],
    inProgress: [],
    ready: [],
    completed: [],
  });
  const [lastFetchedCount, setLastFetchedCount] = useState<{ new: number }>({
    new: 0,
  });

  useEffect(() => {
    // Create audio element for notification sound
    audioRef.current = new Audio(
      "https://upcdn.io/223k23J/raw/notification.mp3"
    );

    // Fetch orders on load and then every 15 seconds
    fetchOrders();
    const fetchInterval = setInterval(fetchOrders, 15000);

    return () => {
      clearInterval(fetchInterval);
    };
  }, []);

  useEffect(() => {
    // When active tab changes, set the first order in that tab as the active order
    if (
      orders[activeTab as keyof typeof orders] &&
      orders[activeTab as keyof typeof orders].length > 0
    ) {
      setActiveOrder(orders[activeTab as keyof typeof orders][0]);
    } else {
      // If there are no orders in the selected tab, set active order to null
      setActiveOrder(null);
    }
  }, [activeTab, orders]);

  const fetchOrders = async (): Promise<void> => {
    try {
      const response = await fetch("/api/orders");
      const data = (await response.json()) as Order[];

      // Group orders by status
      const grouped = {
        new: data.filter((order) => order.status === "NEW"),
        inProgress: data.filter(
          (order) => order.status === "ACCEPTED" || order.status === "PREPARING"
        ),
        ready: data.filter((order) => order.status === "READY"),
        completed: data.filter((order) => order.status === "COMPLETED"),
      };

      setOrders(grouped);

      if (grouped.new.length > 0) {
        playAudio();
        setIsSoundPlaying(true);
      } else {
        setIsSoundPlaying(false);
      }

      // Check for new orders
      if (
        grouped.new.length > lastFetchedCount.new &&
        lastFetchedCount.new > 0
      ) {
        // Find the newest order that wasn't in the previous fetch
        const newOrders = grouped.new.filter((newOrder) => {
          return !orders.new.some(
            (existingOrder) => existingOrder.id === newOrder.id
          );
        });

        if (newOrders.length > 0) {
          // Show notification for the most recent new order
          setNewOrderAlert(newOrders[0]);
        }
      }

      setLastFetchedCount({ new: grouped.new.length });
    } catch (error) {
      console.error("Failed to fetch orders:", error);
    }
  };

  const handleAcceptOrder = (order: Order): void => {
    setActiveOrder(order);
    setShowPrepTimeDialog(true);
  };

  const confirmAcceptOrder = async (prepTime: number): Promise<void> => {
    if (!activeOrder) return;

    try {
      await fetch(`/api/orders/${activeOrder.id}/accept`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prepTime }),
      });

      // Print receipt
      await fetch(`/api/orders/${activeOrder.id}/print`, {
        method: "POST",
      });

      setShowPrepTimeDialog(false);
      fetchOrders(); // Refresh orders
    } catch (error) {
      console.error("Failed to accept order:", error);
    }
  };

  const handleMarkReady = async (orderId: string): Promise<void> => {
    try {
      await fetch(`/api/orders/${orderId}/ready`, {
        method: "POST",
      });
      fetchOrders();
    } catch (error) {
      console.error("Failed to mark order ready:", error);
    }
  };

  const handleHandOff = async (orderId: string): Promise<void> => {
    try {
      await fetch(`/api/orders/${orderId}/complete`, {
        method: "POST",
      });
      fetchOrders();
    } catch (error) {
      console.error("Failed to complete order:", error);
    }
  };

  const handlePrintReceipt = async (orderId: string): Promise<void> => {
    try {
      await fetch(`/api/orders/${orderId}/print`, { method: "POST" });
    } catch (error) {
      console.error("Failed to print receipt:", error);
    }
  };

  // Get delivery type badge
  const getDeliveryType = (order: Order): string => {
    return order.customerAddress ? "Delivery" : "Pickup";
  };

  // Main action button based on order status
  const getMainActionButton = (order: Order | null): JSX.Element | null => {
    if (!order) return null;

    switch (order.status) {
      case "NEW":
        return (
          <Button
            className="text-white w-full"
            onClick={() => handleAcceptOrder(order)}
          >
            Accept
          </Button>
        );
      case "ACCEPTED":
      case "PREPARING":
        return (
          <Button
            className="bg-blue-500 hover:bg-blue-600 text-white w-full"
            onClick={() => handleMarkReady(order.id)}
          >
            <CheckCircle className="mr-1 h-4 w-4" />
            Mark as Ready
          </Button>
        );
      case "READY":
        return (
          <Button
            className="bg-blue-500 hover:bg-blue-600 text-white w-full"
            onClick={() => handleHandOff(order.id)}
          >
            <span className="mr-2">✓</span> Hand off
          </Button>
        );
      default:
        return null;
    }
  };

  const playAudio = (): void => {
    setIsSoundPlaying(true);
    if (audioRef.current) {
      audioRef.current.play().catch((error) => {
        console.error("Audio playback failed:", error);
        // setIsSoundPlaying(false);
      });
    }
  };

  return (
    <div className="flex flex-col h-full mx-4 ">
      {/* Header */}
      <div>
        <audio
          ref={audioRef}
          src="https://upcdn.io/223k23J/raw/notification.mp3"
        />
      </div>
      <div className="bg-white p-3 flex items-center border-b">
        <div className="flex-1">
          <div className="font-bold text-lg">
            Orders <ChevronDown className="inline h-4 w-4" />
          </div>
        </div>
        <div className="flex space-x-2">
          <div className="relative">
            <Input
              type="search"
              placeholder="Search orders..."
              className="pl-8 w-[220px]"
            />
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
          </div>

          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>

          <Button variant="outline" size="icon" className="relative">
            <Bell className="h-4 w-4" />
            {orders.new.length > 0 && (
              <Badge className="absolute -top-1 -right-1 bg-red-500 text-white h-5 w-5 flex items-center justify-center p-0 text-xs rounded-full">
                {orders.new.length}
              </Badge>
            )}
          </Button>
        </div>
      </div>

      {/* Original Tabs Navigation */}
      <Tabs
        defaultValue="new"
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full bg-white mb-4"
      >
        <TabsList className="grid grid-cols-4 pb-6  px-2">
          <TabsTrigger value="new" className="relative ">
            New
            <Badge className="ml-1 bg-gray-200  text-gray-800 hover:bg-gray-200">
              {orders.new.length}
            </Badge>
            {isSoundPlaying && (
              <Badge
                className="animate-pulse  text-white"
                onClick={() => setActiveTab("new")}
              >
                <Bell className="mr-2 h-4 w-4" />
                New Orders!
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="inProgress" className="relative">
            In Progress
            <Badge className="ml-1 bg-gray-200 text-gray-800 hover:bg-gray-200">
              {orders.inProgress.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="ready" className="relative">
            Ready
            <Badge className="ml-1 bg-gray-200 text-gray-800 hover:bg-gray-200">
              {orders.ready.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="completed" className="relative">
            Completed
            <Badge className="ml-1 bg-gray-200 text-gray-800 hover:bg-gray-200">
              {orders.completed.length}
            </Badge>
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Panel: Order List for Active Tab */}
        <div className="w-1/3 border-r overflow-y-auto bg-white">
          {orders[activeTab as keyof typeof orders].length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <Package className="h-12 w-12 mb-4" />
              <p>No {activeTab} orders</p>
            </div>
          ) : (
            <div className="divide-y ">
              {orders[activeTab as keyof typeof orders].map((order) => (
                <div
                  key={order.id}
                  className={`p-3 cursor-pointer hover:bg-gray-50 flex justify-between 
                    ${
                      activeOrder?.id === order.id
                        ? "bg-blue-50 border-l-4 border-blue-500"
                        : ""
                    }`}
                  onClick={() => setActiveOrder(order)}
                >
                  <div className="flex items-start">
                    <div className="flex-shrink-0 mr-2">
                      {/* Logo placeholder based on delivery service */}
                      <div
                        className={`h-8 w-8 rounded-md flex items-center justify-center text-white
                        ${
                          activeTab === "new"
                            ? "bg-yellow-500"
                            : activeTab === "inProgress"
                            ? "bg-blue-500"
                            : activeTab === "ready"
                            ? "bg-green-500"
                            : "bg-gray-500"
                        }`}
                      >
                        {order.customerName.charAt(0)}
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center text-sm font-bold">
                        #{order.orderNumber}
                        <Badge
                          className={`ml-2 ${
                            order.status === "NEW"
                              ? "bg-yellow-100 text-yellow-800"
                              : order.status === "ACCEPTED"
                              ? "bg-blue-100 text-blue-800"
                              : order.status === "PREPARING"
                              ? "bg-purple-100 text-purple-800"
                              : order.status === "READY"
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {order.status}
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-500">
                        {order.customerName}
                      </div>
                      <div className="flex items-center text-xs text-gray-600">
                        <span className="mr-2">{getDeliveryType(order)}</span>
                        <span>${order.total.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Panel: Order Details */}
        <div className="flex-1 overflow-y-auto bg-white">
          {activeOrder ? (
            <div className="flex flex-col h-full">
              {/* Order Header */}
              <div className="px-4 py-3 border-b">
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 mr-3">
                      <div
                        className={`h-10 w-10 rounded-md flex items-center justify-center text-white
                        ${
                          activeOrder.status === "NEW"
                            ? "bg-yellow-500"
                            : activeOrder.status === "ACCEPTED" ||
                              activeOrder.status === "PREPARING"
                            ? "bg-blue-500"
                            : activeOrder.status === "READY"
                            ? "bg-green-500"
                            : "bg-gray-500"
                        }`}
                      >
                        {activeOrder.customerName.charAt(0)}
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center">
                        <span className="text-lg font-bold">
                          #{activeOrder.orderNumber}
                        </span>
                        <Badge
                          className={`ml-2 ${
                            activeOrder.status === "NEW"
                              ? "bg-yellow-100 text-yellow-800"
                              : activeOrder.status === "ACCEPTED"
                              ? "bg-blue-100 text-blue-800"
                              : activeOrder.status === "PREPARING"
                              ? "bg-purple-100 text-purple-800"
                              : activeOrder.status === "READY"
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {activeOrder.status}
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-500">
                        {activeOrder.customerName}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Tabs */}
              <div className="border-b">
                <div className="flex divide-x">
                  <div className="px-4 py-2 font-medium border-b-2 border-black">
                    Order
                  </div>
                  <div className="px-4 py-2 text-gray-500">Courier</div>
                  <div className="px-4 py-2 text-gray-500">Customer</div>
                  <div className="px-4 py-2 text-gray-500">Timeline</div>
                </div>
              </div>

              {/* Order Content */}
              <div className="flex-1 overflow-y-auto">
                {/* Notes */}
                {activeOrder.notes && (
                  <div className="px-4 py-2 bg-gray-50">
                    <div className="text-xs text-gray-500">Note</div>
                    <div className="text-sm font-medium">
                      "{activeOrder.notes}"
                    </div>
                  </div>
                )}

                {/* Items */}
                <div className="px-4 py-2">
                  {activeOrder.items.map((item, idx) => (
                    <div key={idx} className="py-2 flex items-start">
                      <div className="w-8 text-center">{item.quantity}</div>
                      <div className="flex-1">{item.name}</div>
                    </div>
                  ))}
                </div>

                <Separator />

                {/* Transaction Details */}
                <div className="px-4 py-2">
                  <div className="text-gray-500 text-sm my-2">
                    Transaction details
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>${activeOrder.subtotal.toFixed(2)}</span>
                    </div>

                    {activeOrder.tax > 0 && (
                      <div className="flex justify-between">
                        <span>Tax</span>
                        <span>${activeOrder.tax.toFixed(2)}</span>
                      </div>
                    )}

                    {activeOrder.deliveryFee && (
                      <div className="flex justify-between">
                        <span>Delivery Fee</span>
                        <span>${activeOrder.deliveryFee.toFixed(2)}</span>
                      </div>
                    )}

                    <div className="flex justify-between font-medium">
                      <span>Total</span>
                      <span>${activeOrder.total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Actions */}
              <div className="p-3 border-t flex items-center">
                <Button variant="ghost" size="icon" className="mr-2">
                  <MoreVertical className="h-5 w-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="mr-2"
                  onClick={() => handlePrintReceipt(activeOrder.id)}
                >
                  <Printer className="h-5 w-5" />
                </Button>
                <div className="flex-1">{getMainActionButton(activeOrder)}</div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <Package className="h-12 w-12 mb-4" />
              <p>Select an order to view details</p>
            </div>
          )}
        </div>
      </div>

      {/* Prep Time Dialog */}
      {activeOrder && (
        <PrepTimeSetter
          order={activeOrder}
          open={showPrepTimeDialog}
          onClose={() => setShowPrepTimeDialog(false)}
          onConfirm={confirmAcceptOrder}
        />
      )}

      {/* New Order Alert */}
      {newOrderAlert && (
        <NewOrderAlert
          order={newOrderAlert}
          onAccept={(order) => {
            setActiveOrder(order);
            handleAcceptOrder(order);
          }}
          onDismiss={() => setNewOrderAlert(null)}
        />
      )}
    </div>
  );
}
