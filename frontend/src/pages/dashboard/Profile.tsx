import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "@/_core/hooks/useAuth";
import { useState } from "react";
import { Link } from "wouter";
import { localDb } from "@/lib/localStorage";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { NivaasSelect } from "@/components/ui/NivaasSelect";

import { useTranslation } from "@/contexts/LanguageContext";

export default function Profile() {
  const { user, refresh } = useAuth({ redirectOnUnauthenticated: true });
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    preferredLanguage: user?.preferredLanguage || "English",
  });

  if (!user) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      localDb.users.updateUser(user.id, formData);
      toast.success("Profile updated successfully");
      refresh();
    } catch (error) {
      toast.error("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-3xl">
        <div className="mb-2">
          <Link href="/" className="inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--orange-dark)] hover:underline transition">
            ← {t("actions.backHome")}
          </Link>
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">{t("nav.profile")}</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your account information and preferences.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-xl border border-gray-200">
          <div>
            <label className="block text-sm font-semibold mb-1">Full name</label>
            <input 
              type="text" 
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full rounded-xl border border-[var(--line-strong)] px-4 py-3 outline-none focus:border-[var(--ink)] focus:ring-1 focus:ring-[var(--ink)] transition"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1">Email address</label>
            <input 
              type="email" 
              value={user.email}
              disabled
              className="w-full rounded-xl border border-[var(--line-strong)] px-4 py-3 outline-none bg-gray-50 text-gray-500 cursor-not-allowed"
            />
            <p className="text-xs text-muted-foreground mt-1">Email cannot be changed directly.</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-1">Phone number</label>
              <input 
                type="tel" 
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full rounded-xl border border-[var(--line-strong)] px-4 py-3 outline-none focus:border-[var(--ink)] focus:ring-1 focus:ring-[var(--ink)] transition"
              />
            </div>
            <div>
              <NivaasSelect 
                label="Preferred language"
                name="preferredLanguage" 
                value={formData.preferredLanguage} 
                onChange={(val) => setFormData(prev => ({ ...prev, preferredLanguage: val }))}
                triggerClassName="bg-white border-[var(--line-strong)]"
                options={[
                  { value: "English", label: "English" },
                  { value: "Telugu", label: "Telugu" },
                  { value: "Hindi", label: "Hindi" }
                ]}
              />
            </div>
          </div>
          


          <Button 
            type="submit" 
            disabled={loading}
            className="w-full sm:w-auto min-h-11 rounded-xl bg-[var(--orange)] hover:bg-[var(--orange-dark)] text-white font-bold transition shadow-sm px-8"
          >
            {loading ? "Saving..." : "Save changes"}
          </Button>
        </form>
      </div>
    </DashboardLayout>
  );
}
