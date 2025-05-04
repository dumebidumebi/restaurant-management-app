// interfaces/index.ts (or wherever you define types)

// Example CartItem structure (adjust based on your actual store)
export interface CartModifier {
    id?: string;
    name: string;
    price: number;
    stripePriceId?: string | null;
  }
  
  export interface CartItem {
    id: string; // Assuming internal ID
    name: string;
    price: number; // Price in dollars
    quantity: number;
    stripePriceId?: string | null;
    modifiers?: CartModifier[] | null;
    notes?: string | null;
    // Add other relevant fields like description, imageUrl if needed by OrderSummary
  }
  
  // Example LocationStore structure (adjust based on your actual store)
  export interface LocationState {
    deliveryType: "pickup" | "delivery";
    selectedLocation: { id: string; name?: string } | null; // Example
    deliveryAddress: string | null;
    deliveryApt: string | null;
    deliveryInstructions: string | null;
    recipientFirstName: string | null;
    recipientLastName: string | null;
    recipientPhone: string | null;
    // customerEmail: string | null; // Added email
    // Add other fields from your store
  }
  
  // Props for InternalCheckoutForm
  export interface InternalCheckoutFormProps {
    cartItems: CartItem[];
    tipAmount: number; // In dollars
    locationData: LocationState;
    onProcessing: (isProcessing: boolean) => void;
    onError: (message: string | null) => void;
    onSuccess: (orderId: string, paymentStatus: string) => void;
  }
  