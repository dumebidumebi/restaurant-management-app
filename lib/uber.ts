// utils/uberAuth.js
export async function getUberAuthToken() {
    const params = new URLSearchParams();
    if (! process.env.UBER_DIRECT_CLIENT_ID )return
    if (! process.env.UBER_DIRECT_CLIENT_SECRET) return 
    params.append("client_id", process.env.UBER_DIRECT_CLIENT_ID || "");
    params.append("client_secret", process.env.UBER_DIRECT_CLIENT_SECRET || "");
    params.append("grant_type", "client_credentials");
    params.append("scope", "eats.deliveries");
  
    try {
      const response = await fetch("https://auth.uber.com/oauth/v2/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: params,
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
  
      return await response.json();

    } catch (error) {
      console.error("Error fetching Uber auth token:", error);
      throw error;
    }
  }
  


/**
 * Gets delivery quotes from Uber API
 * @param {string} authToken - Bearer token from authentication
 * @param {object} pickupAddress - Pickup address object
 * @param {object} dropoffAddress - Dropoff address object
 * @returns {Promise<any>} Delivery quotes response
 */
export async function getUberDeliveryQuotes({
    authToken,
    pickupAddress,
    dropoffAddress,
  }: {
    authToken: string;
    pickupAddress: object;
    dropoffAddress: object;
  }): Promise<any> {
    if (!authToken) {
      throw new Error("Auth token is required");
    }
  
    if (!process.env.UBER_DIRECT_CUSTOMER_ID) {
      throw new Error("UBER_CUSTOMER_ID environment variable is required");
    }
  
    // Convert address objects to JSON strings exactly as required by the API
    const pickupAddressString = JSON.stringify(pickupAddress);
    const dropoffAddressString = JSON.stringify(dropoffAddress);

    console.log("authToken: " + authToken)
  
    try {
      const response = await fetch(
        `https://api.uber.com/v1/customers/${process.env.UBER_DIRECT_CUSTOMER_ID}/delivery_quotes`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({
            pickup_address: pickupAddressString,
            dropoff_address: dropoffAddressString,
          }),
        }
      );
  
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `HTTP error! Status: ${response.status}, Details: ${errorText}`
        );
      }
  
      return await response.json();
    } catch (error) {
      console.error("Error fetching Uber delivery quotes:", error);
      throw error;
    }
  }
  