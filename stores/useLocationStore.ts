import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

type DeliveryType = "pickup" | "delivery";
type TimeOption = "asap" | "scheduled";

interface LocationState {
  isOpen: boolean;
  deliveryType: DeliveryType;
  searchAddress: string;
  selectedLocation: {
    id: string;
    name: string;
    address: string;
    openUntil: string;
    distance?: number;
  } | null;
  timeOption: TimeOption;
  scheduledTime: string | null;
  scheduledDate: string | null;
  deliveryAddress: string;
  deliveryApt: string;
  deliveryInstructions: string;
  recipientFirstName: string;
  recipientLastName: string;
  recipientPhone: string;

  // Actions
  setOpen: (isOpen: boolean) => void;
  setDeliveryType: (type: DeliveryType) => void;
  setSearchAddress: (address: string) => void;
  setSelectedLocation: (location: LocationState["selectedLocation"]) => void;
  setTimeOption: (option: TimeOption) => void;
  setScheduledTime: (time: string | null) => void;
  setScheduledDate: (date: string | null) => void;
  setDeliveryAddress: (address: string) => void;
  setDeliveryApt: (apt: string) => void;
  setDeliveryInstructions: (instructions: string) => void;
  setRecipientFirstName: (name: string) => void;
  setRecipientLastName: (name: string) => void;
  setRecipientPhone: (phone: string) => void;
  reset: () => void;
  isComplete: () => boolean;
  clearStore: () => void;
}

const LOCAL_STORAGE_KEY = "zustand:location-store";

// Create the store with persistence middleware
export const useLocationStore = create<LocationState>()(
  persist(
    (set, get) => ({
      isOpen: true,
      deliveryType: "pickup",
      searchAddress: "",
      selectedLocation: null,
      timeOption: "asap",
      scheduledTime: null,
      scheduledDate: null,
      deliveryAddress: "",
      deliveryApt: "",
      deliveryInstructions: "",
      recipientFirstName: "",
      recipientLastName: "",
      recipientPhone: "",

      setOpen: (isOpen) => set({ isOpen }),
      setDeliveryType: (type) => set({ deliveryType: type }),
      setSearchAddress: (address) => set({ searchAddress: address }),
      setSelectedLocation: (location) => set({ selectedLocation: location }),
      setTimeOption: (option) => set({ timeOption: option }),
      setScheduledTime: (time) => set({ scheduledTime: time }),
      setScheduledDate: (date) => set({ scheduledDate: date }),
      setDeliveryAddress: (address) => set({ deliveryAddress: address }),
      setDeliveryApt: (apt) => set({ deliveryApt: apt }),
      setDeliveryInstructions: (instructions) =>
        set({ deliveryInstructions: instructions }),
      setRecipientFirstName: (name) => set({ recipientFirstName: name }),
      setRecipientLastName: (name) => set({ recipientLastName: name }),
      setRecipientPhone: (phone) => set({ recipientPhone: phone }),

      reset: () =>
        set({
          deliveryType: "pickup",
          searchAddress: "",
          selectedLocation: null,
          timeOption: "asap",
          scheduledTime: null,
          scheduledDate: null,
          deliveryAddress: "",
          deliveryApt: "",
          deliveryInstructions: "",
          recipientFirstName: "",
          recipientLastName: "",
          recipientPhone: "",
        }),

      // stores/useLocationStore.ts
      isComplete: () => {
        const state = get();
        if (state.selectedLocation === null) return false;

        // Require recipient info for both pickup and delivery
        const hasRecipientInfo =
          !!state.recipientFirstName &&
          !!state.recipientLastName &&
          !!state.recipientPhone;

        if (state.deliveryType === "pickup") {
          return hasRecipientInfo;
        } else {
          return hasRecipientInfo && !!state.deliveryAddress;
        }
      },

      clearStore: () => {
        // This will only clear the state, persistence middleware will handle
        // clearing localStorage
        get().reset();
      },
    }),
    {
      name: LOCAL_STORAGE_KEY, // name of the item in storage
      storage: createJSONStorage(() => localStorage), // use localStorage
      // Optional: include only specific fields to persist
      partialize: (state) => ({
        ...state,
        // Don't persist the isOpen flag, we want it true only for initial visit
        isOpen: state.isComplete() ? false : true,
      }),
    }
  )
);
