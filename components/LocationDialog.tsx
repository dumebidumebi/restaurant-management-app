// components/LocationDialog.tsx
import { useEffect, useState } from "react";
import { useLocationStore } from "../stores/useLocationStore";

import DeliveryForm from "./DeliveryForm";
import AddressSearch from "./AddressSearch";
import LocationList from "./LocationList";
import TimeSelector from "./TimeSelector";
import { CarFront, Store } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Input } from "./ui/input";

export default function LocationDialog() {
  const {
    isOpen,
    deliveryType,
    selectedLocation,
    setDeliveryType,
    isComplete,
    setOpen,
    // Add recipient fields and setters
    recipientFirstName,
    recipientLastName,
    recipientPhone,
    setRecipientFirstName,
    setRecipientLastName,
    setRecipientPhone,
  } = useLocationStore();

  const [locations, setLocations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Check if location data is complete on mount
  useEffect(() => {
    // If location is already complete, don't show the dialog
    if (isComplete()) {
      setOpen(false);
    }
  }, []);

  // Fetch locations based on address
  const fetchLocations = async (address: string) => {
    setIsLoading(true);
    try {
      // In production, replace with your actual API endpoint
      const response = await fetch(
        `/api/locations?address=${encodeURIComponent(address)}`
      );
      const data = await response.json();
      setLocations(data);
    } catch (error) {
      console.error("Error fetching locations:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen}>
      <DialogContent className="max-w-lg max-h-screen overflow-scroll">
        <DialogHeader>
          <DialogTitle>Select location</DialogTitle>
        </DialogHeader>

        {/* Pickup/Delivery Tabs */}
        <div className="flex mb-6 border rounded-full focus:outline-none focus:ring-0 overflow-hidden">
          <button
            className={`flex-1 py-3 px-4 focus:outline-none focus:ring-0 flex items-center justify-center ${
              deliveryType === "pickup" ? "bg-white font-bold " : "bg-gray-100 "
            }`}
            onClick={() => setDeliveryType("pickup")}
          >
            <span className="mr-2">
              <Store className="w-5" />
            </span>
            Pickup
          </button>
          <button
            className={`flex-1 py-3 px-4 focus:outline-none focus:ring-0 flex items-center justify-center ${
              deliveryType === "delivery"
                ? "bg-white font-bold"
                : "bg-gray-100 "
            }`}
            onClick={() => setDeliveryType("delivery")}
          >
            <span className="mr-2">
              <CarFront className="w-5" />
            </span>
            Delivery
          </button>
        </div>
        {/* Add recipient fields for pickup */}
        {selectedLocation && deliveryType === "pickup" && (
          <div className="mb-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="pickupFirstName">First Name</Label>
              <Input
                id="pickupFirstName"
                value={recipientFirstName}
                onChange={(e) => setRecipientFirstName(e.target.value)}
                placeholder="First name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="pickupLastName">Last Name</Label>
              <Input
                id="pickupLastName"
                value={recipientLastName}
                onChange={(e) => setRecipientLastName(e.target.value)}
                placeholder="Last name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="pickupPhone">Phone Number</Label>
              <Input
                id="pickupPhone"
                value={recipientPhone}
                onChange={(e) => setRecipientPhone(e.target.value)}
                placeholder="Phone number"
                type="tel"
              />
            </div>
          </div>
        )}
        {/* Address Search */}
        {deliveryType === "pickup" && (
          <div className="mb-6">
            <AddressSearch
              onAddressSelected={(address) => fetchLocations(address)}
            />
          </div>
        )}

        {/* Delivery Form */}
        {deliveryType === "delivery" && (
          <div className="mb-6">
            <DeliveryForm
              onAddressSelected={(address) => fetchLocations(address)}
            />
          </div>
        )}

        {/* Location List */}
        <div className="mb-6">
          <LocationList locations={locations} isLoading={isLoading} />
        </div>

        {/* Time Selection */}
        {selectedLocation && (
          <div className="mb-6">
            <TimeSelector />
          </div>
        )}

        {/* View Menu Button */}
        <Button
          className={`w-full py-3 rounded-lg flex items-center justify-center ${
            isComplete() ? "" : "bg-gray-200 text-gray-500 cursor-not-allowed"
          }`}
          disabled={!isComplete()}
          onClick={() => setOpen(false)} // Add this line
        >
          View Menu <span className="ml-2">→</span>
        </Button>
      </DialogContent>
    </Dialog>
  );
}
