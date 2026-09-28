import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "@/_core/hooks/useAuth";
import { Link } from "wouter";
import { PropertyCard } from "@/components/NivaasChrome";
import { useFavorites, favoritesManager } from "@/lib/favorites";
import { Heart, Compass, Trash2, ArrowLeft } from "lucide-react";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { useTranslation } from "@/contexts/LanguageContext";

import { useEffect } from "react";

export default function SavedHomes() {
  const { user } = useAuth({ redirectOnUnauthenticated: true, redirectPath: "/dashboard/saved-homes" });
  const { userFavorites, refresh } = useFavorites();
  const { t } = useTranslation();

  useEffect(() => {
    const handleUpdate = () => {
      refresh();
    };
    window.addEventListener("nivaas_property_updated", handleUpdate);
    return () => window.removeEventListener("nivaas_property_updated", handleUpdate);
  }, [refresh]);

  if (!user) return null;

  const validFavorites = userFavorites.filter(fav => fav && fav.property && (fav.property.title || fav.property.slug));

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="mb-2">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--orange-dark)] hover:underline transition"
          >
            ← {t("actions.backHome")}
          </Link>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">{t("nav.savedProperties")}</h1>
            <p className="text-sm text-gray-500 mt-1">
              Properties you have saved to revisit and compare.
            </p>
          </div>
          {validFavorites.length > 0 && (
            <Link
              href="/search"
              className="inline-flex items-center gap-2 rounded-xl border border-[var(--line-strong)] bg-white px-4 py-2 text-xs font-bold text-[var(--ink)] shadow-sm hover:border-[var(--orange)] hover:text-[var(--orange-dark)] transition"
            >
              <Compass className="h-4 w-4 text-[var(--orange)]" /> Explore More Properties
            </Link>
          )}
        </div>

        {validFavorites.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {validFavorites.map((fav) => (
              <div key={fav.id} className="relative group">
                <PropertyCard property={fav.property} />
                <div className="mt-2 flex items-center justify-between px-1">
                  <span className="text-[11px] text-[var(--muted-ink)] font-medium">
                    Saved {new Date(fav.createdAt).toLocaleDateString()}
                  </span>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        onClick={() => {
                          favoritesManager.remove(fav.propertyId || fav.slug, user.id);
                          refresh();
                        }}
                        aria-label="Remove property from saved properties"
                        className="inline-flex items-center gap-1 text-xs text-red-500 hover:text-red-700 font-medium py-1 px-2 rounded-lg hover:bg-red-50 transition"
                      >
                        <Trash2 className="h-3.5 w-3.5" /> Remove
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="rounded-xl bg-[var(--ink)] text-white text-xs font-semibold px-2.5 py-1">
                      Remove from saved properties
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-[var(--line-strong)] bg-white p-12 text-center flex flex-col items-center justify-center min-h-[380px]">
            <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-[var(--peach)] text-[var(--orange)]">
              <Heart className="h-7 w-7 fill-[var(--orange)]" />
            </div>
            <h3 className="tracking-tight text-xl font-bold text-[var(--ink)] mb-2">
              {t("empty.noSavedProperties")}
            </h3>
            <p className="text-sm text-[var(--muted-ink)] max-w-md mb-6 leading-relaxed">
              Save homes, plots, apartments and other properties you like, and they’ll appear here.
            </p>
            <Link
              href="/search"
              className="inline-flex items-center gap-2 rounded-xl bg-[var(--orange)] px-6 py-3 text-sm font-bold text-white shadow-md transition hover:bg-[var(--orange-dark)]"
            >
              {t("actions.search")}
            </Link>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
