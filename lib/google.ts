"use server";

import { Client } from "@googlemaps/google-maps-services-js";

const client = new Client();

export const autocomplete = async (input: string) => {
  if (!input) return [];

  try {
    const response = await client.placeAutocomplete({
      params: {
        input,
        key: process.env.NEXT_PUBLIC_GOOGLE_API_KEY!, // Use your API key
      },
    });

    return response.data.predictions;
  } catch (error) {
    console.error("Error fetching autocomplete predictions:", error);
    return [];
  }
};
