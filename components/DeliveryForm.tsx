import { useLocationStore } from "../stores/useLocationStore";
import AddressSearch, { AddressSearchProps } from "./AddressSearch";

export default function DeliveryForm({ onAddressSelected }: AddressSearchProps) {
  const {
    deliveryAddress,
    deliveryApt,
    deliveryInstructions,
    recipientFirstName,
    recipientLastName,
    recipientPhone,
    setDeliveryAddress,
    setDeliveryApt,
    setDeliveryInstructions,
    setRecipientFirstName,
    setRecipientLastName,
    setRecipientPhone,
  } = useLocationStore();

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold">Drop-off details</h3>

      {/* Address Search */}
      <div>
        <label className="block text-sm font-medium mb-1">
          Drop-off address <span className="text-red-500">*</span>
        </label>
        <AddressSearch
          onAddressSelected={(address) => {
            onAddressSelected(address)
            setDeliveryAddress(address)}} // Update deliveryAddress when an address is selected
        />
      </div>

      {/* Apartment/Suite */}
      <div>
        <label className="block text-sm font-medium mb-1">
          Apt / Suite / Floor
        </label>
        <input
          type="text"
          className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="E.g. Apt 101"
          value={deliveryApt}
          onChange={(e) => setDeliveryApt(e.target.value)}
        />
      </div>

      {/* Instructions */}
      <div>
        <label className="block text-sm font-medium mb-1">
          Drop-off instructions
        </label>
        <textarea
          className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="e.g. Go to front desk."
          rows={3}
          value={deliveryInstructions}
          onChange={(e) => setDeliveryInstructions(e.target.value)}
        />
      </div>

      {/* Recipient Info */}
      <div>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              First name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Recipient name"
              value={recipientFirstName}
              onChange={(e) => setRecipientFirstName(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Last name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Recipient name"
              value={recipientLastName}
              onChange={(e) => setRecipientLastName(e.target.value)}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Contact number <span className="text-red-500">*</span>
          </label>
          <div className="flex">
            <div className="w-16 flex items-center justify-center border border-r-0 rounded-l-lg bg-gray-50">
              <div className="flex items-center">
                <span className="mr-1">🇺🇸</span>
                <span>+1</span>
              </div>
            </div>
            <input
              type="tel"
              className="flex-1 p-3 border rounded-r-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Phone number"
              value={recipientPhone}
              onChange={(e) => setRecipientPhone(e.target.value)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
