import { Filter, MapPin, BookmarkPlus, Home, X, IndianRupee } from "lucide-react";
import { Link, useSearch, useLocation } from "wouter";
import { PropertyCard, SearchBar, SiteHeader } from "@/components/NivaasChrome";
import { trpc } from "@/lib/trpc";
import { useMemo, useState, useEffect, useCallback } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { NivaasSelect } from "@/components/ui/NivaasSelect";
import { useLocationSelector } from "@/components/LocationSelector";
import { storage } from "@/lib/localStorage/storage";
import { toast } from "sonner";
import { startLogin } from "@/const";

function readParam(params: URLSearchParams, key: string) {
  const value = params.get(key);
  return value?.trim() || undefined;
}

import { parseSearchQuery } from "@shared/searchParser";

// Budget options in INR
const MIN_BUDGET_OPTIONS = [
  { value: "any", label: "No minimum" },
  { value: "500000", label: "₹5 Lakh" },
  { value: "1000000", label: "₹10 Lakh" },
  { value: "2000000", label: "₹20 Lakh" },
  { value: "3000000", label: "₹30 Lakh" },
  { value: "5000000", label: "₹50 Lakh" },
  { value: "7500000", label: "₹75 Lakh" },
  { value: "10000000", label: "₹1 Crore" },
  { value: "15000000", label: "₹1.5 Crore" },
  { value: "20000000", label: "₹2 Crore" },
  { value: "30000000", label: "₹3 Crore" },
  { value: "50000000", label: "₹5 Crore" },
];

const MAX_BUDGET_OPTIONS = [
  { value: "any", label: "No maximum" },
  { value: "1000000", label: "₹10 Lakh" },
  { value: "2000000", label: "₹20 Lakh" },
  { value: "3000000", label: "₹30 Lakh" },
  { value: "5000000", label: "₹50 Lakh" },
  { value: "7500000", label: "₹75 Lakh" },
  { value: "10000000", label: "₹1 Crore" },
  { value: "15000000", label: "₹1.5 Crore" },
  { value: "20000000", label: "₹2 Crore" },
  { value: "30000000", label: "₹3 Crore" },
  { value: "50000000", label: "₹5 Crore" },
  { value: "100000000", label: "₹10 Crore+" },
];

function formatBudgetLabel(value: string, options: { value: string; label: string }[]) {
  return options.find(o => o.value === value)?.label ?? "";
}

export default function SearchPage() {
  const search = useSearch();
  const [, setLocation] = useLocation();
  const globalLocation = useLocationSelector();
  
  const input = useMemo(() => {
    const params = new URLSearchParams(search);
    let rawLoc = readParam(params, "location");
    let purpose = readParam(params, "purpose");
    let propertyType = readParam(params, "propertyType");
    let bedroomsStr = readParam(params, "bedrooms");
    let bedrooms = bedroomsStr ? parseInt(bedroomsStr, 10) : undefined;
    const minPriceStr = readParam(params, "minPrice");
    const maxPriceStr = readParam(params, "maxPrice");
    const minPrice = minPriceStr ? parseInt(minPriceStr, 10) : undefined;
    const maxPrice = maxPriceStr ? parseInt(maxPriceStr, 10) : undefined;

    if (rawLoc) {
      const parsed = parseSearchQuery(rawLoc);
      if (parsed.location) rawLoc = parsed.location;
      if (parsed.propertyType && !propertyType) propertyType = parsed.propertyType;
      if (parsed.purpose && !purpose) purpose = parsed.purpose;
      if (parsed.bedrooms && !bedrooms) bedrooms = parsed.bedrooms;
    }

    return {
      location: rawLoc,
      purpose,
      propertyType,
      bedrooms,
      minPrice,
      maxPrice,
      limit: 36,
    };
  }, [search]);

  const { data, isLoading, isError } = trpc.catalog.search.useQuery(input, {
    staleTime: 5000,
  });

  const heading = input.location
    ? `Properties in ${input.location}`
    : input.purpose
    ? `${input.purpose === "rent" ? "Homes to rent" : input.purpose === "buy" ? "Homes to buy" : "Properties to explore"}`
    : "Explore properties";

  const { user } = useAuth();
  const [isSaved, setIsSaved] = useState(false);

  // Budget filter panel state
  const [showBudget, setShowBudget] = useState(false);
  const [localMinPrice, setLocalMinPrice] = useState(input.minPrice ? String(input.minPrice) : "any");
  const [localMaxPrice, setLocalMaxPrice] = useState(input.maxPrice ? String(input.maxPrice) : "any");

  // Sync local state when URL params change
  useEffect(() => {
    setLocalMinPrice(input.minPrice ? String(input.minPrice) : "any");
    setLocalMaxPrice(input.maxPrice ? String(input.maxPrice) : "any");
  }, [input.minPrice, input.maxPrice]);

  useEffect(() => {
    if (!user) return;
    const searches = storage.get<any[]>("nivaas_saved_searches", []);
    const match = searches.some(
      s => s.userId === user.id && s.location === input.location && s.purpose === input.purpose && s.propertyType === input.propertyType
    );
    setIsSaved(match);
  }, [user, input]);

  const handleSaveSearch = () => {
    if (!user) {
      startLogin(window.location.pathname + window.location.search);
      return;
    }
    const searches = storage.get<any[]>("nivaas_saved_searches", []);
    if (!isSaved) {
      searches.push({
        id: "search_" + Math.random().toString(36).substr(2),
        userId: user.id,
        location: input.location || "",
        purpose: input.purpose || "",
        propertyType: input.propertyType || "",
        createdAt: Date.now()
      });
      storage.set("nivaas_saved_searches", searches);
      setIsSaved(true);
      toast.success("Search saved to dashboard");
    }
  };

  const withParams = useCallback((updates: Record<string, string | undefined>) => {
    const params = new URLSearchParams(search);
    for (const [key, value] of Object.entries(updates)) {
      if (value === undefined || value === "any") {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    }
    return `/search?${params.toString()}`;
  }, [search]);

  const applyBudget = () => {
    const url = withParams({
      minPrice: localMinPrice !== "any" ? localMinPrice : undefined,
      maxPrice: localMaxPrice !== "any" ? localMaxPrice : undefined,
    });
    setLocation(url);
    setShowBudget(false);
  };

  const clearBudget = () => {
    setLocalMinPrice("any");
    setLocalMaxPrice("any");
    const url = withParams({ minPrice: undefined, maxPrice: undefined });
    setLocation(url);
    setShowBudget(false);
  };

  const hasBudgetFilter = input.minPrice !== undefined || input.maxPrice !== undefined;

  const budgetChipLabel = hasBudgetFilter
    ? [
        input.minPrice ? formatBudgetLabel(String(input.minPrice), MIN_BUDGET_OPTIONS) : "",
        input.maxPrice ? formatBudgetLabel(String(input.maxPrice), MAX_BUDGET_OPTIONS) : "",
      ]
        .filter(Boolean)
        .join(" – ") || "Budget set"
    : "Budget";

  return (
    <div className="min-h-screen bg-[var(--paper)] text-[var(--ink)]">
      <SiteHeader />
      <main className="container pb-20 pt-10">
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--orange-dark)]">
            <Home className="h-4 w-4" /> Back Home
          </Link>
          <div className="mt-7 flex flex-col gap-6">
            <div>
              <h1 className="section-title text-4xl md:text-5xl">{heading}</h1>
              <p className="mt-3 text-sm text-[var(--muted-ink)]">{data ? `${data.length} properties matching your search` : "Finding the right places…"}</p>
            </div>
            <div className="w-full">
              <SearchBar initialLocation={input.location ?? ""} initialPurpose={input.purpose ?? ""} />
            </div>
          </div>
        </div>

        <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-y border-[var(--line)] py-3">
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span className="mr-2 inline-flex items-center gap-2 font-semibold">
              <Filter className="h-4 w-4 text-[var(--orange)]" /> Filters
            </span>
            {input.location ? <span className="filter-chip"><MapPin className="h-3.5 w-3.5" /> {input.location}</span> : null}
            {input.purpose ? <span className="filter-chip">{input.purpose}</span> : null}
            {input.propertyType ? <span className="filter-chip">{input.propertyType.replaceAll("-", " ")}</span> : null}
            {input.bedrooms ? <span className="filter-chip">{input.bedrooms} BHK</span> : null}

            {/* ── Budget Filter ── */}
            <div className="relative">
              <button
                id="budget-filter-btn"
                onClick={() => setShowBudget(v => !v)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold transition ${
                  hasBudgetFilter
                    ? "bg-[var(--peach)] border-[var(--orange)] text-[var(--orange-dark)]"
                    : "bg-white border-[var(--line-strong)] hover:border-[var(--orange)] text-[var(--ink)]"
                }`}
              >
                <IndianRupee className="h-3.5 w-3.5" />
                {budgetChipLabel}
                {hasBudgetFilter && (
                  <span
                    role="button"
                    aria-label="Clear budget filter"
                    onClick={e => { e.stopPropagation(); clearBudget(); }}
                    className="ml-0.5 rounded-full hover:bg-[var(--orange)]/20 p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </span>
                )}
              </button>

              {showBudget && (
                <div
                  id="budget-filter-panel"
                  className="absolute left-0 top-full z-50 mt-2 w-72 rounded-2xl border border-[var(--line-strong)] bg-white p-4 shadow-[0_12px_40px_rgba(35,31,28,0.14)]"
                >
                  <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-[var(--muted-ink)]">Budget Range</p>
                  <div className="flex flex-col gap-3">
                    <NivaasSelect
                      label="Minimum"
                      placeholder="No minimum"
                      value={localMinPrice}
                      onChange={setLocalMinPrice}
                      options={MIN_BUDGET_OPTIONS}
                    />
                    <NivaasSelect
                      label="Maximum"
                      placeholder="No maximum"
                      value={localMaxPrice}
                      onChange={setLocalMaxPrice}
                      options={MAX_BUDGET_OPTIONS}
                    />
                  </div>
                  <div className="mt-4 flex gap-2">
                    <button
                      onClick={applyBudget}
                      className="flex-1 rounded-xl bg-[var(--orange)] py-2.5 text-sm font-bold text-white transition hover:bg-[var(--orange-dark)]"
                    >
                      Apply
                    </button>
                    <button
                      onClick={clearBudget}
                      className="rounded-xl border border-[var(--line-strong)] px-4 py-2.5 text-sm font-semibold text-[var(--muted-ink)] transition hover:border-[var(--ink)] hover:text-[var(--ink)]"
                    >
                      Clear
                    </button>
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={handleSaveSearch}
              disabled={isSaved}
              className={`ml-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold transition ${isSaved ? 'bg-green-50 border-green-200 text-green-700' : 'bg-white border-[var(--line-strong)] hover:border-[var(--orange)] text-[var(--ink)]'}`}
            >
              <BookmarkPlus className="h-3.5 w-3.5" /> {isSaved ? "Saved" : "Save Search"}
            </button>
          </div>
        </div>

        {/* Backdrop to close budget panel when clicking outside */}
        {showBudget && (
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowBudget(false)}
            aria-hidden="true"
          />
        )}

        {isLoading ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <div className="skeleton-card" />
            <div className="skeleton-card" />
            <div className="skeleton-card" />
            <div className="skeleton-card" />
          </div>
        ) : isError ? (
          <div className="rounded-2xl border border-dashed border-[var(--line-strong)] p-10 text-center">
            <p className="font-bold">Search is temporarily unavailable.</p>
            <p className="mt-2 text-sm text-[var(--muted-ink)]">Please try again in a moment.</p>
          </div>
        ) : data?.length ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {data.map(property => <PropertyCard key={property.slug} property={property} />)}
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-[var(--line-strong)] bg-white/70 p-12 text-center">
            <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-[var(--peach)] text-[var(--orange)]">
              <Home className="h-7 w-7" />
            </div>
            {input.location || input.purpose || input.propertyType || input.bedrooms || hasBudgetFilter ? (
              <>
                <h3 className="text-xl font-bold text-[var(--ink)]">No properties match those filters</h3>
                <p className="mt-2 text-sm text-[var(--muted-ink)] max-w-md mx-auto">
                  Try another locality, broaden your property type, adjust your budget, or clear active filters.
                </p>
                <div className="mt-6 flex flex-wrap justify-center gap-3">
                  <Link href="/search" className="inline-flex rounded-xl bg-white border border-[var(--line-strong)] px-5 py-2.5 text-sm font-bold text-[var(--ink)] hover:border-[var(--orange)]">
                    Clear Filters
                  </Link>
                  <Link href="/sell" className="inline-flex rounded-xl bg-[var(--orange)] px-5 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-[var(--orange-dark)]">
                    List Your Property
                  </Link>
                </div>
              </>
            ) : (
              <>
                <h3 className="text-xl font-bold text-[var(--ink)]">No properties listed yet</h3>
                <p className="mt-2 text-sm text-[var(--muted-ink)] max-w-md mx-auto">
                  Be the first to list a property on NIVAAS.
                </p>
                <div className="mt-6">
                  <Link href="/sell" className="inline-flex rounded-xl bg-[var(--orange)] px-6 py-3 text-sm font-bold text-white shadow-md hover:bg-[var(--orange-dark)] transition">
                    List Your Property
                  </Link>
                </div>
              </>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
