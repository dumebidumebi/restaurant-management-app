import { useLocationStore } from "@/stores/useLocationStore";
import { Store, CarFront } from "lucide-react";

export default function LocationSummary() {
  const {
    selectedLocation,
    deliveryType,
    scheduledTime,
    scheduledDate,
    setDeliveryType,
    setOpen,
  } = useLocationStore();

  const handleOpenDialog = (type: "pickup" | "delivery") => {
    setDeliveryType(type); // Update the delivery type in the store
    setOpen(true); // Open the dialog
  };

  return (
    <div className=" border-b mx-8">
      {/* Location Information */}
      <div className="text-sm text-gray-500">
        {/* <p>Ordering from</p> */}
        <p className="text-lg font-bold">
          {selectedLocation?.name || "Select a location"}
        </p>
        <p>{selectedLocation?.address || "No address selected"}</p>
        <p className="text-gray-500">
          {selectedLocation?.openUntil
            ? `Open until ${selectedLocation.openUntil}`
            : ""}
        </p>
      </div>

      {/* Delivery Type and Time */}
      <div className="flex mb-6 border max-w-xs  rounded-full focus:outline-none focus:ring-0 overflow-hidden mt-4">
        {/* Pickup Button */}
        <button
          className={`flex-1 py-3 px-4 focus:outline-none focus:ring-0 flex items-center justify-center ${
            deliveryType === "pickup" ? "bg-white font-bold" : "bg-gray-100"
          }`}
          onClick={() => handleOpenDialog("pickup")}
        >
          <span className="mr-2">
            <Store className="w-5" />
          </span>
          Pickup
          {deliveryType === "pickup" && scheduledTime && scheduledDate && (
            <span className="ml-2 text-sm text-gray-500">
              {scheduledDate}, {scheduledTime}
            </span>
          )}
        </button>

        {/* Delivery Button */}
        <button
          className={`flex-1 py-3 px-4 focus:outline-none focus:ring-0 flex items-center justify-center ${
            deliveryType === "delivery" ? "bg-white font-bold" : "bg-gray-100"
          }`}
          onClick={() => handleOpenDialog("delivery")}
        >
          <span className="mr-2">
            <CarFront className="w-5" />
          </span>
          Delivery
        </button>
      </div>
    </div>
  );
}
