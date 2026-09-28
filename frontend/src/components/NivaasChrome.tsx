import { Link, useLocation } from "wouter";
import { MapPin, Menu, Search, ShieldCheck, User, Heart } from "lucide-react";
import { startLogin } from "@/const";
import { LocationSelector, useLocationSelector } from "./LocationSelector";
import { useAuth } from "@/_core/hooks/useAuth";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { NivaasSelect } from "./ui/NivaasSelect";
import { useFavorites } from "@/lib/favorites";
import { Tooltip, TooltipTrigger, TooltipContent } from "./ui/tooltip";
import { useTranslation } from "@/contexts/LanguageContext";

export function SiteHeader() {
  const loc = useLocationSelector();
  const { user, logout } = useAuth();
  const [, setLocation] = useLocation();
  const { t } = useTranslation();

  return (
    <header className="sticky top-0 z-30 border-b border-[var(--line)] bg-[var(--paper)]/95 backdrop-blur">
      <div className="container flex h-16 items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2" aria-label="NIVAAS home">
          <img src="/assets/nivaas-logo.png" alt="NIVAAS" className="h-10 w-auto object-contain" />
        </Link>
        <nav className="hidden items-center gap-7 text-sm font-medium text-[var(--muted-ink)] md:flex" aria-label="Primary navigation">
          <Link href="/search" className="transition-colors hover:text-[var(--ink)]">{t("nav.buyRent")}</Link>
          {user ? (
            <Link href="/sell" className="transition-colors hover:text-[var(--ink)]">{t("nav.sell")}</Link>
          ) : (
            <button type="button" onClick={() => startLogin("/sell")} className="transition-colors hover:text-[var(--ink)]">{t("nav.sell")}</button>
          )}
          <Link href="/explore" className="transition-colors hover:text-[var(--ink)]">{t("nav.explore")}</Link>
          <Link href="/reviews" className="transition-colors hover:text-[var(--ink)]">{t("nav.reviews")}</Link>
        </nav>
        <div className="flex items-center gap-2">
          <LocationSelector>
            <button type="button" className="hidden items-center gap-2 rounded-full px-3 py-2 text-sm text-[var(--muted-ink)] transition-colors hover:bg-[var(--sand)] hover:text-[var(--ink)] md:flex" aria-label="Current location">
              <MapPin className="h-4 w-4 text-[var(--orange)]" />
              <span>{loc.formattedName}</span>
            </button>
          </LocationSelector>
          
          {/* Dashboard / Account Navigation Entry Point (Visible on Desktop & Mobile) */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button 
                type="button" 
                className="flex items-center gap-2 rounded-full border border-[var(--line-strong)] bg-white px-2.5 sm:px-3.5 py-1.5 text-sm font-semibold transition hover:border-[var(--ink)] hover:shadow-xs focus:outline-none"
                aria-label="Account and dashboard navigation"
              >
                <div className="grid h-6 w-6 place-items-center rounded-full bg-[var(--peach)] text-[var(--orange-dark)]">
                  <User className="h-3.5 w-3.5" />
                </div>
                <span className="hidden sm:inline text-xs font-bold text-[var(--ink)]">
                  {user ? user.name.split(' ')[0] : "Account"}
                </span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-60 p-1.5 shadow-lg border border-[var(--line-strong)] rounded-2xl bg-white">
              {/* User summary header */}
              <div className="px-3 py-2.5 mb-1 rounded-xl bg-stone-50 border border-stone-100">
                {user ? (
                  <>
                    <p className="text-xs font-bold text-[var(--ink)] truncate">{user.name}</p>
                    <p className="text-[11px] text-[var(--muted-ink)] truncate mt-0.5">{user.email}</p>
                  </>
                ) : (
                  <>
                    <p className="text-xs font-bold text-[var(--ink)]">NIVAAS Account</p>
                    <p className="text-[11px] text-[var(--muted-ink)] mt-0.5">Manage properties &amp; preferences</p>
                  </>
                )}
              </div>

              {/* Account Navigation destinations */}
              <DropdownMenuItem onClick={() => setLocation("/")} className="cursor-pointer font-medium py-2 rounded-xl">
                <span className="mr-2.5 text-sm">⌂</span> {t("nav.home")}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setLocation("/saved-properties")} className="cursor-pointer font-medium py-2 rounded-xl">
                <span className="mr-2.5 text-sm">♡</span> {t("nav.savedProperties")}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setLocation("/saved-searches")} className="cursor-pointer font-medium py-2 rounded-xl">
                <span className="mr-2.5 text-sm">⌕</span> {t("nav.savedSearches")}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setLocation("/your-properties")} className="cursor-pointer font-medium py-2 rounded-xl">
                <span className="mr-2.5 text-sm">⌂</span> {t("nav.yourProperties")}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setLocation("/profile")} className="cursor-pointer font-medium py-2 rounded-xl">
                <span className="mr-2.5 text-sm">♙</span> {t("nav.profile")}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setLocation("/settings")} className="cursor-pointer font-medium py-2 rounded-xl">
                <span className="mr-2.5 text-sm">⚙</span> {t("nav.settings")}
              </DropdownMenuItem>

              <div className="h-px bg-[var(--line)] my-1.5 mx-1" />

              {/* Authentication Actions */}
              {user ? (
                <DropdownMenuItem onClick={logout} className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50 font-semibold py-2 rounded-xl">
                  {t("action.signOut")}
                </DropdownMenuItem>
              ) : (
                <>
                  <DropdownMenuItem onClick={() => startLogin()} className="cursor-pointer font-semibold text-[var(--orange-dark)] focus:bg-[var(--peach)] py-2 rounded-xl">
                    Sign in
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setLocation("/signup")} className="cursor-pointer font-medium py-2 rounded-xl">
                    Create an account
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}

export type PropertyCardData = {
  slug: string;
  title: string;
  price: string | number;
  rentPeriod?: string | null;
  bedrooms?: number | null;
  bathrooms?: string | number | null;
  areaSqft?: number | null;
  locality?: string | null;
  district?: string | null;
  locationName?: string | null;
  city?: string | null;
  purpose?: string | null;
  propertyType?: string | null;
  verificationStatus?: string | null;
  imageUrl?: string | null;
  imageAlt?: string | null;
  dataSource?: "user" | "sample";
  isSampleListing?: boolean;
};

function formatPrice(value: string | number, purpose?: string | null) {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return "Price on request";
  const formatted = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(amount);
  if (purpose?.toLowerCase() === "rent") return `₹${formatted} / month`;
  return `₹${formatted}`;
}

import { ImageWithFallback } from "./ImageWithFallback";
import { parseSearchQuery } from "@shared/searchParser";

export function PropertyCard({ property }: { property: PropertyCardData }) {
  const { isSaved, toggle } = useFavorites(property);
  const { t } = useTranslation();
  const rawLocality = property.locality || property.locationName;
  const isSameAsCity = rawLocality && property.city && rawLocality.toLowerCase() === property.city.toLowerCase();
  const location = isSameAsCity
    ? property.city
    : [rawLocality, property.city].filter(Boolean).join(", ");
  const rawUrl = property.imageUrl;
  const optimizedUrl = rawUrl
    ? (rawUrl.startsWith("http") && rawUrl.includes("unsplash.com")
        ? `${rawUrl}${rawUrl.includes("?") ? "&" : "?"}auto=format&fit=crop&w=720&q=75`
        : rawUrl)
    : "/images/fallback-property.svg";

  return (
    <Link href={`/property/${property.slug}`} className="group relative block overflow-hidden rounded-[22px] border border-[var(--line)] bg-white shadow-[0_8px_30px_rgba(35,31,28,0.04)] transition duration-200 hover:-translate-y-1 hover:shadow-[0_16px_36px_rgba(35,31,28,0.1)]">
      <div className="relative aspect-[1.25] overflow-hidden bg-[var(--sand)]">
        <ImageWithFallback
          src={optimizedUrl}
          alt={property.imageAlt ?? property.title}
          fallbackSrc="/images/fallback-property.svg"
          containerClassName="h-full w-full"
          className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
          loading="lazy"
        />
        <div className="absolute left-3 top-3 flex items-center gap-2">
          {property.purpose ? <span className="rounded-full bg-white/95 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--ink)] shadow-sm">{property.purpose}</span> : null}
          {(property.dataSource === "sample" || property.isSampleListing) ? (
            <span className="rounded-full bg-amber-500/90 text-white px-2.5 py-0.5 text-[10px] font-bold tracking-wider uppercase shadow-sm">Sample</span>
          ) : null}
          {property.verificationStatus === "verified" ? <span className="grid h-7 w-7 place-items-center rounded-full bg-white/95 text-[var(--orange)] shadow-sm" aria-label="Verified listing"><ShieldCheck className="h-4 w-4" /></span> : null}
        </div>

        <div className="absolute right-3 top-3 z-10">
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  toggle();
                }}
                aria-label={isSaved ? t("action.removeFromSaved") : t("action.save")}
                className="grid h-8 w-8 place-items-center rounded-full bg-white/95 text-[var(--ink)] shadow-md transition hover:scale-110 active:scale-95 hover:bg-white"
              >
                <Heart className={`h-4 w-4 transition-colors ${isSaved ? "fill-red-500 text-red-500" : "text-gray-400 hover:text-red-500"}`} />
              </button>
            </TooltipTrigger>
            <TooltipContent side="left" className="rounded-xl bg-[var(--ink)] text-white text-xs font-semibold px-2.5 py-1 shadow-md">
              {isSaved ? `♥ ${t("action.saved")}` : `♡ ${t("action.save")}`}
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
      <div className="space-y-3 p-4">
        <div>
          <div className="mb-1 text-lg font-bold tracking-[-0.03em]">{formatPrice(property.price, property.purpose)}</div>
          <h3 className="line-clamp-1 font-semibold text-[var(--ink)]">{property.title}</h3>
          <p className="mt-1 line-clamp-1 text-sm text-[var(--muted-ink)]">{location || "Location available on request"}</p>
        </div>
        <div className="flex items-center gap-4 text-xs font-medium text-[var(--muted-ink)]">
          {property.bedrooms ? <span>{property.bedrooms} bed</span> : null}
          {property.bathrooms ? <span>{Number(property.bathrooms)} bath</span> : null}
          {property.areaSqft ? <span>{property.areaSqft.toLocaleString("en-IN")} sq.ft.</span> : null}
          {property.propertyType ? <span className="ml-auto truncate text-[var(--orange-dark)]">{property.propertyType}</span> : null}
        </div>
      </div>
    </Link>
  );
}

export function SearchBar({ initialLocation = "", initialPurpose = "" }: { initialLocation?: string; initialPurpose?: string }) {
  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const params = new URLSearchParams();
    const rawLocation = String(form.get("location") ?? "").trim();
    const rawPurpose = String(form.get("purpose") ?? "").trim();
    const rawPropertyType = String(form.get("propertyType") ?? "").trim();

    const parsed = parseSearchQuery(rawLocation);
    const finalLocation = parsed.location || (rawLocation && !parsed.propertyType ? rawLocation : "");
    const finalPurpose = (rawPurpose && rawPurpose !== "any") ? rawPurpose : (parsed.purpose || "");
    const finalPropertyType = (rawPropertyType && rawPropertyType !== "any") ? rawPropertyType : (parsed.propertyType || "");

    if (finalLocation) params.set("location", finalLocation);
    if (finalPurpose) params.set("purpose", finalPurpose);
    if (finalPropertyType) params.set("propertyType", finalPropertyType);
    if (parsed.bedrooms) params.set("bedrooms", String(parsed.bedrooms));

    window.location.href = `/search?${params.toString()}`;
  };

  return (
    <form onSubmit={submit} className="relative z-20 flex flex-col md:flex-row w-full box-border gap-2 rounded-3xl border border-[var(--line-strong)] bg-white p-2 shadow-[0_18px_46px_rgba(35,31,28,0.16)] ring-1 ring-black/[0.03]">
      <label className="flex-1 flex flex-col justify-center min-w-0 min-h-[64px] rounded-2xl border border-transparent bg-[var(--paper)] px-4 py-1 transition-colors hover:border-[var(--line-strong)] hover:bg-[var(--sand)]">
        <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--muted-ink)] mb-0.5">Location</span>
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 shrink-0 text-[var(--orange)]" />
          <input name="location" defaultValue={initialLocation} placeholder="City, area or landmark" className="w-full bg-transparent text-sm font-semibold outline-none placeholder:font-normal placeholder:text-[var(--muted-ink)]" />
        </div>
      </label>
      
      <div className="flex-1 md:max-w-[200px]">
        <NivaasSelect
          name="purpose"
          defaultValue={initialPurpose || "any"}
          label="I want to"
          placeholder="Buy or rent"
          triggerClassName="w-full h-full min-h-[64px] bg-[var(--paper)] border-transparent hover:border-[var(--line-strong)] hover:bg-[var(--sand)] shadow-none flex items-end pb-3 pt-6"
          options={[
            { value: "any", label: "Buy or rent" },
            { value: "buy", label: "Buy" },
            { value: "rent", label: "Rent" },
            { value: "pg", label: "PG / Co-Living" },
            { value: "commercial", label: "Commercial" }
          ]}
        />
      </div>

      <div className="flex-1 md:max-w-[220px]">
        <NivaasSelect
          name="propertyType"
          defaultValue="any"
          label="Property type"
          placeholder="Any type"
          triggerClassName="w-full h-full min-h-[64px] bg-[var(--paper)] border-transparent hover:border-[var(--line-strong)] hover:bg-[var(--sand)] shadow-none flex items-end pb-3 pt-6"
          options={[
            { value: "any", label: "Any type" },
            { value: "apartment", label: "Apartment" },
            { value: "independent-house", label: "Independent House" },
            { value: "villa", label: "Villa" },
            { value: "plot", label: "Plot" },
            { value: "pg", label: "PG / Co-Living" },
            { value: "commercial", label: "Commercial" }
          ]}
        />
      </div>

      <button type="submit" className="md:w-[140px] inline-flex min-h-[64px] items-center justify-center gap-2 rounded-2xl bg-[var(--orange)] px-6 py-3 text-sm font-bold text-white shadow-none transition hover:bg-[var(--orange-dark)] active:scale-[0.98]">
        <Search className="h-4 w-4" />
        Search
      </button>
    </form>
  );
}
