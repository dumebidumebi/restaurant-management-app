// app/dashboard/order-history/page.tsx
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { format } from "date-fns";
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import { Loader2, ChevronDown, ChevronUp, Search, Printer } from "lucide-react";

type OrderItem = {
  id: string;
  name: string;
  quantity: number;
  price: number;
  notes?: string;
};

type Order = {
  id: string;
  orderNumber: string;
  status: string;
  items: OrderItem[];
  total: number;
  customerName: string;
  customerPhone?: string;
  customerEmail?: string;
  customerAddress?: string;
  notes?: string;
  createdAt: string;
  estimatedPickupTime?: string;
  paymentStatus?: string;
};

type CachedOrders = {
  [key: string]: {
    orders: Order[];
    timestamp: number;
  };
};

export default function OrderHistoryPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState("today");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const printRef = useRef<HTMLDivElement>(null);
  
  // In-memory cache for orders data
  const [orderCache, setOrderCache] = useState<CachedOrders>({});
  
  // Keep track of which periods are being fetched to avoid duplicate requests
  const fetchingRef = useRef<Set<string>>(new Set());

  // Function to actually fetch orders from API
  const fetchOrdersFromAPI = useCallback(async (filter: string, query: string = "") => {
    const cacheKey = `${filter}:${query || "none"}`;
    
    // Don't fetch if already fetching this key
    if (fetchingRef.current.has(cacheKey)) {
      return null;
    }
    
    fetchingRef.current.add(cacheKey);
    
    try {
      const response = await fetch("/api/orders/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          timeFilter: filter,
          searchQuery: query,
        }),
      });
  
      const data = await response.json();
      
      if (response.ok) {
        let orderData: Order[] = [];
        
        // Parse the response data if needed
        if (typeof data.orders === 'string') {
          try {
            orderData = JSON.parse(data.orders);
          } catch (e) {
            console.error("Error parsing orders:", e);
            orderData = [];
          }
        } else if (Array.isArray(data.orders)) {
          orderData = data.orders;
        }
        
        // Update the cache
        setOrderCache(prev => ({
          ...prev,
          [cacheKey]: {
            orders: orderData,
            timestamp: Date.now()
          }
        }));
        
        return orderData;
      }
      
      return null;
    } catch (error) {
      console.error("Error fetching orders:", error);
      return null;
    } finally {
      fetchingRef.current.delete(cacheKey);
    }
  }, []);

  // Main function to fetch orders with cache consideration
  const fetchOrders = useCallback(async (filter: string, query: string = "", updateState: boolean = true) => {
    if (updateState) {
      setLoading(true);
    }
    
    const cacheKey = `${filter}:${query || "none"}`;
    const cachedData = orderCache[cacheKey];
    
    // Check cache and if it's fresh (less than 30 seconds old)
    if (cachedData && Date.now() - cachedData.timestamp < 30000) {
      console.log("Using cached data for", filter);
      if (updateState) {
        setOrders(cachedData.orders);
        setLoading(false);
      }
      return cachedData.orders;
    }
    
    // Fetch fresh data
    const orderData = await fetchOrdersFromAPI(filter, query);
    
    if (updateState && orderData) {
      setOrders(orderData);
      setLoading(false);
    }
    
    return orderData;
  }, [fetchOrdersFromAPI, orderCache]);

  // Prefetch data for a specific filter
  const prefetchOrders = useCallback((filter: string) => {
    // Don't prefetch the current filter as we already have that data
    if (filter === timeFilter && !searchQuery) return;
    
    console.log("Prefetching", filter);
    fetchOrders(filter, "", false);
  }, [fetchOrders, timeFilter, searchQuery]);

  // Initial data load
  useEffect(() => {
    fetchOrders(timeFilter, searchQuery);
    
    // Prefetch "today" data when page loads if it's not already the active filter
    if (timeFilter !== "today") {
      prefetchOrders("today");
    }
  }, [timeFilter, searchQuery, fetchOrders, prefetchOrders]);

  // Prefetch on hover
  const handleTabHover = (filter: string) => {
    prefetchOrders(filter);
  };

  // Prefetch adjacent filters when a filter is selected
  useEffect(() => {
    // Map of adjacent filters to prefetch
    const adjacentFilters: Record<string, string[]> = {
      "today": ["yesterday", "thisWeek"],
      "yesterday": ["today", "thisWeek"],
      "thisWeek": ["today", "lastWeek"],
      "lastWeek": ["thisWeek", "thisMonth"],
      "thisMonth": ["lastWeek", "lastMonth"],
      "lastMonth": ["thisMonth"]
    };
    
    // Prefetch adjacent time periods
    const filtersToFetch = adjacentFilters[timeFilter] || [];
    filtersToFetch.forEach(filter => {
      setTimeout(() => prefetchOrders(filter), 300);
    });
  }, [timeFilter, prefetchOrders]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchOrders(timeFilter, searchQuery);
  };

  const handleOrderClick = (order: Order) => {
    setSelectedOrder(order.id === selectedOrder?.id ? null : order);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "NEW":
        return "bg-blue-500";
      case "ACCEPTED":
        return "bg-indigo-500";
      case "PREPARING":
        return "bg-amber-500";
      case "READY":
        return "bg-green-500";
      case "COMPLETED":
        return "bg-green-700";
      case "CANCELED":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "EUR",
    }).format(amount);
  };

  const printReceipt = () => {
    if (!selectedOrder) return;
    
    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    
    if (!printWindow) {
      alert("Please allow pop-ups to print receipts");
      return;
    }
    
    // Format date
    const orderDate = format(
      new Date(selectedOrder.createdAt),
      "MMM d, yyyy - h:mm a"
    );
    
    // Calculate subtotal
    const subtotal = selectedOrder.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    
    // Create receipt HTML
    const receiptHTML = `
      <html>
        <head>
          <title>Receipt #${selectedOrder.orderNumber}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              max-width: 300px;
              margin: 0 auto;
              padding: 20px;
              font-size: 12px;
            }
            h1 {
              font-size: 16px;
              text-align: center;
            }
            .header {
              text-align: center;
              margin-bottom: 20px;
            }
            .order-info {
              margin-bottom: 20px;
            }
            .items {
              width: 100%;
              margin-bottom: 20px;
            }
            .items th {
              text-align: left;
            }
            .items td {
              padding: 5px 0;
            }
            .total-row {
              border-top: 1px solid #000;
              font-weight: bold;
            }
            .amount {
              text-align: right;
            }
            .footer {
              text-align: center;
              margin-top: 30px;
              font-size: 10px;
            }
            @media print {
              body {
                margin: 0;
                padding: 10px;
              }
              .no-print {
                display: none;
              }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>ORDER RECEIPT</h1>
            <div>Order #${selectedOrder.orderNumber}</div>
            <div>${orderDate}</div>
          </div>
          
          <div class="order-info">
            <div><strong>Customer:</strong> ${selectedOrder.customerName}</div>
            ${selectedOrder.customerPhone ? `<div><strong>Phone:</strong> ${selectedOrder.customerPhone}</div>` : ''}
            ${selectedOrder.customerAddress ? `<div><strong>Address:</strong> ${selectedOrder.customerAddress}</div>` : '<div>Pickup order</div>'}
            ${selectedOrder.notes ? `<div><strong>Notes:</strong> ${selectedOrder.notes}</div>` : ''}
          </div>
          
          <table class="items">
            <thead>
              <tr>
                <th>Item</th>
                <th>Qty</th>
                <th class="amount">Price</th>
              </tr>
            </thead>
            <tbody>
              ${selectedOrder.items.map(item => `
                <tr>
                  <td>${item.name}</td>
                  <td>${item.quantity}</td>
                  <td class="amount">${formatCurrency(item.price * item.quantity)}</td>
                </tr>
              `).join('')}
              <tr class="total-row">
                <td colspan="2">Total</td>
                <td class="amount">${formatCurrency(selectedOrder.total)}</td>
              </tr>
            </tbody>
          </table>
          
          <div class="footer">
            Thank you for your order!
          </div>
          
          <div class="no-print" style="text-align: center; margin-top: 30px;">
            <button onclick="window.print();return false;">Print Receipt</button>
          </div>
        </body>
      </html>
    `;
    
    printWindow.document.open();
    printWindow.document.write(receiptHTML);
    printWindow.document.close();
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Order History</h1>

      <div className="mb-6">
        <Tabs defaultValue="today" value={timeFilter} onValueChange={setTimeFilter}>
          <TabsList className="grid grid-cols-6 mb-6">
            <TabsTrigger 
              value="today"
              onMouseEnter={() => handleTabHover("today")}
            >
              Today
            </TabsTrigger>
            <TabsTrigger 
              value="yesterday"
              onMouseEnter={() => handleTabHover("yesterday")}
            >
              Yesterday
            </TabsTrigger>
            <TabsTrigger 
              value="thisWeek"
              onMouseEnter={() => handleTabHover("thisWeek")}
            >
              This week
            </TabsTrigger>
            <TabsTrigger 
              value="lastWeek"
              onMouseEnter={() => handleTabHover("lastWeek")}
            >
              Last week
            </TabsTrigger>
            <TabsTrigger 
              value="thisMonth"
              onMouseEnter={() => handleTabHover("thisMonth")}
            >
              This month
            </TabsTrigger>
            <TabsTrigger 
              value="lastMonth"
              onMouseEnter={() => handleTabHover("lastMonth")}
            >
              Last month
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="mb-6">
        <form onSubmit={handleSearch} className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by order ID, customer name or phone"
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </form>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-48">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : !orders || !Array.isArray(orders) || orders.length === 0 ? (
        <Card>
          <CardContent className="p-6 flex flex-col items-center">
            <p className="text-lg text-center">No orders found</p>
            <p className="text-sm text-muted-foreground mt-2">
              Try changing your search or filter settings
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4" ref={printRef}>
          {orders.map((order) => (
            <Card
              key={order.id}
              className={`cursor-pointer ${
                selectedOrder?.id === order.id ? "border-primary" : ""
              }`}
              onClick={() => handleOrderClick(order)}
            >
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      #{order.orderNumber}
                      <Badge className={getStatusColor(order.status)}>
                        {order.status}
                      </Badge>
                    </CardTitle>
                    <CardDescription className="mt-1">
                      {format(new Date(order.createdAt), "MMM d, yyyy - h:mm a")}
                    </CardDescription>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">{order.customerName}</div>
                    <div className="text-sm text-muted-foreground">
                      {order.customerPhone || "No phone"}
                    </div>
                    <div className="font-medium mt-1">
                      {formatCurrency(order.total)}
                    </div>
                  </div>
                </div>
              </CardHeader>

              <Collapsible
                open={selectedOrder?.id === order.id}
                className="px-6 pb-4"
              >
                <CollapsibleTrigger asChild>
                  <div className="flex justify-center py-2">
                    {selectedOrder?.id === order.id ? (
                      <ChevronUp className="h-5 w-5 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="font-medium">Receipt Details</h3>
                        {selectedOrder?.id === order.id && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={(e) => {
                              e.stopPropagation();
                              printReceipt();
                            }}
                            className="flex items-center gap-1 text-xs"
                          >
                            <Printer className="h-3 w-3" />
                            Print Receipt
                          </Button>
                        )}
                      </div>
                      <ul className="space-y-2">
                        {order.items.map((item) => (
                          <li key={item.id} className="flex justify-between">
                            <span>
                              {item.quantity} x {item.name}
                            </span>
                            <span>{formatCurrency(item.price * item.quantity)}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h3 className="font-medium mb-2">Delivery Details</h3>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <p className="text-sm text-muted-foreground">Order Type</p>
                          <p>{order.customerAddress ? "Delivery" : "Pickup"}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Address</p>
                          <p>{order.customerAddress || "No delivery address"}</p>
                        </div>
                      </div>
                    </div>

                    {order.notes && (
                      <div>
                        <h3 className="font-medium mb-2">Notes</h3>
                        <p>{order.notes}</p>
                      </div>
                    )}

                    <div>
                      <h3 className="font-medium mb-2">Payment Status</h3>
                      <Badge
                        variant={order.paymentStatus === "paid" ? "default" : "destructive"}
                      >
                        {order.paymentStatus === "paid"
                          ? "Paid"
                          : "This order has not been paid yet"}
                      </Badge>
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
