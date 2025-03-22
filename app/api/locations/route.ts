// app/api/locations/route.ts
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const address = searchParams.get('address');

  if (!address) {
    return NextResponse.json(
      { error: 'Address parameter is required' },
      { status: 400 }
    );
  }

  try {
    // Replace with actual geocoding and location filtering logic
    const mockLocations = [
      {
        id: '1',
        name: 'Just Chik\'n',
        address: ' 376 Jefferson Rd, Rochester, NY 14623, USA',
        openUntil: '10:00 PM',
        distance: 0.6,
      },
 
    ];

    return NextResponse.json(mockLocations);
  } catch (error) {
    console.error('Error fetching locations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch locations' },
      { status: 500 }
    );
  }
}
