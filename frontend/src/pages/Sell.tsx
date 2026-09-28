import { useState, useRef } from "react";
import { useLocation, Link } from "wouter";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/_core/hooks/useAuth";
import { storage } from "@/lib/localStorage/storage";
import DashboardLayout from "@/components/DashboardLayout";
import { NivaasSelect } from "@/components/ui/NivaasSelect";
import { trpc } from "@/lib/trpc";
import { Camera, Image as ImageIcon, Star, Trash2, ArrowLeft, ArrowRight, Upload, MapPin, Navigation, Map, Sparkles } from "lucide-react";
import { parseSearchQuery } from "@shared/searchParser";
import { locationService } from "@/lib/location/locationService";
import { generateListingDraftFromImages } from "@/lib/aiListingAssistant";
import { findKnownCity, validateAndNormalizeLocation } from "@shared/locationUtils";

interface PhotoItem {
  id: string;
  url: string;
  file?: File;
  name: string;
  isPrimary: boolean;
}

export default function SellProperty() {
  const { user } = useAuth({ redirectOnUnauthenticated: true, redirectPath: "/sell" });
  const [, setLocation] = useLocation();
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    title: "",
    purpose: "buy",
    propertyType: "apartment",
    price: "",
    location: "",
    bedrooms: "",
    bathrooms: "",
    areaSqft: "",
    description: "",
  });

  const [locationData, setLocationData] = useState({
    city: "Amalapuram",
    locality: "",
    district: "Dr. B. R. Ambedkar Konaseema",
    state: "Andhra Pradesh",
    pincode: "533201",
    streetAddress: "",
    locationVisibility: "area_city" as "locality" | "area_city" | "full",
    latitude: 16.5787,
    longitude: 82.0061,
  });
  const [isLocating, setIsLocating] = useState(false);
  const [showMapPicker, setShowMapPicker] = useState(false);

  const handleUseCurrentLocation = async () => {
    try {
      setIsLocating(true);
      const loc = await locationService.requestCurrentLocation();
      if (loc.city) {
        const known = findKnownCity(loc.city);
        setLocationData(prev => ({
          ...prev,
          city: loc.city || prev.city,
          locality: loc.locality || prev.locality,
          district: loc.district || (known ? known.district : prev.district),
          state: loc.state || (known ? known.state : prev.state),
          latitude: loc.latitude || (known ? Number(known.latitude) : prev.latitude),
          longitude: loc.longitude || (known ? Number(known.longitude) : prev.longitude),
          pincode: (loc as any).pincode || (known ? known.pincode : prev.pincode),
        }));
      }
      toast.success(`Location detected: ${loc.formattedName}`);
    } catch (err: any) {
      toast.error(err.message || "Could not detect location. Please enter manually.");
    } finally {
      setIsLocating(false);
    }
  };

  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const utils = trpc.useUtils();
  const createPropertyMutation = trpc.catalog.createProperty.useMutation();

  const handleAiGenerateDraft = () => {
    if (photos.length === 0) {
      toast.info("Please upload at least 1 property photograph first.");
      return;
    }
    setIsAiGenerating(true);
    try {
      const draft = generateListingDraftFromImages({
        photos: photos.map(p => ({ name: p.name, url: p.url })),
        locationContext: locationData,
        preferredType: formData.propertyType,
        preferredPurpose: formData.purpose as any,
      });

      setFormData(prev => ({
        ...prev,
        title: draft.title,
        propertyType: draft.propertyType,
        purpose: draft.purpose,
        description: draft.description,
      }));

      if (draft.suggestedLocality && !locationData.locality) {
        setLocationData(prev => ({ ...prev, locality: draft.suggestedLocality }));
      }

      toast.success("AI draft generated from your photos! You can edit any detail before listing.");
    } catch (err: any) {
      toast.error("Could not generate draft. Please enter details manually.");
    } finally {
      setIsAiGenerating(false);
    }
  };

  if (!user) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleFilesSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (photos.length + files.length > 8) {
      toast.error("You can upload a maximum of 8 photos.");
    }

    const availableSlots = Math.max(0, 8 - photos.length);
    const selectedFiles = Array.from(files).slice(0, availableSlots);

    const newPhotos: PhotoItem[] = selectedFiles.map((file, idx) => {
      const id = "photo_" + Math.random().toString(36).substring(2, 9);
      const instantBlobUrl = URL.createObjectURL(file);
      const isPrimary = photos.length === 0 && idx === 0;

      // Also convert to persistent Data URL in background
      const reader = new FileReader();
      reader.onload = (ev) => {
        const dataUrl = ev.target?.result as string;
        if (dataUrl) {
          setPhotos(curr => curr.map(p => p.id === id ? { ...p, url: dataUrl } : p));
        }
      };
      reader.readAsDataURL(file);

      return {
        id,
        url: instantBlobUrl,
        file,
        name: file.name,
        isPrimary,
      };
    });

    setPhotos(prev => [...prev, ...newPhotos]);
    toast.success(`Added ${newPhotos.length} photo${newPhotos.length === 1 ? "" : "s"}`);

    // Reset file input so user can add more photos if needed
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRemovePhoto = (id: string) => {
    setPhotos(prev => {
      const filtered = prev.filter(p => p.id !== id);
      // If we removed the primary photo, assign primary to the first photo
      if (filtered.length > 0 && !filtered.some(p => p.isPrimary)) {
        filtered[0].isPrimary = true;
      }
      return filtered;
    });
  };

  const handleSetPrimary = (id: string) => {
    setPhotos(prev => prev.map(p => ({
      ...p,
      isPrimary: p.id === id,
    })));
  };

  const handleMovePhoto = (index: number, direction: "left" | "right") => {
    setPhotos(prev => {
      const copy = [...prev];
      const targetIndex = direction === "left" ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= copy.length) return prev;
      const temp = copy[index];
      copy[index] = copy[targetIndex];
      copy[targetIndex] = temp;
      return copy;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const normLoc = validateAndNormalizeLocation({
        city: locationData.city,
        locality: locationData.locality,
        district: locationData.district,
        state: locationData.state,
        pincode: locationData.pincode,
        streetAddress: locationData.streetAddress,
        latitude: locationData.latitude,
        longitude: locationData.longitude,
      });

      const baseSlug = formData.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "") || "property";
      const slug = `${baseSlug}-${Date.now().toString(36)}`;

      const primaryPhoto = photos.find(p => p.isPrimary) || photos[0];
      const coverUrl = primaryPhoto ? primaryPhoto.url : "/images/fallback-property.svg";
      const imagesList = photos.length > 0
        ? photos.map(p => ({ url: p.url, altText: formData.title }))
        : [{ url: "/images/fallback-property.svg", altText: formData.title }];

      const newProperty = {
        id: "prop_" + Date.now().toString(36),
        sellerId: user.id,
        sellerName: user.name,
        sellerType: "Verified Owner",
        sellerPhone: (user as any).phone || "+91 98480 12451",
        sellerEmail: user.email,
        title: formData.title,
        slug,
        purpose: formData.purpose,
        propertyType: formData.propertyType,
        price: Number(formData.price),
        location: normLoc.formattedLocation,
        locationName: normLoc.locality,
        locality: normLoc.locality,
        city: normLoc.city,
        district: normLoc.district,
        state: normLoc.state,
        pincode: normLoc.pincode,
        streetAddress: normLoc.streetAddress,
        locationVisibility: locationData.locationVisibility,
        latitude: normLoc.latitude,
        longitude: normLoc.longitude,
        bedrooms: formData.bedrooms ? Number(formData.bedrooms) : undefined,
        bathrooms: formData.bathrooms ? Number(formData.bathrooms) : undefined,
        areaSqft: formData.areaSqft ? Number(formData.areaSqft) : undefined,
        description: formData.description,
        imageUrl: coverUrl,
        images: imagesList,
        status: "published",
        verificationStatus: "verified",
        createdAt: Date.now(),
      };

      // 1. Publish to the canonical server catalog
      const result = await createPropertyMutation.mutateAsync({
        title: newProperty.title,
        slug: newProperty.slug,
        purpose: newProperty.purpose,
        propertyType: newProperty.propertyType,
        price: newProperty.price,
        location: newProperty.location,
        city: newProperty.city,
        locality: newProperty.locality,
        district: newProperty.district,
        state: newProperty.state,
        pincode: newProperty.pincode,
        streetAddress: newProperty.streetAddress,
        locationVisibility: newProperty.locationVisibility,
        latitude: newProperty.latitude,
        longitude: newProperty.longitude,
        bedrooms: newProperty.bedrooms,
        bathrooms: newProperty.bathrooms,
        areaSqft: newProperty.areaSqft,
        description: newProperty.description,
        sellerId: user.id,
        sellerName: user.name,
        sellerPhone: (user as any).phone || "+91 98480 12451",
        sellerEmail: user.email,
        imageUrl: newProperty.imageUrl,
        images: newProperty.images,
      });

      const published = result?.property || newProperty;

      // 2. Save to local storage for user's properties
      const localProps = storage.get<any[]>("nivaas_properties", []);
      const filtered = localProps.filter(p => p.slug !== published.slug && p.id !== published.id);
      filtered.unshift({ ...newProperty, ...published });
      storage.set("nivaas_properties", filtered);

      // Invalidate queries so Search, Home, and Detail update immediately
      await utils.catalog.search.invalidate();
      await utils.catalog.home.invalidate();

      toast.success("Property published successfully!");
      setLocation("/your-properties");
    } catch (err: any) {
      console.error("[Sell] Publish error:", err);
      toast.error(err?.message || "Failed to publish property. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl space-y-8 pb-16">
        <div className="mb-2">
          <Link href="/" className="inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--orange-dark)] hover:underline transition">
            ← Back Home
          </Link>
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">List your property</h1>
          <p className="text-muted-foreground mt-1">Reach genuine buyers and tenants in Kakinada, Amalapuram &amp; East Godavari.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* 1. Basic Details */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Basic Details</h2>
            
            <div>
              <label className="block text-sm font-semibold mb-1">Property Title *</label>
              <input 
                type="text" name="title" required value={formData.title} onChange={handleChange}
                placeholder="e.g. Well-Maintained 2 BHK Independent House in Sarpavaram"
                className="w-full rounded-xl border border-[var(--line-strong)] px-4 py-3 outline-none focus:border-[var(--ink)] focus:ring-1 bg-white"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <NivaasSelect 
                  label="Purpose *"
                  name="purpose" 
                  value={formData.purpose} 
                  onChange={(val) => setFormData(prev => ({ ...prev, purpose: val }))}
                  triggerClassName="bg-white border-[var(--line-strong)]"
                  options={[
                    { value: "buy", label: "For Sale" },
                    { value: "rent", label: "For Rent" },
                    { value: "pg", label: "PG / Co-Living" },
                    { value: "commercial", label: "Commercial" }
                  ]}
                />
              </div>
              <div>
                <NivaasSelect 
                  label="Property Type *"
                  name="propertyType" 
                  value={formData.propertyType} 
                  onChange={(val) => setFormData(prev => ({ ...prev, propertyType: val }))}
                  triggerClassName="bg-white border-[var(--line-strong)]"
                  options={[
                    { value: "apartment", label: "Apartment" },
                    { value: "independent-house", label: "Independent House" },
                    { value: "villa", label: "Villa" },
                    { value: "plot", label: "Plot / Land" },
                    { value: "shop", label: "Commercial Shop" },
                    { value: "office", label: "Commercial Office" },
                    { value: "pg", label: "PG / Co-Living" }
                  ]}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1">
                {formData.purpose === "rent" ? "Monthly Rent (₹) *" : "Price (₹) *"}
              </label>
              <input 
                type="number" name="price" required min="0" value={formData.price} onChange={handleChange}
                placeholder={formData.purpose === "rent" ? "e.g. 14000" : "e.g. 4500000"}
                className="w-full rounded-xl border border-[var(--line-strong)] px-4 py-3 outline-none focus:border-[var(--ink)] focus:ring-1 bg-white"
              />
            </div>
          </div>

          {/* 2. Property Location & Privacy */}
          <div className="space-y-5 pt-4 border-t border-[var(--line)]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-[var(--orange)]" /> Property Location
                </h2>
                <p className="text-xs text-[var(--muted-ink)] mt-0.5">
                  Provide accurate locality details for local buyers in East Godavari / Konaseema.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleUseCurrentLocation}
                  disabled={isLocating}
                  className="rounded-xl border-[var(--line-strong)] text-xs font-semibold hover:bg-stone-50 flex items-center gap-1.5 h-9"
                >
                  <Navigation className={`h-3.5 w-3.5 ${isLocating ? 'animate-spin text-[var(--orange)]' : 'text-[var(--orange)]'}`} />
                  {isLocating ? "Locating..." : "Use my location"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowMapPicker(!showMapPicker)}
                  className="rounded-xl border-[var(--line-strong)] text-xs font-semibold hover:bg-stone-50 flex items-center gap-1.5 h-9"
                >
                  <Map className="h-3.5 w-3.5 text-[var(--orange)]" />
                  {showMapPicker ? "Hide Map" : "Choose on Map"}
                </Button>
              </div>
            </div>

            {/* Optional Map Picker / Preview */}
            {showMapPicker && (
              <div className="rounded-2xl border border-[var(--line-strong)] bg-stone-50 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[var(--ink)]">Interactive Map Pin</span>
                  <span className="text-xs text-[var(--muted-ink)]">
                    {locationData.latitude && locationData.longitude
                      ? `Coordinates: ${Number(locationData.latitude).toFixed(4)}, ${Number(locationData.longitude).toFixed(4)}`
                      : "Click preset locality below or use GPS to pin coordinates"}
                  </span>
                </div>
                <div className="overflow-hidden rounded-xl border border-[var(--line)] bg-white h-52 relative">
                  <iframe
                    title="Map Location Picker"
                    width="100%"
                    height="100%"
                    frameBorder="0"
                    scrolling="no"
                    marginHeight={0}
                    marginWidth={0}
                    src={`https://www.openstreetmap.org/export/embed.html?bbox=${(locationData.longitude || 82.2475) - 0.02}%2C${(locationData.latitude || 16.9891) - 0.02}%2C${(locationData.longitude || 82.2475) + 0.02}%2C${(locationData.latitude || 16.9891) + 0.02}&layer=mapnik&marker=${locationData.latitude || 16.9891}%2C${locationData.longitude || 82.2475}`}
                    className="w-full h-full"
                  />
                </div>
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <span className="text-xs font-semibold text-[var(--muted-ink)]">Quick Pins:</span>
                  {[
                    { name: "Amalapuram Town", city: "Amalapuram", lat: 16.5787, lon: 82.0061, dist: "Dr. B. R. Ambedkar Konaseema", pin: "533201" },
                    { name: "Amalapuram - Sriramnagar", city: "Amalapuram", locality: "Sriramnagar", lat: 16.5810, lon: 82.0120, dist: "Dr. B. R. Ambedkar Konaseema", pin: "533201" },
                    { name: "Kakinada - Sarpavaram", city: "Kakinada", locality: "Sarpavaram", lat: 16.9942, lon: 82.2532, dist: "Kakinada", pin: "533005" },
                    { name: "Kakinada - Ramanayyapeta", city: "Kakinada", locality: "Ramanayyapeta", lat: 16.9780, lon: 82.2390, dist: "Kakinada", pin: "533003" },
                    { name: "Kakinada - Jagannaickpur", city: "Kakinada", locality: "Jagannaickpur", lat: 16.9482, lon: 82.2312, dist: "Kakinada", pin: "533002" },
                  ].map(preset => (
                    <button
                      key={preset.name}
                      type="button"
                      onClick={() => {
                        setLocationData(prev => ({
                          ...prev,
                          city: preset.city,
                          locality: preset.locality || prev.locality || preset.city,
                          district: preset.dist,
                          pincode: preset.pin,
                          latitude: preset.lat,
                          longitude: preset.lon,
                        }));
                        toast.success(`Pinned ${preset.name}`);
                      }}
                      className="rounded-full bg-white px-2.5 py-1 text-xs font-medium text-[var(--ink)] border border-[var(--line-strong)] hover:border-[var(--orange)]"
                    >
                      📍 {preset.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Structured Form Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-1">City / Town *</label>
                <input
                  type="text"
                  name="city"
                  required
                  value={locationData.city}
                  onChange={(e) => {
                    const val = e.target.value;
                    const known = findKnownCity(val);
                    setLocationData(prev => ({
                      ...prev,
                      city: val,
                      district: known ? known.district : prev.district,
                      state: known ? known.state : prev.state,
                      pincode: known ? known.pincode : prev.pincode,
                      latitude: known ? Number(known.latitude) : prev.latitude,
                      longitude: known ? Number(known.longitude) : prev.longitude,
                    }));
                  }}
                  placeholder="e.g. Amalapuram, Kakinada, Rajahmundry"
                  className="w-full rounded-xl border border-[var(--line-strong)] px-4 py-3 outline-none focus:border-[var(--ink)] focus:ring-1 bg-white"
                />
                <div className="flex gap-2 mt-1.5">
                  {["Amalapuram", "Kakinada", "Rajahmundry", "Ravulapalem"].map(c => {
                    const isSelected = locationData.city.toLowerCase() === c.toLowerCase();
                    return (
                      <button
                        key={c}
                        type="button"
                        onClick={() => {
                          const known = findKnownCity(c);
                          setLocationData(prev => ({
                            ...prev,
                            city: c,
                            district: known ? known.district : prev.district,
                            state: known ? known.state : prev.state,
                            pincode: known ? known.pincode : prev.pincode,
                            latitude: known ? Number(known.latitude) : prev.latitude,
                            longitude: known ? Number(known.longitude) : prev.longitude,
                          }));
                        }}
                        className={`text-[11px] px-2.5 py-0.5 rounded-full border font-medium transition ${isSelected ? 'bg-[var(--orange)] text-white border-[var(--orange)] shadow-xs' : 'bg-stone-100 text-[var(--muted-ink)] border-stone-200 hover:bg-stone-200'}`}
                      >
                        {c}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1">Locality / Area Name *</label>
                <input
                  type="text"
                  name="locality"
                  required
                  value={locationData.locality}
                  onChange={(e) => setLocationData(prev => ({ ...prev, locality: e.target.value }))}
                  placeholder="e.g. Sriramnagar, Ramanayyapeta, College Road..."
                  className="w-full rounded-xl border border-[var(--line-strong)] px-4 py-3 outline-none focus:border-[var(--ink)] focus:ring-1 bg-white"
                />
                <p className="text-[11px] text-[var(--muted-ink)] mt-1">Specific neighborhood where property is situated.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-1">District</label>
                <input
                  type="text"
                  name="district"
                  value={locationData.district}
                  onChange={(e) => setLocationData(prev => ({ ...prev, district: e.target.value }))}
                  placeholder="e.g. Dr. B. R. Ambedkar Konaseema"
                  className="w-full rounded-xl border border-[var(--line-strong)] px-4 py-3 outline-none focus:border-[var(--ink)] focus:ring-1 bg-white"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1">State</label>
                <input
                  type="text"
                  name="state"
                  value={locationData.state}
                  onChange={(e) => setLocationData(prev => ({ ...prev, state: e.target.value }))}
                  placeholder="e.g. Andhra Pradesh"
                  className="w-full rounded-xl border border-[var(--line-strong)] px-4 py-3 outline-none focus:border-[var(--ink)] focus:ring-1 bg-white"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1">PIN Code</label>
                <input
                  type="text"
                  name="pincode"
                  value={locationData.pincode}
                  onChange={(e) => setLocationData(prev => ({ ...prev, pincode: e.target.value }))}
                  placeholder="e.g. 533201"
                  className="w-full rounded-xl border border-[var(--line-strong)] px-4 py-3 outline-none focus:border-[var(--ink)] focus:ring-1 bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1">Street / Landmark / Colony (Optional)</label>
              <input
                type="text"
                name="streetAddress"
                value={locationData.streetAddress}
                onChange={(e) => setLocationData(prev => ({ ...prev, streetAddress: e.target.value }))}
                placeholder="e.g. Near Venkateswara Temple, 2nd Cross, Main Road"
                className="w-full rounded-xl border border-[var(--line-strong)] px-4 py-3 outline-none focus:border-[var(--ink)] focus:ring-1 bg-white"
              />
              <p className="text-[11px] text-[var(--muted-ink)] mt-1">Exact house number is not required to protect your residence privacy.</p>
            </div>

            {/* Location Visibility / Privacy Control */}
            <div className="rounded-2xl border border-[var(--line-strong)] bg-stone-50 p-4 space-y-2">
              <div>
                <label className="block text-sm font-bold text-[var(--ink)]">Location Visibility</label>
                <p className="text-xs text-[var(--muted-ink)] mt-0.5">
                  Choose how much location information you want to show publicly to buyers.
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                {[
                  { value: "locality", label: "Locality only", desc: "e.g. 📍 Sriramnagar, Amalapuram" },
                  { value: "area_city", label: "Area + City (Recommended)", desc: "e.g. 📍 Sriramnagar, Amalapuram, Andhra Pradesh" },
                  { value: "full", label: "Full Address", desc: "Shows complete street & landmark entered" },
                ].map(opt => (
                  <label
                    key={opt.value}
                    className={`flex flex-col p-3 rounded-xl border cursor-pointer transition ${locationData.locationVisibility === opt.value ? 'border-[var(--orange)] bg-[#fff7ef] shadow-sm' : 'border-[var(--line)] bg-white hover:bg-stone-50'}`}
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="locationVisibility"
                        value={opt.value}
                        checked={locationData.locationVisibility === opt.value}
                        onChange={() => setLocationData(prev => ({ ...prev, locationVisibility: opt.value as any }))}
                        className="text-[var(--orange)] focus:ring-[var(--orange)]"
                      />
                      <span className="text-xs font-bold text-[var(--ink)]">{opt.label}</span>
                    </div>
                    <span className="text-[11px] text-[var(--muted-ink)] mt-1.5 pl-5">{opt.desc}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Live Location Preview */}
            <div className="rounded-2xl border border-[var(--orange)] bg-[#fff9f4] p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white text-[var(--orange)] shadow-sm">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--orange-dark)]">
                      Location Preview (What buyers will see on listing)
                    </p>
                    <p className="text-base font-bold text-[var(--ink)] mt-0.5">
                      📍 {locationData.locality.trim() && locationData.locality.trim() !== locationData.city ? `${locationData.locality.trim()}, ${locationData.city}` : locationData.city}
                    </p>
                    <p className="text-xs text-[var(--muted-ink)] mt-1">
                      {locationData.locationVisibility === "locality"
                        ? locationData.state
                        : [
                            locationData.streetAddress && locationData.locationVisibility === "full" ? locationData.streetAddress : null,
                            locationData.district ? `${locationData.district} district` : null,
                            locationData.state,
                            locationData.pincode
                          ].filter(Boolean).join(", ")}
                    </p>
                    <p className="text-[11px] text-[var(--orange-dark)] font-medium mt-1">
                      Visibility: {locationData.locationVisibility === "locality" ? "Locality only" : locationData.locationVisibility === "full" ? "Full address" : "Area + City"}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  {locationData.latitude && locationData.longitude && (
                    <span className="text-[11px] bg-white font-medium text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200">
                      ✓ Map pinned
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* 3. Property Photos Upload */}
          <div className="space-y-4 pt-4 border-t border-[var(--line)]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <Camera className="h-5 w-5 text-[var(--orange)]" /> Property Photos
                </h2>
                <p className="text-xs text-[var(--muted-ink)] mt-0.5">
                  Add up to 8 real photos of your property. The photo marked "Cover" will appear on search cards.
                </p>
              </div>
              <input
                type="file"
                ref={fileInputRef}
                multiple
                accept="image/*"
                className="hidden"
                onChange={handleFilesSelected}
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={photos.length >= 8}
                className="self-start sm:self-auto rounded-xl border-[var(--orange)] text-[var(--orange-dark)] hover:bg-[var(--peach)] font-semibold flex items-center gap-2"
              >
                <Upload className="h-4 w-4" /> Add Photos ({photos.length}/8)
              </Button>
            </div>

            {/* AI Listing Assistant Banner */}
            {photos.length > 0 && (
              <div className="rounded-2xl border border-[var(--orange)] bg-[#fff9f4] p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[var(--orange)] text-white shadow-xs">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-[var(--ink)] flex items-center gap-1.5">
                      AI Listing Assistant <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">Exact Photo Truth</span>
                    </h4>
                    <p className="text-xs text-[var(--muted-ink)] mt-0.5">
                      Auto-fills title, property type, and visual description strictly based on your uploaded photos. Your exact photographs remain untouched.
                    </p>
                  </div>
                </div>
                <Button
                  type="button"
                  onClick={handleAiGenerateDraft}
                  disabled={isAiGenerating}
                  className="shrink-0 bg-[var(--orange)] text-white hover:bg-[var(--orange-dark)] font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-sm"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  {isAiGenerating ? "Analyzing Photos..." : "Auto-Fill from Photo"}
                </Button>
              </div>
            )}

            {photos.length === 0 ? (
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="cursor-pointer rounded-2xl border-2 border-dashed border-[var(--line-strong)] bg-stone-50 p-8 text-center hover:border-[var(--orange)] hover:bg-[var(--sand)] transition duration-200"
              >
                <div className="mx-auto w-12 h-12 rounded-full bg-[var(--peach)] flex items-center justify-center text-[var(--orange)] mb-3">
                  <ImageIcon className="h-6 w-6" />
                </div>
                <p className="font-bold text-sm text-[var(--ink)]">Click to browse or drop property photos here</p>
                <p className="text-xs text-[var(--muted-ink)] mt-1">Supports JPG, PNG, WebP up to 10MB each</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {photos.map((photo, index) => (
                  <div key={photo.id} className="relative group rounded-xl border border-[var(--line-strong)] overflow-hidden bg-white shadow-sm aspect-[4/3]">
                    <img src={photo.url} alt={photo.name} className="w-full h-full object-cover" />
                    
                    {/* Primary Badge */}
                    {photo.isPrimary && (
                      <div className="absolute top-2 left-2 bg-[var(--orange)] text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow flex items-center gap-1">
                        <Star className="h-3 w-3 fill-white" /> Cover Photo
                      </div>
                    )}

                    {/* Action Overlay */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
                      <div className="flex justify-between items-center">
                        {!photo.isPrimary && (
                          <button
                            type="button"
                            onClick={() => handleSetPrimary(photo.id)}
                            className="text-[11px] bg-white/90 text-[var(--ink)] hover:bg-white font-bold px-2 py-1 rounded shadow"
                          >
                            Set Cover
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleRemovePhoto(photo.id)}
                          className="ml-auto p-1.5 rounded-full bg-red-600 text-white hover:bg-red-700 shadow"
                          title="Remove photo"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      <div className="flex items-center justify-center gap-2">
                        {index > 0 && (
                          <button
                            type="button"
                            onClick={() => handleMovePhoto(index, "left")}
                            className="p-1 rounded bg-white/80 text-[var(--ink)] hover:bg-white text-xs"
                            title="Move left"
                          >
                            <ArrowLeft className="h-3.5 w-3.5" />
                          </button>
                        )}
                        {index < photos.length - 1 && (
                          <button
                            type="button"
                            onClick={() => handleMovePhoto(index, "right")}
                            className="p-1 rounded bg-white/80 text-[var(--ink)] hover:bg-white text-xs"
                            title="Move right"
                          >
                            <ArrowRight className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 3. Features */}
          <div className="space-y-4 pt-4 border-t border-[var(--line)]">
            <h2 className="text-xl font-semibold">Features (Optional)</h2>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-1">Bedrooms</label>
                <input 
                  type="number" name="bedrooms" min="0" value={formData.bedrooms} onChange={handleChange} 
                  placeholder="e.g. 2"
                  className="w-full rounded-xl border border-[var(--line-strong)] px-4 py-3 outline-none focus:border-[var(--ink)] focus:ring-1 bg-white" 
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Bathrooms</label>
                <input 
                  type="number" name="bathrooms" min="0" value={formData.bathrooms} onChange={handleChange} 
                  placeholder="e.g. 2"
                  className="w-full rounded-xl border border-[var(--line-strong)] px-4 py-3 outline-none focus:border-[var(--ink)] focus:ring-1 bg-white" 
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Area (sq.ft.)</label>
                <input 
                  type="number" name="areaSqft" min="0" value={formData.areaSqft} onChange={handleChange} 
                  placeholder="e.g. 1200"
                  className="w-full rounded-xl border border-[var(--line-strong)] px-4 py-3 outline-none focus:border-[var(--ink)] focus:ring-1 bg-white" 
                />
              </div>
            </div>
          </div>

          {/* 4. Description */}
          <div className="space-y-4 pt-4 border-t border-[var(--line)]">
            <h2 className="text-xl font-semibold">Description</h2>
            <div>
              <textarea 
                name="description" rows={5} value={formData.description} onChange={handleChange}
                placeholder="Describe your property in detail (e.g. ventilation, floor, nearby landmarks, water supply, parking)..."
                className="w-full rounded-xl border border-[var(--line-strong)] px-4 py-3 outline-none focus:border-[var(--ink)] focus:ring-1 resize-y bg-white"
              />
            </div>
          </div>

          <Button type="submit" disabled={loading} className="w-full sm:w-auto min-h-12 rounded-xl bg-[var(--orange)] hover:bg-[var(--orange-dark)] text-white font-bold transition px-8 text-lg">
            {loading ? "Publishing listing..." : "Publish Property"}
          </Button>
        </form>
      </div>
    </DashboardLayout>
  );
}
