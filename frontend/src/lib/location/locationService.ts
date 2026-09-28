import { storage } from "@/lib/localStorage/storage";
import { LocationData, reverseGeocode } from "./reverseGeocode";

const LOCATION_KEY = "nivaas_current_location";

const DEFAULT_LOCATION: LocationData = {
  city: "Kakinada",
  locality: null,
  district: null,
  state: "Andhra Pradesh",
  country: "India",
  formattedName: "Kakinada",
  source: "manual",
  updatedAt: new Date().toISOString(),
};

export const locationService = {
  getLocation(): LocationData {
    return storage.get<LocationData>(LOCATION_KEY, DEFAULT_LOCATION);
  },

  setLocation(data: LocationData) {
    storage.set(LOCATION_KEY, data);
    window.dispatchEvent(new Event("nivaas-location-change"));
  },

  setManualLocation(name: string) {
    const data: LocationData = {
      city: name,
      locality: null,
      district: null,
      state: null,
      country: null,
      formattedName: name,
      source: "manual",
      updatedAt: new Date().toISOString(),
    };
    this.setLocation(data);
  },

  async requestCurrentLocation(): Promise<LocationData> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Browser does not support geolocation"));
        return;
      }
      
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          try {
            const data = await reverseGeocode(pos.coords.latitude, pos.coords.longitude);
            this.setLocation(data);
            resolve(data);
          } catch (err) {
            // Fallback if reverse geocoding fails
            const fallback: LocationData = {
              latitude: pos.coords.latitude,
              longitude: pos.coords.longitude,
              city: "Current Location",
              locality: null,
              district: null,
              state: null,
              country: null,
              formattedName: "Location selected",
              source: "geolocation",
              updatedAt: new Date().toISOString(),
            };
            this.setLocation(fallback);
            resolve(fallback);
          }
        },
        (error) => {
          let message = "Location permission was not granted.";
          if (error.code === error.POSITION_UNAVAILABLE) message = "Position unavailable.";
          if (error.code === error.TIMEOUT) message = "Location request timed out.";
          reject(new Error(message));
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    });
  }
};
