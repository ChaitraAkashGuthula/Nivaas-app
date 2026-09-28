import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "@/_core/hooks/useAuth";
import { Link, useLocation } from "wouter";
import { Search, Compass, Trash2, ArrowRight, MapPin, SlidersHorizontal } from "lucide-react";
import { useState, useEffect } from "react";
import { storage } from "@/lib/localStorage/storage";
import { toast } from "sonner";
import { useTranslation } from "@/contexts/LanguageContext";

export default function SavedSearches() {
  const { user } = useAuth({ redirectOnUnauthenticated: true, redirectPath: "/saved-searches" });
  const { t } = useTranslation();
  const [, setLocation] = useLocation();
  const [savedSearches, setSavedSearches] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      const searches = storage.get<any[]>("nivaas_saved_searches", []);
      setSavedSearches(searches);
    }
  }, [user]);

  if (!user) return null;

  const handleRemoveSearch = (id: string) => {
    const searches = storage.get<any[]>("nivaas_saved_searches", []);
    const updated = searches.filter(s => s.id !== id);
    storage.set("nivaas_saved_searches", updated);
    setSavedSearches(updated);
    toast.success("Saved search removed");
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Corner Back Home Navigation */}
        <div className="mb-2">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--orange-dark)] hover:underline transition"
          >
            ← {t("action.backHome", "Back Home")}
          </Link>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">
              {t("nav.savedSearches", "Saved Searches")}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Your saved filters for fast property discovery.
            </p>
          </div>
          {savedSearches.length > 0 && (
            <Link
              href="/search"
              className="inline-flex items-center gap-2 rounded-xl bg-[var(--orange)] px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-[var(--orange-dark)]"
            >
              <Search className="h-4 w-4" /> {t("action.search", "Search Properties")}
            </Link>
          )}
        </div>

        {savedSearches.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {savedSearches.map((item) => (
              <div
                key={item.id}
                className="flex flex-col justify-between rounded-2xl border border-[var(--line)] bg-white p-5 shadow-sm transition hover:border-[var(--orange)] hover:shadow-md"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--peach)] px-3 py-1 text-xs font-bold text-[var(--orange-dark)] uppercase tracking-wide">
                      <SlidersHorizontal className="h-3 w-3" /> Saved Criteria
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSearch(item.id)}
                      className="text-gray-400 hover:text-red-600 p-1 rounded-lg transition"
                      aria-label="Remove saved search"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <h3 className="font-bold text-base text-[var(--ink)] line-clamp-1">
                    {item.name || item.location || "Custom Search"}
                  </h3>

                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {item.location && (
                      <span className="inline-flex items-center gap-1 text-xs bg-[var(--sand)] text-[var(--ink)] px-2.5 py-1 rounded-full font-medium">
                        <MapPin className="h-3 w-3 text-[var(--orange)]" /> {item.location}
                      </span>
                    )}
                    {item.purpose && (
                      <span className="text-xs bg-[var(--sand)] text-[var(--ink)] px-2.5 py-1 rounded-full font-medium">
                        {item.purpose}
                      </span>
                    )}
                    {item.propertyType && (
                      <span className="text-xs bg-[var(--sand)] text-[var(--ink)] px-2.5 py-1 rounded-full font-medium">
                        {item.propertyType.replaceAll("-", " ")}
                      </span>
                    )}
                    {item.bedrooms && (
                      <span className="text-xs bg-[var(--sand)] text-[var(--ink)] px-2.5 py-1 rounded-full font-medium">
                        {item.bedrooms} BHK
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-[var(--line)] flex items-center justify-between">
                  <span className="text-[11px] text-[var(--muted-ink)]">
                    {item.date ? new Date(item.date).toLocaleDateString() : "Saved search"}
                  </span>
                  <Link
                    href={`/search?${item.query || ""}`}
                    className="inline-flex items-center gap-1 text-xs font-bold text-[var(--orange-dark)] hover:underline"
                  >
                    Run Search <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-[var(--line-strong)] bg-white p-12 text-center flex flex-col items-center justify-center min-h-[340px]">
            <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-[var(--peach)] text-[var(--orange)]">
              <Search className="h-7 w-7 text-[var(--orange)]" />
            </div>
            <h3 className="tracking-tight text-xl font-bold text-[var(--ink)] mb-2">
              {t("empty.noSavedSearches", "No saved searches yet.")}
            </h3>
            <p className="text-sm text-[var(--muted-ink)] max-w-sm mb-6 leading-relaxed">
              Save a search to quickly find matching properties later.
            </p>
            <Link
              href="/search"
              className="inline-flex items-center gap-2 rounded-xl bg-[var(--orange)] px-6 py-3 text-sm font-bold text-white shadow-md transition hover:bg-[var(--orange-dark)]"
            >
              {t("action.search", "Search Properties")}
            </Link>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
