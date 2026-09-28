export interface LocationData {
  latitude?: number;
  longitude?: number;
  city: string | null;
  locality: string | null;
  district: string | null;
  state: string | null;
  country: string | null;
  formattedName: string;
  source: "manual" | "geolocation";
  updatedAt: string;
}

export async function reverseGeocode(lat: number, lon: number): Promise<LocationData> {
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=14&addressdetails=1`, {
      headers: {
        'Accept-Language': 'en-US,en;q=0.9',
        'User-Agent': 'NivaasRealEstateApp/1.0'
      }
    });
    
    if (!res.ok) throw new Error("Reverse geocoding failed");
    
    const data = await res.json();
    const address = data.address || {};
    
    const locality = address.suburb || address.neighbourhood || address.village || address.town || null;
    const city = address.city || address.town || address.county || null;
    const district = address.state_district || null;
    const state = address.state || null;
    const country = address.country || null;
    
    let formattedName = "Unknown Location";
    if (locality && city) {
      formattedName = `${locality}, ${city}`;
    } else if (city) {
      formattedName = city;
    } else if (locality) {
      formattedName = locality;
    } else if (district) {
      formattedName = district;
    } else if (state) {
      formattedName = state;
    }
    
    return {
      latitude: lat,
      longitude: lon,
      city,
      locality,
      district,
      state,
      country,
      formattedName,
      source: "geolocation",
      updatedAt: new Date().toISOString()
    };
  } catch (error) {
    console.error("Reverse geocoding error:", error);
    throw error;
  }
}
