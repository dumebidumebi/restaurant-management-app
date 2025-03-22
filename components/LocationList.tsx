// components/LocationList.tsx
import { useLocationStore } from "../stores/useLocationStore";

interface LocationListProps {
  locations: any[];
  isLoading: boolean;
}

export default function LocationList({
  locations,
  isLoading,
}: LocationListProps) {
  const { selectedLocation, setSelectedLocation } = useLocationStore();

  if (isLoading) {
    return <div className="text-center py-4">Loading locations...</div>;
  }

  if (locations.length === 0) {
    return (
      <div className="text-center font-light py-4">
        Enter an address to find nearby locations
      </div>
    );
  }

  return (
    <div className="space-y-2 max-h-80 overflow-y-auto">
      {locations.map((location) => (
        <LocationItem
          key={location.id}
          location={location}
          isSelected={selectedLocation?.id === location.id}
          onSelect={() => setSelectedLocation(location)}
        />
      ))}
    </div>
  );
}

interface LocationItemProps {
  location: any;
  isSelected: boolean;
  onSelect: () => void;
}

function LocationItem({ location, isSelected, onSelect }: LocationItemProps) {
  return (
    <div
      className={`p-3 border rounded-lg flex justify-between items-center cursor-pointer hover:bg-gray-50 ${
        isSelected ? "border-black bg-gray-100" : ""
      }`}
      onClick={onSelect}
    >
      <div>
        <h3 className="font-bold">{location.name}</h3>
        <p className="text-gray-600">Open until {location.openUntil}</p>
        <p className="text-gray-600 text-sm">{location.address}</p>
      </div>
      <div className="flex items-center">
        {/* {location.distance && (
          <span className="text-green-600 text-sm mr-3">
            {location.distance} miles
          </span>
        )} */}
        <div
          className={`w-6 h-6 rounded-full border ${
            isSelected ? "bg-black border-black" : "border-gray-300"
          }`}
        >
          {isSelected && (
            <div className="w-2 h-2 mx-auto mt-2 rounded-full bg-white"></div>
          )}
        </div>
      </div>
    </div>
  );
}
