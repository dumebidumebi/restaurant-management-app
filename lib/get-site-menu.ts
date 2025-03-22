export async function getSiteMenu(storeId: string) {
    const response = await fetch("/api/get-store-menu", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ storeId: storeId }),
    });
  
    if (!response.ok) {
      throw new Error("Failed to fetch items");
    }
  
    return response.json();
  }