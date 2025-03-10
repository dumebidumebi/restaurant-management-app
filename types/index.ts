// types/index.ts
export interface OrderItem {
    id: string;
    name: string;
    quantity: number;
    price: number;
    prepTime?: number;
  }
  
  export interface Order {
    id: string;
    orderNumber: string;
    customerName: string;
    customerAddress?: string;
    status: "NEW" | "ACCEPTED" | "PREPARING" | "READY" | "COMPLETED";
    items: OrderItem[];
    notes?: string;
    prepTime?: number;
    subtotal: number;
    tax: number;
    deliveryFee?: number;
    total: number;
    createdAt: string;
    updatedAt: string;
  }
  
  export type OrderItemTimer = {
    prepTime: number;
    startTime: number;
  };
  
  export type OrderTimers = {
    [itemId: string]: OrderItemTimer;
  };
  
  export interface OrderTimersMap {
    [orderId: string]: OrderTimers;
  }
  