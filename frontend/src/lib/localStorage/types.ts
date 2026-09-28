export type AccountType = "buyer" | "seller";

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  accountType: AccountType;
  preferredLanguage?: string;
  location?: LocationData;
  avatarUrl?: string;
  termsAccepted?: boolean;
  privacyAccepted?: boolean;
  termsVersion?: string;
  privacyVersion?: string;
  termsAcceptedAt?: string;
  privacyAcceptedAt?: string;
}

export interface LocationData {
  city: string;
  locality?: string;
  latitude?: number;
  longitude?: number;
}

export interface Session {
  token: string;
  userId: string;
  expiresAt?: number;
}

export interface SavedSearch {
  id: string;
  location: string;
  purpose: string;
  propertyType: string;
  budget?: number;
  createdAt: number;
}

export interface PropertyListing {
  id: string;
  sellerId: string;
  title: string;
  purpose: string;
  propertyType: string;
  price: number;
  location: string;
  bedrooms?: number;
  bathrooms?: number;
  areaSqft?: number;
  description?: string;
  amenities?: string[];
  images?: string[];
  status: "published" | "paused" | "sold" | "rented";
  createdAt: number;
}

export interface Enquiry {
  id: string;
  propertyId: string;
  buyerId: string;
  sellerId: string;
  message: string;
  status: "new" | "contacted" | "viewing" | "closed";
  createdAt: number;
}

export interface Message {
  id: string;
  enquiryId: string;
  senderId: string;
  text: string;
  createdAt: number;
  read: boolean;
}

export interface Notification {
  id: string;
  userId: string;
  type: string;
  message: string;
  read: boolean;
  createdAt: number;
  link?: string;
}
