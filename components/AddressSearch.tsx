"use client";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { autocomplete } from "@/lib/google";
import { useLocationStore } from "@/stores/useLocationStore";
import { PlaceAutocompleteResult } from "@googlemaps/google-maps-services-js";
import { useEffect, useState } from "react";

export interface AddressSearchProps {
  onAddressSelected: (address: string) => void;
}

export default function AddressSearch({ onAddressSelected }: AddressSearchProps) {
  const [predictions, setPredictions] = useState<PlaceAutocompleteResult[]>([]);
  const [input, setInput] = useState("");
  const {
    isOpen,
    deliveryType,
    selectedLocation,
    setDeliveryType,
    isComplete,
    setOpen,
  } = useLocationStore();

  useEffect(() => {
    const fetchPredictions = async () => {
      if (!input) {
        setPredictions([]);
        return;
      }

      const predictions = await autocomplete(input);
      setPredictions(predictions ?? []);
    };

    fetchPredictions();
  }, [input]);

  const handleSelect = (description: string) => {
    setInput(description); // Update the input field with the selected address
    onAddressSelected(description); // Pass the selected address to the parent component

    setPredictions([]); // Clear predictions after selection
  };

  return (
    <div className="w-full">
      <Command>
        <CommandInput
          placeholder="Enter your address"
          value={input}
          onValueChange={setInput}
        />
        <CommandList>
          {/* <CommandEmpty>No suggestions found.</CommandEmpty> */}
          <CommandGroup heading="">
            {predictions.map((prediction) => (
              <CommandItem
                key={prediction.place_id}
                onSelect={() => handleSelect(prediction.description)}
              >
                {prediction.description}
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandSeparator />
        </CommandList>
      </Command>
    </div>
  );
}
