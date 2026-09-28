import { storage } from "@/lib/localStorage/storage";
import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { startLogin } from "@/const";
import { useAuth } from "@/_core/hooks/useAuth";

export interface SavedPropertyItem {
  id: string;
  propertyId: number | string;
  slug: string;
  userId: string;
  createdAt: number;
  property: any;
}

const FAVORITES_STORAGE_KEY = "user_favorites";
export const FAVORITES_EVENT = "nivaas-favorites-updated";

export const favoritesManager = {
  getAllFavorites(): SavedPropertyItem[] {
    return storage.get<SavedPropertyItem[]>(FAVORITES_STORAGE_KEY, []);
  },

  getUserFavorites(userId: string): SavedPropertyItem[] {
    if (!userId) return [];
    return this.getAllFavorites().filter((item) => String(item.userId) === String(userId));
  },

  isSaved(property: any, userId?: string): boolean {
    if (!property || !userId) return false;
    const propId = String(property.id ?? "");
    const propSlug = String(property.slug ?? "");
    const userFavs = this.getUserFavorites(userId);
    return userFavs.some(
      (item) =>
        (propId && String(item.propertyId) === propId) ||
        (propSlug && String(item.slug) === propSlug)
    );
  },

  toggle(property: any, user: any): boolean {
    if (!user) {
      toast.info("Please sign in to save properties to your account.");
      startLogin(window.location.pathname);
      return false;
    }

    const userId = String(user.id);
    const propId = property.id ?? Date.now();
    const propSlug = property.slug || `property-${propId}`;
    const all = this.getAllFavorites();

    const existingIndex = all.findIndex(
      (item) =>
        String(item.userId) === userId &&
        (String(item.propertyId) === String(propId) || String(item.slug) === String(propSlug))
    );

    let isNowSaved = false;

    if (existingIndex >= 0) {
      // Remove
      all.splice(existingIndex, 1);
      storage.set(FAVORITES_STORAGE_KEY, all);
      isNowSaved = false;
      toast.success("Removed from saved properties");
    } else {
      // Add
      const newItem: SavedPropertyItem = {
        id: `fav_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        propertyId: propId,
        slug: propSlug,
        userId: userId,
        createdAt: Date.now(),
        property: {
          id: propId,
          slug: propSlug,
          title: property.title,
          price: property.price,
          rentPeriod: property.rentPeriod,
          purpose: property.purpose,
          propertyType: property.propertyType,
          bedrooms: property.bedrooms,
          bathrooms: property.bathrooms,
          areaSqft: property.areaSqft,
          locality: property.locality || property.locationName,
          city: property.city,
          state: property.state,
          imageUrl: property.imageUrl || (property.images?.[0]?.url ?? null),
          imageAlt: property.imageAlt || property.title,
          verificationStatus: property.verificationStatus,
        },
      };
      all.unshift(newItem);
      storage.set(FAVORITES_STORAGE_KEY, all);
      isNowSaved = true;
      toast.success("Saved to your properties");
    }

    // Broadcast update across the app and open tabs
    window.dispatchEvent(
      new CustomEvent(FAVORITES_EVENT, {
        detail: {
          propertyId: propId,
          slug: propSlug,
          userId: userId,
          isSaved: isNowSaved,
        },
      })
    );

    return isNowSaved;
  },

  remove(propertyIdOrSlug: string | number, userId: string): void {
    if (!userId) return;
    const all = this.getAllFavorites();
    const target = String(propertyIdOrSlug);
    const updated = all.filter(
      (item) =>
        !(
          String(item.userId) === String(userId) &&
          (String(item.propertyId) === target || String(item.slug) === target)
        )
    );
    storage.set(FAVORITES_STORAGE_KEY, updated);

    window.dispatchEvent(
      new CustomEvent(FAVORITES_EVENT, {
        detail: {
          propertyId: propertyIdOrSlug,
          userId: userId,
          isSaved: false,
        },
      })
    );
  },
};

/**
 * React hook to synchronize favorite state across components,
 * with optimistic updates and immediate persistence.
 */
export function useFavorites(property?: any) {
  const { user } = useAuth();
  const [isSaved, setIsSaved] = useState<boolean>(() => {
    if (!property || !user) return false;
    return favoritesManager.isSaved(property, user.id);
  });
  const [userFavorites, setUserFavorites] = useState<SavedPropertyItem[]>(() => {
    if (!user) return [];
    return favoritesManager.getUserFavorites(user.id);
  });

  const refresh = useCallback(() => {
    if (!user) {
      setIsSaved(false);
      setUserFavorites([]);
      return;
    }
    const favs = favoritesManager.getUserFavorites(user.id);
    setUserFavorites(favs);
    if (property) {
      setIsSaved(favoritesManager.isSaved(property, user.id));
    }
  }, [user, property]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    const handleUpdate = (event: Event) => {
      const customEvent = event as CustomEvent;
      const detail = customEvent.detail;
      if (!user) return;
      if (detail && detail.userId && String(detail.userId) !== String(user.id)) return;

      if (property) {
        const propId = String(property.id ?? "");
        const propSlug = String(property.slug ?? "");
        if (
          !detail ||
          String(detail.propertyId) === propId ||
          String(detail.slug) === propSlug
        ) {
          setIsSaved(favoritesManager.isSaved(property, user.id));
        }
      }
      setUserFavorites(favoritesManager.getUserFavorites(user.id));
    };

    const handleStorage = (e: StorageEvent) => {
      if (e.key && e.key.includes("favorites")) {
        refresh();
      }
    };

    window.addEventListener(FAVORITES_EVENT, handleUpdate);
    window.addEventListener("storage", handleStorage);
    window.addEventListener("nivaas-auth-change", refresh);

    return () => {
      window.removeEventListener(FAVORITES_EVENT, handleUpdate);
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("nivaas-auth-change", refresh);
    };
  }, [user, property, refresh]);

  const toggle = useCallback(() => {
    if (!property) return false;
    // Optimistic toggle
    const nextSavedState = !isSaved;
    setIsSaved(nextSavedState);
    const result = favoritesManager.toggle(property, user);
    if (result !== nextSavedState) {
      setIsSaved(result);
    }
    return result;
  }, [property, user, isSaved]);

  return {
    isSaved,
    toggle,
    userFavorites,
    refresh,
    count: userFavorites.length,
  };
}
