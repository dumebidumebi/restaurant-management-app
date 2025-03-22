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

// Custom Components
import PrepTimeSetter from "@/components/PrepTimeSetter";
import NewOrderAlert from "@/components/NewOrderAlert";
import CreateOrderModal from "@/components/CreateOrderModal";

// Types
interface OrderItem {
  name: string;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  status: string;
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
  deliveryStatus?: string;
  tracking_url?: string;
  dasherName?: string;
  dasherPhone?: string;
  pickup_time_estimated?: string;
  dropoff_time_estimated?: string;
  doordashStatus?: string;
  deliveryId?: string;
  notes?: string;
  courierDetail?: {
    name?: string;
    phone?: string;
  };
  support_reference?: string;
  fee?: number;
}

interface CreateOrderData {
  storeId: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  customerAddress?: string;
  notes?: string;
  items: {
    name: string;
    quantity: number;
    price: number;
    notes?: string;
  }[];
}

export default function OrdersPage() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [activeTab, setActiveTab] = useState("new");
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  const [showPrepTimeDialog, setShowPrepTimeDialog] = useState(false);
  const [newOrderAlert, setNewOrderAlert] = useState<Order | null>(null);
  const [isSoundPlaying, setIsSoundPlaying] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [showCreateOrderModal, setShowCreateOrderModal] = useState(false);

  // Group orders by status
  const groupedOrders = {
    new: orders.filter((order) => order.status === "NEW"),
    inProgress: orders.filter((order) =>
      ["ACCEPTED", "PREPARING", "READY"].includes(order.status),
    ),
    completed: orders.filter((order) =>
      ["COMPLETED", "CANCELED"].includes(order.status),
    ),
  };

  useEffect(() => {
    audioRef.current = new Audio(
      "https://upcdn.io/223k23J/raw/notification.mp3",
    );
    fetchOrders();

    // Set up polling for new orders
    const interval = setInterval(fetchOrders, 30000);

    // Refresh when window gains focus
    window.addEventListener("focus", fetchOrders);

    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", fetchOrders);
    };
  }, []);

  useEffect(() => {
    // When active tab changes, select the first order in that tab
    const currentTabOrders =
      groupedOrders[activeTab as keyof typeof groupedOrders];

    if (currentTabOrders.length > 0) {
      const currentOrderStillVisible = currentTabOrders.find(
        (order) => order.id === activeOrder?.id,
      );
      setActiveOrder(currentOrderStillVisible || currentTabOrders[0]);
    } else {
      setActiveOrder(null);
    }
  }, [activeTab, orders]);

  const fetchOrders = async () => {
    try {
      const response = await fetch("/api/orders");
      const data = await response.json();

      setOrders(data);

      // Check if we have new orders that need alerts
      const newOrders = data.filter((order: Order) => order.status === "NEW");
      if (
        newOrders.length > 0 &&
        newOrders.length > groupedOrders.new.length
      ) {
        playAudio();
        if (!newOrderAlert) {
          setNewOrderAlert(newOrders[0]);
        }
      }
    } catch (error) {
      console.error("Failed to fetch orders:", error);
    }
  };

  const playAudio = () => {
    if (audioRef.current) {
      audioRef.current.play().catch((error) => {
        console.error("Failed to play audio:", error);
      });
      setIsSoundPlaying(true);
    }
  };

  const handleAcceptOrder = async (prepTime: number) => {
    if (!activeOrder) return;

    const originalOrder = { ...activeOrder }; // Store original order
    const originalOrders = [...orders]; // Store original orders

    // Optimistically update the UI
    const updatedOrder = { ...activeOrder, status: "ACCEPTED" };
    setActiveOrder(updatedOrder);
    setOrders((prevOrders) =>
      prevOrders.map((order) =>
        order.id === activeOrder.id ? updatedOrder : order,
      ),
    );
    setShowPrepTimeDialog(false);

    try {
      await fetch(`/api/orders/${activeOrder.id}/accept`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prepTime }),
      });

      await fetch(`/api/orders/${activeOrder.id}/print`, { method: "POST" });
    } catch (error) {
      console.error("Failed to accept order:", error);

      // Revert the UI on error
      setActiveOrder(originalOrder);
      setOrders(originalOrders);
      // Optionally, display an error message to the user
      alert("Failed to accept order. Please try again.");
    }
  };

  const handleMarkReady = async (orderId: string) => {
    if (!activeOrder) return;

    const originalOrder = { ...activeOrder }; // Store original order
    const originalOrders = [...orders]; // Store original orders

    // Optimistically update the UI
    const updatedOrder = { ...activeOrder, status: "READY" };
    setActiveOrder(updatedOrder);
    setOrders((prevOrders) =>
      prevOrders.map((order) => (order.id === orderId ? updatedOrder : order)),
    );

    try {
      await fetch(`/api/orders/${orderId}/ready`, { method: "POST" });
    } catch (error) {
      console.error("Failed to mark order ready:", error);

      // Revert the UI on error
      setActiveOrder(originalOrder);
      setOrders(originalOrders);
      alert("Failed to mark order as ready. Please try again.");
    }
  };

  const handleHandOff = async (orderId: string) => {
    if (!activeOrder) return;

    const originalOrder = { ...activeOrder }; // Store original order
    const originalOrders = [...orders]; // Store original orders

    // Optimistically update the UI
    const updatedOrder = { ...activeOrder, status: "COMPLETED" };
    setActiveOrder(updatedOrder);
    setOrders((prevOrders) =>
      prevOrders.map((order) => (order.id === orderId ? updatedOrder : order)),
    );

    try {
      await fetch(`/api/orders/${orderId}/complete`, { method: "POST" });
    } catch (error) {
      console.error("Failed to complete order:", error);

      // Revert the UI on error
      setActiveOrder(originalOrder);
      setOrders(originalOrders);
      alert("Failed to complete order. Please try again.");
    }
  };

  const handlePrintReceipt = async (orderId: string) => {
    try {
      await fetch(`/api/orders/${orderId}/print`, { method: "POST" });
    } catch (error) {
      console.error("Failed to print receipt:", error);
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    if (!confirm("Are you sure you want to cancel this order?")) return;
    if (!activeOrder) return;

    const originalOrder = { ...activeOrder };
    const originalOrders = [...orders];

    // Optimistically update the UI
    const updatedOrder = { ...activeOrder, status: "CANCELED" };
    setActiveOrder(updatedOrder);
    setOrders((prevOrders) =>
      prevOrders.map((order) => (order.id === orderId ? updatedOrder : order)),
    );

    try {
      await fetch(`/api/orders/${orderId}/cancel`, {
        method: "POST",
        body: JSON.stringify({ orderId: orderId }),
      });
    } catch (error) {
      console.error("Failed to cancel order:", error);

      // Revert the UI on error
      setActiveOrder(originalOrder);
      setOrders(originalOrders);
      alert("Failed to cancel order. Please try again.");
    }
  };

  const handleCreateOrder = async (orderData: CreateOrderData) => {
    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        throw new Error("Failed to create order");
      }

      const newOrder = await response.json();

      // Add the new order to our state and refresh the list
      await fetchOrders();

      // Close the modal
      setShowCreateOrderModal(false);

      // Switch to the "new" tab and select the new order
      setActiveTab("new");

      // Play notification sound for new order
      playAudio();
    } catch (error) {
      console.error("Failed to create order:", error);
      alert("Failed to create order. Please try again.");
    }
  };

  const getDeliveryStatusColor = (status: string) => {
    const statusLower = status.toLowerCase();
    if (statusLower.includes("assigned"))
      return "bg-yellow-100 text-yellow-800";
    if (statusLower.includes("arriving"))
      return "bg-indigo-100 text-indigo-800";
    if (statusLower.includes("picked_up")) return "bg-blue-100 text-blue-800";
    if (statusLower.includes("dropp")) return "bg-green-100 text-green-800";
    if (statusLower.includes("scheduled"))
      return "bg-yellow-100 text-yellow-800";
    if (statusLower.includes("failed")) return "bg-red-100 text-red-800";
    return "bg-gray-100 text-gray-800";
  };

  const formatDeliveryStatus = (status: string) => {
    return status
      .toLowerCase()
      .replace(/_/g, " ")
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const formatDateTime = (dateString?: string) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Helper function to determine the correct action button based on order status
  const getActionButton = () => {
    if (!activeOrder) return null;

    if (activeOrder.status === "NEW") {
      return (
        <Button
          className="text-white w-full"
          onClick={() => setShowPrepTimeDialog(true)}
        >
          Accept
        </Button>
      );
    }

    if (
      activeOrder.status === "ACCEPTED" ||
      activeOrder.status === "PREPARING"
    ) {
      return (
        <Button
          className="bg-blue-500 hover:bg-blue-600 text-white w-full"
          onClick={() => handleMarkReady(activeOrder.id)}
        >
          <CheckCircle className="mr-1 h-4 w-4" />
          Mark as Ready
        </Button>
      );
    }

    if (activeOrder.status === "READY") {
      return (
        <Button
          className="bg-blue-500 hover:bg-blue-600 text-white w-full"
          onClick={() => handleHandOff(activeOrder.id)}
        >
          <span className="mr-2">✓</span> Hand off
        </Button>
      );
    }

    return null;
  };

  return (
    <div className="flex flex-col h-full mx-4">
      <audio
        ref={audioRef}
        src="https://upcdn.io/223k23J/raw/notification.mp3"
      />

      {/* Header */}
      <div className="bg-white p-3 flex items-center border-b relative top-0">
        <div className="flex-1">
          <div className="font-bold text-lg">
            Orders <ChevronDown className="inline h-4 w-4" />
          </div>
        </div>
        <div className="flex space-x-2">
          {/* Add Create Order button */}
          <Button
            variant="default"
            onClick={() => setShowCreateOrderModal(true)}
            className="mr-2"
          >
            <Plus className="h-4 w-4 mr-1" /> New Order
          </Button>

          <div className="relative">
            <Input placeholder="Search orders..." className="pl-8 w-[220px]" />
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
          </div>
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" className="relative">
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
        onValueChange={setActiveTab}
        className="w-full bg-white mb-4"
      >
        <TabsList className="grid grid-cols-3 pb-6 px-2">
          {Object.entries(groupedOrders).map(([tab, tabOrders]) => (
            <TabsTrigger key={tab} value={tab} className="relative">
              {tab === "new"
                ? "New"
                : tab === "inProgress"
                ? "In Progress"
                : "Completed"}
              <Badge className="ml-1 bg-gray-200 text-gray-800 hover:bg-gray-200">
                {tabOrders.length}
              </Badge>
              {tab === "new" && isSoundPlaying && tabOrders.length > 0 && (
                <Badge className="animate-pulse text-white">
                  <Bell className="mr-2 h-4 w-4" />
                  New Orders!
                </Badge>
              )}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* Main Content */}
      <div className="flex flex-1 relative">
        {/* Left Panel - Order List */}
        <div className="w-1/3 border-r overflow-y-scroll h-screen bg-white">
          {groupedOrders[activeTab as keyof typeof groupedOrders].length ===
          0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <Package className="h-12 w-12 mb-4" />
              <p>
                No {activeTab === "inProgress" ? "in progress" : activeTab}{" "}
                orders
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {groupedOrders[activeTab as keyof typeof groupedOrders].map(
                (order) => (
                  <div
                    key={order.id}
                    className={`p-3 cursor-pointer hover:bg-gray-50 ${
                      activeOrder?.id === order.id
                        ? "bg-blue-50 border-l-4 border-blue-500"
                        : ""
                    }`}
                    onClick={() => setActiveOrder(order)}
                  >
                    <div className="flex items-start gap-2">
                      <div
                        className={`h-8 w-8 rounded-md flex items-center justify-center text-white ${
                          order.status === "NEW"
                            ? "bg-yellow-500"
                            : ["ACCEPTED", "PREPARING"].includes(order.status)
                            ? "bg-blue-500"
                            : order.status === "READY"
                            ? "bg-green-500"
                            : order.status === "CANCELED"
                            ? "bg-red-500"
                            : "bg-gray-500"
                        }`}
                      >
                        {order.customerName.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center text-sm font-bold gap-2">
                           {order.customerName}
                        </div>
                        <div className="text-sm text-gray-500">
                        #{order.orderNumber}
                        </div>
                        <div className="text-xs text-gray-600">
                          {order.customerAddress ? "Delivery" : "Pickup"} • $
                          {order.total?.toFixed(2)}
                        </div>
                        {order.deliveryStatus && (
                          <Badge
                            className={`mt-1 ${getDeliveryStatusColor(
                              order.doordashStatus ? order.doordashStatus : "",
                            )}`}
                          >
                            {order.doordashStatus}
                          </Badge>
                        )}
                        {order.status === "CANCELED" && (
                          <Badge className="mt-1 bg-red-100 text-red-800">
                            CANCELED
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ),
              )}
            </div>
          )}
        </div>

        {/* Right Panel - Order Details */}
        <div className="flex-1 bg-white h-full sticky right-0 top-28">
          {activeOrder ? (
            <div className="flex flex-col h-full pb-16 ">
              {/* Order Header */}
              <div className="px-4 py-3 border-b">
                <div className="flex items-center gap-3">
                  <div
                    className={`h-10 w-10 rounded-md flex items-center justify-center text-white ${
                      activeOrder.status === "NEW"
                        ? "bg-yellow-500"
                        : ["ACCEPTED", "PREPARING"].includes(activeOrder.status)
                        ? "bg-blue-500"
                        : activeOrder.status === "READY"
                        ? "bg-green-500"
                        : activeOrder.status === "CANCELED"
                        ? "bg-red-500"
                        : "bg-gray-500"
                    }`}
                  >
                    {activeOrder.customerName.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-bold">
                      {activeOrder.customerName} 
                      </h2>
                      <Badge
                        className={`
                        ${
                          activeOrder.status === "NEW"
                            ? "bg-yellow-100 text-yellow-800"
                            : activeOrder.status === "ACCEPTED"
                            ? "bg-blue-100 text-blue-800"
                            : activeOrder.status === "PREPARING"
                            ? "bg-purple-100 text-purple-800"
                            : activeOrder.status === "READY"
                            ? "bg-green-100 text-green-800"
                            : activeOrder.status === "CANCELED"
                            ? "bg-red-100 text-red-800"
                            : "bg-gray-100 text-gray-800"
                        }
                      `}
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

              {/* Customer Contact Info */}
              <div className="px-4 py-3 bg-gray-50">
                <h3 className="text-sm font-medium mb-2">
                  Customer Information
                </h3>
                <div className="grid grid-cols-1 gap-2 text-sm">
                  {activeOrder.customerPhone && (
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 mr-2 text-gray-500" />
                      <span>{activeOrder.customerPhone}</span>
                    </div>
                  )}
                  {activeOrder.customerEmail && (
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 mr-2 text-gray-500" />
                      <span>{activeOrder.customerEmail}</span>
                    </div>
                  )}
                  {activeOrder.customerAddress && (
                    <div className="flex items-start mt-1">
                      <MapPin className="h-4 w-4 mr-2 text-gray-500 mt-0.5" />
                      <span>{activeOrder.customerAddress}</span>
                    </div>
                  )}
                  {activeOrder.notes && (
                    <div className="flex items-start mt-1">
                      <AlertCircle className="h-4 w-4 mr-2 text-gray-500 mt-0.5" />
                      <span className="text-gray-700">{activeOrder.notes}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Delivery Info */}
              {activeOrder.deliveryStatus && (
                <div className="px-4 py-3 bg-gray-50">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-gray-500">Delivery Status</div>
                      <Badge
                        className={getDeliveryStatusColor(
                          activeOrder.doordashStatus || "",
                        )}
                      >
                        {activeOrder?.doordashStatus}
                      </Badge>
                    </div>
                    {activeOrder.tracking_url && (
                      <div>
                        <a
                          href={activeOrder.tracking_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center text-blue-600 hover:underline"
                        >
                          <ExternalLink className="mr-1 h-4 w-4" />
                          Track Delivery
                        </a>
                      </div>
                    )}
                    {activeOrder.pickup_time_estimated && (
                      <div>
                        <div className="text-gray-500">Estimated Pickup</div>
                        <div className="flex items-center">
                          <Clock className="mr-1 h-4 w-4" />
                          {formatDateTime(activeOrder.pickup_time_estimated)}
                        </div>
                      </div>
                    )}
                    {activeOrder.dropoff_time_estimated && (
                      <div>
                        <div className="text-gray-500">Estimated Delivery</div>
                        <div className="flex items-center">
                          <MapPin className="mr-1 h-4 w-4" />
                          {formatDateTime(activeOrder.dropoff_time_estimated)}
                        </div>
                      </div>
                    )}
                    {activeOrder.dasherName && (
                      <div>
                        <div className="text-gray-500">Courier</div>
                        <div>{activeOrder.dasherName}</div>
                        {activeOrder.dasherPhone && (
                          <div className="text-gray-600">
                            {activeOrder.dasherPhone}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
              {/* Order Items */}
              <div className="px-4 py-2">
                <div className="text-sm font-medium mb-2">Order Items</div>
                {activeOrder.items.map((item, idx) => (
                  <div key={idx} className="py-2 flex items-start">
                    <div className="w-8 text-center">{item.quantity}</div>
                    <div className="flex-1">{item.name}</div>
                    <div>
                      ${((item.price || 0) * (item.quantity || 0))?.toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
              {/* Transaction Details */}
              <div className="px-4 py-2">
                <div className="text-gray-500 text-sm my-2">
                  Transaction details
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>${activeOrder.subtotal?.toFixed(2)}</span>
                  </div>
                  {activeOrder.tax > 0 && (
                    <div className="flex justify-between">
                      <span>Tax</span>
                      <span>${activeOrder.tax?.toFixed(2)}</span>
                    </div>
                  )}
                  {activeOrder.deliveryFee !== undefined && (
                    <div className="flex justify-between">
                      <span>Delivery Fee</span>
                      <span>${activeOrder.deliveryFee?.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-medium">
                    <span>Total</span>
                    <span>${activeOrder.total?.toFixed(2)}</span>
                  </div>
                </div>
              </div>
              {/* Sticky Actions bar */}
              <div className="static top-0 bottom-0 right-0 p-3 border-t flex items-center gap-2 bg-transparent shadow-md">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handlePrintReceipt(activeOrder.id)}
                >
                  <Printer className="h-5 w-5" />
                </Button>

                {/* Only show cancel button if order is not completed or canceled */}
                {!["COMPLETED", "CANCELED"].includes(activeOrder.status) && (
                  <Button
                    variant="outline"
                    onClick={() => handleCancelOrder(activeOrder.id)}
                    className="text-red-600 border-red-200"
                  >
                    Cancel Order
                  </Button>
                )}

                <div className="flex-1">{getActionButton()}</div>
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

      {/* Modals */}
      {activeOrder && (
        <PrepTimeSetter
          order={activeOrder as any}
          open={showPrepTimeDialog}
          onClose={() => setShowPrepTimeDialog(false)}
          onConfirm={handleAcceptOrder}
        />
      )}

  

      {/* Create Order Modal */}
      <CreateOrderModal
        open={showCreateOrderModal}
        onClose={() => setShowCreateOrderModal(false)}
        onCreateOrder={handleCreateOrder}
        // Replace with your actual store ID or get from context/props
      />
    </div>
  );
}
