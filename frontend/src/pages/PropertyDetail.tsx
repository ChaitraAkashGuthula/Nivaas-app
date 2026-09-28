import { ArrowLeft, BedDouble, Car, CheckCircle2, House, MapPin, Ruler, ShieldCheck, Heart, Edit3 } from "lucide-react";
import { Link, useRoute } from "wouter";
import { startLogin } from "@/const";
import { SiteHeader } from "@/components/NivaasChrome";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { useState, useEffect } from "react";
import { storage } from "@/lib/localStorage/storage";
import { toast } from "sonner";
import { EditPropertyDialog } from "@/components/EditPropertyDialog";
import { useFavorites } from "@/lib/favorites";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

function formatPrice(value: string | number, purpose?: string | null) {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return "Price on request";
  const result = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(amount);
  return purpose?.toLowerCase() === "rent" ? `₹${result} / month` : `₹${result}`;
}

import { ImageWithFallback } from "@/components/ImageWithFallback";

export default function PropertyDetail() {
  const [, params] = useRoute("/property/:slug");
  const { user } = useAuth();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [propertyData, setPropertyData] = useState<any>(null);
  
  const { data, isLoading } = trpc.catalog.propertyBySlug.useQuery({ slug: params?.slug ?? "" }, { enabled: Boolean(params?.slug) });
  const { isSaved, toggle } = useFavorites(propertyData);

  useEffect(() => {
    if (data) {
      setPropertyData(data);
    }
  }, [data]);

  useEffect(() => {
    const handleUpdate = (e: any) => {
      if (e.detail && (e.detail.slug === params?.slug || e.detail.id === propertyData?.id)) {
        setPropertyData((prev: any) => ({ ...prev, ...e.detail }));
      }
    };
    window.addEventListener("nivaas_property_updated", handleUpdate);
    return () => window.removeEventListener("nivaas_property_updated", handleUpdate);
  }, [params?.slug, propertyData?.id]);

  if (isLoading) return <div className="min-h-screen bg-[var(--paper)]"><SiteHeader /><main className="container py-16"><div className="skeleton-detail" /></main></div>;
  if (!propertyData) return <div className="min-h-screen bg-[var(--paper)]"><SiteHeader /><main className="container py-16"><Link href="/" className="inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--orange-dark)]">← Back Home</Link><div className="mt-10 rounded-2xl border border-dashed border-[var(--line-strong)] p-10"><h1 className="text-2xl font-bold">Property not found</h1><p className="mt-2 text-[var(--muted-ink)]">This listing may have been paused or is no longer available.</p></div></main></div>;

  const current = propertyData;
  const rawLocality = current.locality || current.locationName;
  const isLocSameAsCity = rawLocality && current.city && rawLocality.toLowerCase() === current.city.toLowerCase();
  const locationHeader = isLocSameAsCity
    ? [current.city, current.district, current.state].filter(Boolean).join(", ")
    : [rawLocality, current.city, current.state].filter(Boolean).join(", ");

  const facts = [
    current.bedrooms ? { label: "Bedrooms", value: String(current.bedrooms), icon: BedDouble } : null,
    current.bathrooms ? { label: "Bathrooms", value: String(Number(current.bathrooms)), icon: House } : null,
    current.areaSqft ? { label: "Area", value: `${current.areaSqft.toLocaleString("en-IN")} sq.ft.`, icon: Ruler } : null,
    current.parking ? { label: "Parking", value: current.parking, icon: Car } : null,
  ].filter(Boolean) as { label: string; value: string; icon: typeof BedDouble }[];

  const galleryImages = (current.images && current.images.length > 0)
    ? current.images
    : (current.imageUrl ? [{ url: current.imageUrl, altText: current.title }] : [{ url: "/images/fallback-property.svg", altText: current.title }]);

  // Compute location details according to visibility settings
  const vis = current.locationVisibility || "area_city";
  let locationTitle = "";
  let locationSubtitle = "";

  if (vis === "locality") {
    locationTitle = isLocSameAsCity ? current.city : `${rawLocality}, ${current.city}`;
    locationSubtitle = current.state;
  } else if (vis === "full") {
    locationTitle = [current.streetAddress, isLocSameAsCity ? null : rawLocality, current.city].filter(Boolean).join(", ");
    locationSubtitle = [current.district ? `${current.district} district` : null, current.state, current.pincode].filter(Boolean).join(", ");
  } else {
    // "area_city" (default)
    locationTitle = isLocSameAsCity ? current.city : `${rawLocality}, ${current.city}`;
    locationSubtitle = [current.district ? `${current.district} district` : null, current.state, current.pincode].filter(Boolean).join(", ");
  }

  const hasCoords = current.latitude && current.longitude && !isNaN(Number(current.latitude)) && !isNaN(Number(current.longitude));

  return (
    <div className="min-h-screen bg-[var(--paper)] text-[var(--ink)]">
      <SiteHeader />
      <main className="container pb-20 pt-8">
        <div className="flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--orange-dark)]">
            <ArrowLeft className="h-4 w-4" /> Back Home
          </Link>
          {user && user.id === current.sellerId && (
            <button
              onClick={() => setIsEditDialogOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--line-strong)] bg-white px-3.5 py-1.5 text-xs font-bold text-[var(--ink)] shadow-sm hover:border-[var(--orange)] hover:text-[var(--orange-dark)] transition"
            >
              <Edit3 className="h-3.5 w-3.5 text-[var(--orange)]" /> Edit Listing
            </button>
          )}
        </div>

        <div className="mt-7 grid gap-8 lg:grid-cols-[1.3fr_0.7fr]">
          <section>
            <div className="flex justify-between items-start">
              <div className="grid gap-3 sm:grid-cols-[1.6fr_0.8fr] sm:grid-rows-2 w-full">
                {galleryImages.slice(0, 3).map((image: any, index: number) => {
                  const optUrl = image.url.startsWith("http") && image.url.includes("unsplash.com")
                    ? `${image.url}${image.url.includes("?") ? "&" : "?"}auto=format&fit=crop&w=1080&q=80`
                    : image.url;
                  return (
                    <div key={image.url + index} className={`${index === 0 ? "sm:row-span-2" : ""} overflow-hidden rounded-[22px] bg-[var(--sand)] ${index > 0 ? "hidden sm:block" : ""}`}>
                      <ImageWithFallback
                        src={optUrl}
                        alt={image.altText || current.title}
                        fallbackSrc="/images/fallback-property.svg"
                        containerClassName="h-full min-h-56 w-full"
                        className="h-full min-h-56 w-full object-cover"
                        loading={index === 0 ? "eager" : "lazy"}
                      />
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mt-8 flex justify-between items-start">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  {current.purpose ? (
                    <span className="rounded-full bg-[var(--peach)] px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] text-[var(--orange-dark)]">
                      {current.purpose}
                    </span>
                  ) : null}
                  {(current.dataSource === "sample" || current.isSampleListing) ? (
                    <span className="rounded-full bg-amber-500 text-white px-3 py-1 text-xs font-bold uppercase tracking-wider shadow-xs">
                      Sample Listing
                    </span>
                  ) : current.verificationStatus === "verified" ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-[#e8f1e9] px-3 py-1 text-xs font-bold text-[#2e6940]">
                      <ShieldCheck className="h-3.5 w-3.5" /> Verified listing
                    </span>
                  ) : null}
                </div>
                <h1 className="mt-4 max-w-3xl text-4xl font-bold leading-tight tracking-[-0.055em] md:text-5xl">
                  {current.title}
                </h1>
                <p className="mt-3 flex items-center gap-2 text-[var(--muted-ink)]">
                  <MapPin className="h-4 w-4 text-[var(--orange)]" />
                  {locationHeader}
                </p>
              </div>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    onClick={toggle}
                    className="p-3 rounded-full bg-white shadow-sm border border-gray-100 hover:bg-gray-50 transition active:scale-95"
                    aria-label={isSaved ? "Remove property from saved properties" : "Save property"}
                  >
                    <Heart className={`h-6 w-6 transition-colors ${isSaved ? 'fill-red-500 text-red-500' : 'text-gray-400 hover:text-red-500'}`} />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top" className="rounded-xl bg-[var(--ink)] text-white text-xs font-semibold px-3 py-1.5 shadow-md">
                  {isSaved ? "♥ Saved" : "♡ Save property"}
                </TooltipContent>
              </Tooltip>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {facts.map(fact => (
                <div key={fact.label} className="rounded-2xl border border-[var(--line)] bg-white p-4">
                  <fact.icon className="h-4 w-4 text-[var(--orange)]" />
                  <p className="mt-4 text-xs text-[var(--muted-ink)]">{fact.label}</p>
                  <p className="mt-1 font-bold">{fact.value}</p>
                </div>
              ))}
            </div>

            <div className="mt-9 border-t border-[var(--line)] pt-8">
              <h2 className="text-xl font-bold">About this property</h2>
              <p className="mt-3 max-w-2xl leading-7 text-[var(--muted-ink)]">
                {current.description ?? "The owner has not added a description yet."}
              </p>
            </div>

            {/* Structured Location Section with Map */}
            <div className="mt-8 border-t border-[var(--line)] pt-8">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">Location</h2>
                {user && user.id === current.sellerId && (
                  <button
                    onClick={() => setIsEditDialogOpen(true)}
                    className="inline-flex items-center gap-1 text-xs font-bold text-[var(--orange-dark)] hover:underline"
                  >
                    <Edit3 className="h-3.5 w-3.5" /> Change Location
                  </button>
                )}
              </div>

              <div className="mt-4 rounded-2xl bg-[#ebe5dc] p-6">
                <div className="flex items-start gap-4">
                  <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-white text-[var(--orange)] shadow-sm">
                    <MapPin className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xl font-bold text-[var(--ink)]">
                      📍 {locationTitle}
                    </p>
                    {locationSubtitle && (
                      <p className="mt-1.5 text-sm text-[var(--muted-ink)] leading-relaxed">
                        {locationSubtitle}
                      </p>
                    )}
                    <div className="mt-3.5 flex flex-wrap gap-2 text-xs">
                      <span className="rounded-full bg-white px-3 py-1 font-semibold text-[var(--ink)] shadow-xs">
                        City: <strong>{current.city}</strong>
                      </span>
                      {rawLocality && !isLocSameAsCity && (
                        <span className="rounded-full bg-white px-3 py-1 font-semibold text-[var(--ink)] shadow-xs">
                          Locality: <strong>{rawLocality}</strong>
                        </span>
                      )}
                      {current.district && (
                        <span className="rounded-full bg-white px-3 py-1 font-medium text-[var(--muted-ink)] shadow-xs">
                          District: {current.district}
                        </span>
                      )}
                      {current.pincode && (
                        <span className="rounded-full bg-white px-3 py-1 font-medium text-[var(--muted-ink)] shadow-xs">
                          PIN: {current.pincode}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Map Display when coordinates are available */}
                {hasCoords && (
                  <div className="mt-5 overflow-hidden rounded-xl border border-[var(--line-strong)] bg-white shadow-sm">
                    <iframe
                      title="Property Location Map"
                      width="100%"
                      height="250"
                      frameBorder="0"
                      scrolling="no"
                      marginHeight={0}
                      marginWidth={0}
                      src={`https://www.openstreetmap.org/export/embed.html?bbox=${Number(current.longitude) - 0.012}%2C${Number(current.latitude) - 0.012}%2C${Number(current.longitude) + 0.012}%2C${Number(current.latitude) + 0.012}&layer=mapnik&marker=${current.latitude}%2C${current.longitude}`}
                      className="w-full"
                    />
                    <div className="flex items-center justify-between px-4 py-2.5 text-xs text-[var(--muted-ink)] bg-stone-50 border-t border-[var(--line)]">
                      <span>📍 Verified property coordinate pin on OpenStreetMap</span>
                      <a
                        href={`https://www.openstreetmap.org/?mlat=${current.latitude}&mlon=${current.longitude}#map=16/${current.latitude}/${current.longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-bold text-[var(--orange-dark)] hover:underline"
                      >
                        Open in Maps ↗
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>

          <aside>
            <div className="sticky top-24 rounded-[24px] border border-[var(--line)] bg-white p-6 shadow-[0_12px_40px_rgba(35,31,28,0.06)]">
              <p className="text-3xl font-bold tracking-[-0.05em]">{formatPrice(current.price, current.purpose)}</p>
              {current.deposit ? <p className="mt-2 text-sm text-[var(--muted-ink)]">Deposit ₹{Number(current.deposit).toLocaleString("en-IN")}</p> : null}
              <div className="my-6 border-t border-[var(--line)]" />
              
              <div className="mt-8">
                <p className="text-sm font-bold uppercase tracking-wider text-[var(--muted-ink)] mb-4">Contact Seller</p>
                <div className="rounded-2xl border border-[var(--line-strong)] bg-[#fdfaf5] p-5">
                  <p className="font-bold text-lg">{current.sellerName || "Owner / Seller"}</p>
                  {current.sellerType && <p className="text-xs text-[var(--muted-ink)] mt-0.5 font-medium">{current.sellerType}</p>}
                  
                  {current.sellerPhone ? (
                    <>
                      <p className="mt-4 text-xl font-bold tracking-tight">📞 {current.sellerPhone}</p>
                      <div className="mt-6 flex flex-col gap-3">
                        <a href={`tel:${current.sellerPhone}`} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--orange)] px-4 py-3 text-sm font-bold text-white transition hover:bg-[var(--orange-dark)]">
                          Call Seller
                        </a>
                        <a href={`https://wa.me/${String(current.sellerPhone).replace(/[^0-9]/g, '')}?text=Hi,%20I%20found%20your%20property%20on%20NIVAAS%20and%20would%20like%20to%20know%20more%20about%20it.`} target="_blank" rel="noopener noreferrer" className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#1ebd5a]">
                          WhatsApp
                        </a>
                      </div>
                    </>
                  ) : (
                    <div className="mt-4">
                      <p className="text-[var(--muted-ink)] italic">Contact details unavailable</p>
                    </div>
                  )}

                  {(current.dataSource === "sample" || current.isSampleListing) && (
                    <div className="mt-4 rounded-xl bg-amber-500/10 border border-amber-500/20 p-3 text-xs text-amber-800 leading-relaxed">
                      <strong>Sample / Demo Listing:</strong> This listing is for demonstration purposes. Contact details are simulated test data.
                    </div>
                  )}
                </div>
              </div>
              <div className="mt-5 flex items-center gap-2 text-xs text-[var(--muted-ink)]">
                <ShieldCheck className="h-4 w-4 text-[var(--orange)]" /> Deals directly with owner.
              </div>
            </div>
          </aside>
        </div>
      </main>

      <EditPropertyDialog
        property={propertyData}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onUpdated={(updated) => setPropertyData((prev: any) => ({ ...prev, ...updated }))}
      />
    </div>
  );
}
