import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { NivaasSelect } from "@/components/ui/NivaasSelect";
import { MapPin, Navigation, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { storage } from "@/lib/localStorage/storage";
import { locationService } from "@/lib/location/locationService";
import { findKnownCity, validateAndNormalizeLocation } from "@shared/locationUtils";

interface EditPropertyDialogProps {
  property: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdated?: (updatedProp: any) => void;
}

export function EditPropertyDialog({ property, open, onOpenChange, onUpdated }: EditPropertyDialogProps) {
  const utils = trpc.useUtils();
  const updateMutation = trpc.catalog.updateProperty.useMutation();

  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [purpose, setPurpose] = useState("buy");
  const [propertyType, setPropertyType] = useState("apartment");
  const [description, setDescription] = useState("");

  // Location fields
  const [city, setCity] = useState("Kakinada");
  const [locality, setLocality] = useState("");
  const [district, setDistrict] = useState("Kakinada");
  const [state, setState] = useState("Andhra Pradesh");
  const [pincode, setPincode] = useState("533001");
  const [streetAddress, setStreetAddress] = useState("");
  const [locationVisibility, setLocationVisibility] = useState<"locality" | "area_city" | "full">("area_city");
  const [latitude, setLatitude] = useState<string | number | undefined>(undefined);
  const [longitude, setLongitude] = useState<string | number | undefined>(undefined);

  const [isChangingLocation, setIsChangingLocation] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (property) {
      setTitle(property.title || "");
      setPrice(String(property.price || ""));
      setPurpose(property.purposeSlug || property.purpose?.toLowerCase() || "buy");
      setPropertyType(property.propertyTypeSlug || property.propertyType?.toLowerCase() || "apartment");
      setDescription(property.description || "");

      const pCity = property.city || (property.locationName?.toLowerCase().includes("amalapuram") ? "Amalapuram" : (property.location?.toLowerCase().includes("amalapuram") ? "Amalapuram" : (property.city || "Amalapuram")));
      const known = findKnownCity(pCity);
      setCity(pCity);
      setLocality(property.locality || property.locationName || pCity);
      setDistrict(property.district || (known ? known.district : "Dr. B. R. Ambedkar Konaseema"));
      setState(property.state || (known ? known.state : "Andhra Pradesh"));
      setPincode(property.pincode || (known ? known.pincode : "533201"));
      setStreetAddress(property.streetAddress || "");
      setLocationVisibility(property.locationVisibility || "area_city");
      setLatitude(property.latitude || (known ? known.latitude : undefined));
      setLongitude(property.longitude || (known ? known.longitude : undefined));
      setIsChangingLocation(false);
    }
  }, [property, open]);

  const handleUseLocation = async () => {
    try {
      setIsLocating(true);
      const loc = await locationService.requestCurrentLocation();
      if (loc.city) {
        const known = findKnownCity(loc.city);
        setCity(loc.city);
        if (loc.locality) setLocality(loc.locality);
        setDistrict(loc.district || (known ? known.district : district));
        setState(loc.state || (known ? known.state : state));
        setPincode((loc as any).pincode || (known ? known.pincode : pincode));
        if (loc.latitude && loc.longitude) {
          setLatitude(loc.latitude);
          setLongitude(loc.longitude);
        } else if (known) {
          setLatitude(known.latitude);
          setLongitude(known.longitude);
        }
      }
      toast.success(`Location updated to ${loc.formattedName}`);
    } catch (err: any) {
      toast.error(err.message || "Failed to retrieve location.");
    } finally {
      setIsLocating(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!property) return;
    setSaving(true);

    try {
      const normLoc = validateAndNormalizeLocation({
        city,
        locality,
        district,
        state,
        pincode,
        streetAddress,
        latitude,
        longitude,
      });

      const updatePayload = {
        id: property.id,
        slug: property.slug,
        title,
        price: Number(price),
        purpose,
        propertyType,
        description,
        location: normLoc.formattedLocation,
        locationName: normLoc.locality,
        locality: normLoc.locality,
        city: normLoc.city,
        district: normLoc.district,
        state: normLoc.state,
        pincode: normLoc.pincode,
        streetAddress: normLoc.streetAddress,
        locationVisibility,
        latitude: normLoc.latitude,
        longitude: normLoc.longitude,
      };

      // 1. Update in backend catalog
      const res = await updateMutation.mutateAsync(updatePayload);

      // 2. Update in browser local storage
      const localProps = storage.get<any[]>("nivaas_properties", []);
      const updatedLocalProps = localProps.map(p => {
        if (p.id === property.id || p.slug === property.slug) {
          return { ...p, ...updatePayload };
        }
        return p;
      });
      storage.set("nivaas_properties", updatedLocalProps);

      // Also update saved properties (favorites) if this property was saved
      const savedProps = storage.get<any[]>("nivaas_favorites", []);
      if (savedProps.some(p => p.slug === property.slug || p.id === property.id)) {
        const updatedFavorites = savedProps.map(p => {
          if (p.slug === property.slug || p.id === property.id) {
            return { ...p, ...updatePayload };
          }
          return p;
        });
        storage.set("nivaas_favorites", updatedFavorites);
      }

      // 3. Invalidate React Query caches
      await Promise.all([
        utils.catalog.search.invalidate(),
        utils.catalog.home.invalidate(),
        utils.catalog.propertyBySlug.invalidate({ slug: property.slug }),
        (utils.catalog as any).userProperties?.invalidate?.(),
      ]);

      // Broadcast update event so any active screens immediately sync
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("nivaas_property_updated", { detail: updatePayload }));
      }

      toast.success("Property and location updated successfully!");
      if (onUpdated) {
        onUpdated(res.property || updatePayload);
      }
      onOpenChange(false);
    } catch (err: any) {
      console.error("[EditProperty] Error:", err);
      toast.error(err?.message || "Failed to update property.");
    } finally {
      setSaving(false);
    }
  };

  const currentDisplayLoc = [locality || property?.locationName, city].filter(Boolean).join(", ");
  const previewHeading = locality && locality !== city ? `${locality}, ${city}` : city;
  const previewSubtitle = locationVisibility === "locality"
    ? state
    : [streetAddress && locationVisibility === "full" ? streetAddress : null, district ? `${district} district` : null, state, pincode].filter(Boolean).join(", ");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl p-6">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Edit Property &amp; Location</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSave} className="space-y-6 mt-2">
          {/* Title & Price */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[var(--muted-ink)] mb-1">
                Property Title
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="w-full rounded-xl border border-[var(--line-strong)] px-3.5 py-2.5 text-sm outline-none focus:border-[var(--ink)]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[var(--muted-ink)] mb-1">
                  Price (₹)
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  value={price}
                  onChange={e => setPrice(e.target.value)}
                  className="w-full rounded-xl border border-[var(--line-strong)] px-3.5 py-2.5 text-sm outline-none focus:border-[var(--ink)]"
                />
              </div>
              <div>
                <NivaasSelect
                  label="Purpose"
                  name="purpose"
                  value={purpose}
                  onChange={setPurpose}
                  options={[
                    { value: "buy", label: "For Sale" },
                    { value: "rent", label: "For Rent" },
                    { value: "pg", label: "PG / Co-Living" },
                    { value: "commercial", label: "Commercial" },
                  ]}
                />
              </div>
            </div>
          </div>

          {/* Location Section */}
          <div className="rounded-2xl border border-[var(--line-strong)] bg-stone-50 p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-[var(--orange)]" />
                <span className="text-sm font-bold text-[var(--ink)]">Location</span>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsChangingLocation(!isChangingLocation)}
                className="rounded-lg text-xs font-semibold h-8"
              >
                {isChangingLocation ? "Keep current" : "Change location"}
              </Button>
            </div>

            {!isChangingLocation ? (
              <div className="flex items-center justify-between rounded-xl bg-white p-3 border border-[var(--line)]">
                <div>
                  <p className="text-sm font-bold text-[var(--ink)]">📍 {currentDisplayLoc}</p>
                  <p className="text-xs text-[var(--muted-ink)] mt-0.5">{district}, {state} - {pincode}</p>
                </div>
                <span className="text-xs text-[var(--orange-dark)] font-semibold bg-[var(--peach)] px-2.5 py-1 rounded-full">
                  Current Location
                </span>
              </div>
            ) : (
              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[var(--muted-ink)]">Select or type new location details:</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleUseLocation}
                    disabled={isLocating}
                    className="text-xs text-[var(--orange-dark)] font-semibold flex items-center gap-1 h-7"
                  >
                    <Navigation className={`h-3 w-3 ${isLocating ? 'animate-spin' : ''}`} />
                    Use my GPS
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold mb-1">City / Town *</label>
                    <input
                      type="text"
                      required
                      value={city}
                      onChange={e => {
                        const val = e.target.value;
                        const known = findKnownCity(val);
                        setCity(val);
                        if (known) {
                          setDistrict(known.district);
                          setState(known.state);
                          setPincode(known.pincode);
                          setLatitude(known.latitude);
                          setLongitude(known.longitude);
                        }
                      }}
                      className="w-full rounded-xl border border-[var(--line-strong)] px-3 py-2 text-sm bg-white"
                      placeholder="e.g. Amalapuram, Kakinada, Rajahmundry"
                    />
                    <div className="flex gap-1.5 mt-1">
                      {["Amalapuram", "Kakinada", "Rajahmundry"].map(c => {
                        const isSelected = city.toLowerCase() === c.toLowerCase();
                        return (
                          <button
                            key={c}
                            type="button"
                            onClick={() => {
                              const known = findKnownCity(c);
                              setCity(c);
                              if (known) {
                                setDistrict(known.district);
                                setState(known.state);
                                setPincode(known.pincode);
                                setLatitude(known.latitude);
                                setLongitude(known.longitude);
                              }
                            }}
                            className={`text-[10px] px-2 py-0.5 rounded-full border ${isSelected ? 'bg-[var(--orange)] text-white border-[var(--orange)]' : 'bg-white text-[var(--muted-ink)] border-stone-200'}`}
                          >
                            {c}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold mb-1">Locality / Area *</label>
                    <input
                      type="text"
                      required
                      value={locality}
                      onChange={e => setLocality(e.target.value)}
                      className="w-full rounded-xl border border-[var(--line-strong)] px-3 py-2 text-sm bg-white"
                      placeholder="e.g. Sriramnagar, Ramanayyapeta..."
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold mb-1">District</label>
                    <input
                      type="text"
                      value={district}
                      onChange={e => setDistrict(e.target.value)}
                      className="w-full rounded-xl border border-[var(--line-strong)] px-3 py-2 text-sm bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1">State</label>
                    <input
                      type="text"
                      value={state}
                      onChange={e => setState(e.target.value)}
                      className="w-full rounded-xl border border-[var(--line-strong)] px-3 py-2 text-sm bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1">PIN Code</label>
                    <input
                      type="text"
                      value={pincode}
                      onChange={e => setPincode(e.target.value)}
                      className="w-full rounded-xl border border-[var(--line-strong)] px-3 py-2 text-sm bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1">Street / Landmark (Optional)</label>
                  <input
                    type="text"
                    value={streetAddress}
                    onChange={e => setStreetAddress(e.target.value)}
                    placeholder="e.g. Near Temple, Main Road"
                    className="w-full rounded-xl border border-[var(--line-strong)] px-3 py-2 text-sm bg-white"
                  />
                </div>

                {/* Location Visibility Control */}
                <div>
                  <label className="block text-xs font-bold text-[var(--ink)] mb-1">Location Visibility</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { value: "locality", label: "Locality only" },
                      { value: "area_city", label: "Area + City (Default)" },
                      { value: "full", label: "Full address" },
                    ].map(opt => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setLocationVisibility(opt.value as any)}
                        className={`p-2 rounded-xl text-left border text-xs font-medium transition ${locationVisibility === opt.value ? 'border-[var(--orange)] bg-[#fff7ef] text-[var(--orange-dark)] font-bold' : 'border-[var(--line)] bg-white text-[var(--ink)]'}`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Live Preview */}
                <div className="rounded-xl border border-[var(--orange)] bg-[#fff9f4] p-3 text-xs">
                  <span className="font-bold text-[var(--orange-dark)]">New Location Preview:</span>
                  <p className="font-bold text-[var(--ink)] mt-0.5">📍 {previewHeading}</p>
                  <p className="text-[var(--muted-ink)]">{previewSubtitle}</p>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="rounded-xl"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-[var(--orange)] hover:bg-[var(--orange-dark)] text-white font-bold px-6"
            >
              {saving ? "Saving changes..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
