import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "@/_core/hooks/useAuth";
import { Link } from "wouter";
import { PropertyCard } from "@/components/NivaasChrome";
import { trpc } from "@/lib/trpc";
import { Loader2, PlusCircle, Edit3, Trash2, ArrowLeft, AlertTriangle } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { storage } from "@/lib/localStorage/storage";
import { EditPropertyDialog } from "@/components/EditPropertyDialog";
import { favoritesManager } from "@/lib/favorites";
import { useTranslation } from "@/contexts/LanguageContext";
import { toast } from "sonner";

export default function YourProperties() {
  const { user } = useAuth({ redirectOnUnauthenticated: true });
  const { t } = useTranslation();
  const [userProperties, setUserProperties] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProperty, setSelectedProperty] = useState<any | null>(null);
  const [propertyToDelete, setPropertyToDelete] = useState<any | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const deleteMutation = trpc.catalog.deleteProperty.useMutation();
  const utils = trpc.useUtils();

  const { data: serverUserProps, refetch: refetchServerProps } = trpc.catalog.userProperties.useQuery(
    { sellerId: user?.id, sellerEmail: user?.email },
    { enabled: !!user, staleTime: 0 }
  );

  const handlePropertyUpdated = useCallback((updatedProp: any) => {
    setUserProperties(prev =>
      prev.map(p => {
        if (p.id === updatedProp.id || p.slug === updatedProp.slug) {
          return { ...p, ...updatedProp };
        }
        return p;
      })
    );
  }, []);

  const loadProperties = useCallback(() => {
    if (!user) return;
    const localProps = storage.get<any[]>("nivaas_properties", []);
    const userOwnedLocal = localProps.filter(p => String(p.sellerId) === String(user.id));

    const combined = [...userOwnedLocal];
    if (serverUserProps && Array.isArray(serverUserProps)) {
      for (const sp of serverUserProps) {
        const idx = combined.findIndex(cp => cp.slug === sp.slug || String(cp.id) === String(sp.id));
        if (idx >= 0) {
          combined[idx] = { ...combined[idx], ...sp };
        } else {
          combined.push(sp);
        }
      }
    }

    setUserProperties(combined);
    setIsLoading(false);
  }, [user, serverUserProps]);

  useEffect(() => {
    loadProperties();
  }, [loadProperties]);

  useEffect(() => {
    const handleUpdate = (e: any) => {
      if (e.detail) {
        handlePropertyUpdated(e.detail);
        refetchServerProps();
      }
    };
    window.addEventListener("nivaas_property_updated", handleUpdate);
    return () => window.removeEventListener("nivaas_property_updated", handleUpdate);
  }, [handlePropertyUpdated, refetchServerProps]);

  const handleConfirmDelete = async () => {
    if (!propertyToDelete || !user) return;

    try {
      setIsDeleting(true);

      // 1. Delete on server (matches by numeric ID or slug)
      await deleteMutation.mutateAsync({
        id: propertyToDelete.id,
        slug: propertyToDelete.slug,
      });

      // 2. Remove from local storage
      const localProps = storage.get<any[]>("nivaas_properties", []);
      const updated = localProps.filter(
        p => p.id !== propertyToDelete.id && p.slug !== propertyToDelete.slug
      );
      storage.set("nivaas_properties", updated);
      setUserProperties(updated.filter(p => String(p.sellerId) === String(user.id)));

      // 3. Purge from saved favorites everywhere
      favoritesManager.remove(propertyToDelete.id, user.id);
      if (propertyToDelete.slug) {
        favoritesManager.remove(propertyToDelete.slug, user.id);
      }

      // 4. Invalidate all catalog queries across search and home
      await utils.catalog.search.invalidate();
      await utils.catalog.home.invalidate();

      toast.success("Listing permanently deleted.");
      setPropertyToDelete(null);
    } catch (err: any) {
      console.error("[DeleteProperty] Error:", err);
      toast.error(err?.message || "Failed to delete property. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page-level corner navigation */}
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
              {t("nav.yourProperties", "Your Properties")}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Manage your published listings and update location details.
            </p>
          </div>
          {userProperties.length > 0 && (
            <Link
              href="/sell"
              className="inline-flex items-center gap-2 rounded-xl bg-[var(--orange)] px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-[var(--orange-dark)]"
            >
              <PlusCircle className="h-4 w-4" /> {t("action.listProperty", "List a Property")}
            </Link>
          )}
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center min-h-[300px]">
            <Loader2 className="h-8 w-8 animate-spin text-[var(--orange)]" />
          </div>
        ) : userProperties.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {userProperties.map((property: any) => (
              <div key={property.id || property.slug} className="relative group">
                <PropertyCard property={property} />
                <div className="mt-2.5 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedProperty(property);
                      setIsEditDialogOpen(true);
                    }}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl border border-[var(--line-strong)] bg-white px-3 py-2 text-xs font-bold text-[var(--ink)] shadow-sm hover:border-[var(--orange)] hover:text-[var(--orange-dark)] hover:bg-[#fff9f4] transition"
                  >
                    <Edit3 className="h-3.5 w-3.5 text-[var(--orange)]" /> {t("action.edit", "Edit")}
                  </button>
                  <button
                    type="button"
                    onClick={() => setPropertyToDelete(property)}
                    className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-red-200 bg-white px-3 py-2 text-xs font-bold text-red-600 shadow-sm hover:bg-red-50 hover:border-red-300 transition"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> {t("action.delete", "Delete")}
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-gray-200 bg-white shadow-sm p-12 text-center flex flex-col items-center justify-center min-h-[300px]">
            <h3 className="tracking-tight text-lg font-semibold text-[var(--ink)] mb-2">
              You haven't listed any properties yet.
            </h3>
            <p className="text-sm text-[var(--muted-ink)] max-w-sm mb-6">
              List your home, apartment, plot or commercial property on NIVAAS.
            </p>
            <Link
              href="/sell"
              className="inline-flex items-center gap-2 rounded-xl bg-[var(--orange)] px-6 py-2.5 text-sm font-bold text-white shadow-md transition hover:bg-[var(--orange-dark)]"
            >
              {t("action.listProperty", "List a Property")}
            </Link>
          </div>
        )}
      </div>

      {/* Edit Property Dialog */}
      <EditPropertyDialog
        property={selectedProperty}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onUpdated={handlePropertyUpdated}
      />

      {/* Delete Property Confirmation Dialog */}
      {propertyToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-[var(--line)] animate-in fade-in zoom-in-95">
            <div className="h-12 w-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mb-4">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold text-[var(--ink)]">
              Delete this property?
            </h3>
            <p className="mt-2 text-sm text-[var(--muted-ink)] leading-relaxed">
              Are you sure you want to permanently remove{" "}
              <strong className="text-[var(--ink)]">"{propertyToDelete.title}"</strong>?
              This listing will be deleted from the marketplace and cannot be restored.
            </p>
            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setPropertyToDelete(null)}
                disabled={isDeleting}
                className="rounded-xl border border-[var(--line-strong)] px-4 py-2.5 text-xs font-bold text-[var(--ink)] hover:bg-[var(--sand)] transition disabled:opacity-50"
              >
                {t("action.cancel", "Cancel")}
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="rounded-xl bg-red-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-red-700 transition disabled:opacity-50"
              >
                {isDeleting ? "Deleting..." : t("action.deleteProperty", "Delete Property")}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
