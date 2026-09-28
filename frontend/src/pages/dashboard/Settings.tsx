import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "@/_core/hooks/useAuth";
import { Link, useLocation } from "wouter";
import { useState, useEffect } from "react";
import { storage } from "@/lib/localStorage/storage";
import { localDb } from "@/lib/localStorage";
import { toast } from "sonner";
import { useTheme, Theme } from "@/contexts/ThemeContext";
import { useTranslation, LanguageCode } from "@/contexts/LanguageContext";
import {
  User,
  Mail,
  Phone,
  Sun,
  Moon,
  Monitor,
  Globe,
  Bell,
  Lock,
  Eye,
  LogOut,
  Trash2,
  Check,
  AlertTriangle,
  ArrowLeft,
  KeyRound
} from "lucide-react";

export default function SettingsPage() {
  const { user, logout, refresh } = useAuth({ redirectOnUnauthenticated: true, redirectPath: "/settings" });
  const [, setLocation] = useLocation();
  const { theme, setTheme } = useTheme();
  const { language, setLanguage, t } = useTranslation();

  // Notification Preferences
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    propertyAlerts: true,
    savedSearchAlerts: true,
  });

  // Privacy Preferences
  const [privacy, setPrivacy] = useState({
    profileVisibility: "registered", // "public" | "registered"
    contactVisibility: "verified", // "show" | "verified"
    locationVisibility: "area_city", // "locality" | "area_city" | "full"
  });

  // Change Password state
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Delete Account confirmation dialog state
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  useEffect(() => {
    const savedNotifs = storage.get("nivaas_notification_settings", {
      emailNotifications: true,
      propertyAlerts: true,
      savedSearchAlerts: true,
    });
    setNotifications(savedNotifs);

    const savedPrivacy = storage.get("nivaas_privacy_settings", {
      profileVisibility: "registered",
      contactVisibility: "verified",
      locationVisibility: "area_city",
    });
    setPrivacy(savedPrivacy);
  }, []);

  if (!user) return null;

  const handleToggleNotification = (key: keyof typeof notifications) => {
    const updated = { ...notifications, [key]: !notifications[key] };
    setNotifications(updated);
    storage.set("nivaas_notification_settings", updated);
    toast.success("Notification preference updated");
  };

  const handleChangePrivacy = (key: keyof typeof privacy, val: string) => {
    const updated = { ...privacy, [key]: val };
    setPrivacy(updated);
    storage.set("nivaas_privacy_settings", updated);
    toast.success("Privacy preference updated");
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      toast.error("New password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match.");
      return;
    }

    try {
      setPasswordLoading(true);
      // Verify login with old password
      const verifyRes = await localDb.auth.login(user.email, oldPassword);
      if (!verifyRes.success) {
        toast.error("Current password is incorrect.");
        return;
      }

      // Update password in local database
      await localDb.auth.updatePassword(user.id, oldPassword, newPassword);
      toast.success("Password updated successfully!");
      setShowPasswordDialog(false);
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      toast.error(err?.message || "Failed to update password.");
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleSignOut = async () => {
    await logout();
    toast.success("Signed out successfully.");
    setLocation("/");
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText.toLowerCase() !== "delete") {
      toast.error('Please type "delete" to confirm.');
      return;
    }

    try {
      setIsDeletingAccount(true);
      // Delete user's properties from local storage
      const localProps = storage.get<any[]>("nivaas_properties", []);
      storage.set(
        "nivaas_properties",
        localProps.filter(p => String(p.sellerId) !== String(user.id))
      );

      // Delete user record from localDb
      localDb.users.deleteUser(user.id);
      await logout();
      toast.success("Account deleted successfully.");
      setLocation("/");
    } catch (err: any) {
      toast.error("Failed to delete account. Please try again.");
    } finally {
      setIsDeletingAccount(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8 max-w-3xl pb-16">
        {/* Top-left Corner Navigation */}
        <div className="mb-2">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--orange-dark)] hover:underline transition"
          >
            ← {t("action.backHome", "Back Home")}
          </Link>
        </div>

        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            {t("settings.title", "Settings")}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {t("settings.subtitle", "Manage your account preferences, appearance, and privacy.")}
          </p>
        </div>

        {/* 1. ACCOUNT SECTION */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-[var(--peach)] text-[var(--orange-dark)]">
                <User className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  {t("settings.account", "Account")}
                </h2>
                <p className="text-xs text-gray-500">Your profile credentials and security.</p>
              </div>
            </div>
            <Link
              href="/profile"
              className="rounded-xl border border-[var(--line-strong)] px-3.5 py-1.5 text-xs font-bold text-[var(--ink)] hover:border-[var(--orange)] hover:text-[var(--orange-dark)] transition"
            >
              {t("action.edit", "Edit Profile")}
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="p-4 rounded-xl bg-[var(--sand)]">
              <span className="text-xs font-semibold text-[var(--muted-ink)] block">Full Name</span>
              <span className="text-sm font-bold text-[var(--ink)] mt-1 block">{user.name}</span>
            </div>
            <div className="p-4 rounded-xl bg-[var(--sand)]">
              <span className="text-xs font-semibold text-[var(--muted-ink)] block">Email Address</span>
              <span className="text-sm font-bold text-[var(--ink)] mt-1 block">{user.email}</span>
            </div>
            <div className="p-4 rounded-xl bg-[var(--sand)]">
              <span className="text-xs font-semibold text-[var(--muted-ink)] block">Phone</span>
              <span className="text-sm font-bold text-[var(--ink)] mt-1 block">{user.phone || "Not provided"}</span>
            </div>
            <div className="p-4 rounded-xl bg-[var(--sand)] flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-[var(--muted-ink)] block">Password</span>
                <span className="text-sm font-bold text-[var(--ink)] mt-1 block">••••••••</span>
              </div>
              <button
                type="button"
                onClick={() => setShowPasswordDialog(true)}
                className="text-xs font-bold text-[var(--orange-dark)] hover:underline"
              >
                Change
              </button>
            </div>
          </div>
        </div>

        {/* 2. APPEARANCE SECTION */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
            <div className="p-2 rounded-xl bg-[var(--peach)] text-[var(--orange-dark)]">
              <Sun className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                {t("settings.appearance", "Appearance")}
              </h2>
              <p className="text-xs text-gray-500">Choose your preferred application color theme.</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 pt-2">
            <button
              type="button"
              onClick={() => setTheme("light")}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl border text-center transition ${
                theme === "light"
                  ? "border-[var(--orange)] bg-[#fff9f4] text-[var(--orange-dark)] ring-2 ring-[var(--orange)]/30"
                  : "border-gray-200 hover:border-gray-300 text-gray-700 bg-white"
              }`}
            >
              <Sun className="h-6 w-6" />
              <span className="text-xs font-bold">Light</span>
            </button>

            <button
              type="button"
              onClick={() => setTheme("dark")}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl border text-center transition ${
                theme === "dark"
                  ? "border-[var(--orange)] bg-[#fff9f4] text-[var(--orange-dark)] ring-2 ring-[var(--orange)]/30"
                  : "border-gray-200 hover:border-gray-300 text-gray-700 bg-white"
              }`}
            >
              <Moon className="h-6 w-6" />
              <span className="text-xs font-bold">Dark</span>
            </button>

            <button
              type="button"
              onClick={() => setTheme("system")}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl border text-center transition ${
                theme === "system"
                  ? "border-[var(--orange)] bg-[#fff9f4] text-[var(--orange-dark)] ring-2 ring-[var(--orange)]/30"
                  : "border-gray-200 hover:border-gray-300 text-gray-700 bg-white"
              }`}
            >
              <Monitor className="h-6 w-6" />
              <span className="text-xs font-bold">System</span>
            </button>
          </div>
        </div>

        {/* 3. LANGUAGE SECTION */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
            <div className="p-2 rounded-xl bg-[var(--peach)] text-[var(--orange-dark)]">
              <Globe className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                {t("settings.language", "Language")}
              </h2>
              <p className="text-xs text-gray-500">Select language for interface navigation and labels.</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 pt-2">
            {[
              { code: "en" as LanguageCode, label: "English", sub: "English" },
              { code: "te" as LanguageCode, label: "తెలుగు", sub: "Telugu" },
              { code: "hi" as LanguageCode, label: "हिन्दी", sub: "Hindi" },
            ].map(item => (
              <button
                key={item.code}
                type="button"
                onClick={() => setLanguage(item.code)}
                className={`flex flex-col items-center gap-1.5 p-4 rounded-xl border text-center transition ${
                  language === item.code
                    ? "border-[var(--orange)] bg-[#fff9f4] text-[var(--orange-dark)] ring-2 ring-[var(--orange)]/30"
                    : "border-gray-200 hover:border-gray-300 text-gray-700 bg-white"
                }`}
              >
                <span className="text-sm font-bold">{item.label}</span>
                <span className="text-[11px] text-[var(--muted-ink)]">{item.sub}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 4. NOTIFICATIONS SECTION */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
            <div className="p-2 rounded-xl bg-[var(--peach)] text-[var(--orange-dark)]">
              <Bell className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                {t("settings.notifications", "Notifications")}
              </h2>
              <p className="text-xs text-gray-500">Stored preferences for property updates and searches.</p>
            </div>
          </div>

          <div className="space-y-4 pt-1">
            {[
              {
                key: "emailNotifications" as const,
                title: "Email Notifications",
                desc: "Receive account and listing updates via email.",
              },
              {
                key: "propertyAlerts" as const,
                title: "Property Alerts",
                desc: "Get notified when new properties match your saved localities.",
              },
              {
                key: "savedSearchAlerts" as const,
                title: "Saved Search Alerts",
                desc: "Periodic reminders for your saved search criteria.",
              },
            ].map(item => (
              <div key={item.key} className="flex items-center justify-between p-3 rounded-xl hover:bg-[var(--sand)] transition">
                <div>
                  <h4 className="text-sm font-bold text-[var(--ink)]">{item.title}</h4>
                  <p className="text-xs text-[var(--muted-ink)]">{item.desc}</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggleNotification(item.key)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    notifications[item.key] ? "bg-[var(--orange)]" : "bg-gray-200"
                  }`}
                  role="switch"
                  aria-checked={notifications[item.key]}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      notifications[item.key] ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* 5. PRIVACY SECTION */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
            <div className="p-2 rounded-xl bg-[var(--peach)] text-[var(--orange-dark)]">
              <Eye className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                {t("settings.privacy", "Privacy")}
              </h2>
              <p className="text-xs text-gray-500">Control what information is visible to visitors.</p>
            </div>
          </div>

          <div className="space-y-4 pt-1">
            <div className="flex items-center justify-between p-3 rounded-xl hover:bg-[var(--sand)]">
              <div>
                <h4 className="text-sm font-bold text-[var(--ink)]">Profile Visibility</h4>
                <p className="text-xs text-[var(--muted-ink)]">Who can see your seller profile.</p>
              </div>
              <select
                value={privacy.profileVisibility}
                onChange={(e) => handleChangePrivacy("profileVisibility", e.target.value)}
                className="rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-xs font-bold text-[var(--ink)] outline-none"
              >
                <option value="registered">Registered Users Only</option>
                <option value="public">Public</option>
              </select>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl hover:bg-[var(--sand)]">
              <div>
                <h4 className="text-sm font-bold text-[var(--ink)]">Contact Information Visibility</h4>
                <p className="text-xs text-[var(--muted-ink)]">Phone number display preference on listings.</p>
              </div>
              <select
                value={privacy.contactVisibility}
                onChange={(e) => handleChangePrivacy("contactVisibility", e.target.value)}
                className="rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-xs font-bold text-[var(--ink)] outline-none"
              >
                <option value="verified">Verified Buyers Only</option>
                <option value="show">Always Show Phone</option>
              </select>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl hover:bg-[var(--sand)]">
              <div>
                <h4 className="text-sm font-bold text-[var(--ink)]">Location Visibility Default</h4>
                <p className="text-xs text-[var(--muted-ink)]">Default address precision for new property listings.</p>
              </div>
              <select
                value={privacy.locationVisibility}
                onChange={(e) => handleChangePrivacy("locationVisibility", e.target.value)}
                className="rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-xs font-bold text-[var(--ink)] outline-none"
              >
                <option value="area_city">Area & City</option>
                <option value="locality">Locality Only</option>
                <option value="full">Full Street Address</option>
              </select>
            </div>
          </div>
        </div>

        {/* 6. ACCOUNT ACTIONS */}
        <div className="rounded-2xl border border-red-100 bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
            <div className="p-2 rounded-xl bg-red-50 text-red-600">
              <LogOut className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                {t("settings.accountActions", "Account Actions")}
              </h2>
              <p className="text-xs text-gray-500">Session and account lifecycle actions.</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              type="button"
              onClick={handleSignOut}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-[var(--line-strong)] bg-white px-5 py-2.5 text-sm font-bold text-[var(--ink)] hover:bg-[var(--sand)] transition shadow-sm"
            >
              <LogOut className="h-4 w-4" /> {t("action.signOut", "Sign Out")}
            </button>

            <button
              type="button"
              onClick={() => setShowDeleteDialog(true)}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-5 py-2.5 text-sm font-bold text-red-600 hover:bg-red-100 transition shadow-sm"
            >
              <Trash2 className="h-4 w-4" /> {t("settings.deleteAccount", "Delete Account")}
            </button>
          </div>
        </div>
      </div>

      {/* Change Password Dialog */}
      {showPasswordDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-[var(--line)] animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--line)]">
              <h3 className="text-lg font-bold text-[var(--ink)] flex items-center gap-2">
                <KeyRound className="h-5 w-5 text-[var(--orange)]" /> Change Password
              </h3>
              <button
                type="button"
                onClick={() => setShowPasswordDialog(false)}
                className="text-[var(--muted-ink)] hover:text-[var(--ink)]"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleChangePassword} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[var(--muted-ink)] mb-1">
                  Current Password
                </label>
                <input
                  type="password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  required
                  className="w-full rounded-xl border border-[var(--line-strong)] px-3.5 py-2 text-sm outline-none focus:border-[var(--orange)]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[var(--muted-ink)] mb-1">
                  New Password (min 6 chars)
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  className="w-full rounded-xl border border-[var(--line-strong)] px-3.5 py-2 text-sm outline-none focus:border-[var(--orange)]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[var(--muted-ink)] mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full rounded-xl border border-[var(--line-strong)] px-3.5 py-2 text-sm outline-none focus:border-[var(--orange)]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowPasswordDialog(false)}
                  className="rounded-xl border border-[var(--line-strong)] px-4 py-2 text-xs font-bold text-[var(--ink)] hover:bg-[var(--sand)]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={passwordLoading}
                  className="rounded-xl bg-[var(--orange)] px-5 py-2 text-xs font-bold text-white hover:bg-[var(--orange-dark)] transition disabled:opacity-50"
                >
                  {passwordLoading ? "Updating..." : "Update Password"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Account Dialog */}
      {showDeleteDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-[var(--line)] animate-in fade-in zoom-in-95">
            <div className="h-12 w-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mb-4">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold text-[var(--ink)]">
              Permanently Delete Account?
            </h3>
            <p className="mt-2 text-sm text-[var(--muted-ink)] leading-relaxed">
              This will permanently delete your account, your listed properties, your saved homes, and saved searches.
            </p>
            <div className="mt-4">
              <label className="block text-xs font-bold text-[var(--muted-ink)] mb-1">
                Type <strong>delete</strong> to confirm:
              </label>
              <input
                type="text"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="delete"
                className="w-full rounded-xl border border-red-300 px-3.5 py-2 text-sm outline-none focus:border-red-500"
              />
            </div>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowDeleteDialog(false);
                  setDeleteConfirmText("");
                }}
                className="rounded-xl border border-[var(--line-strong)] px-4 py-2.5 text-xs font-bold text-[var(--ink)] hover:bg-[var(--sand)]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={isDeletingAccount || deleteConfirmText.toLowerCase() !== "delete"}
                className="rounded-xl bg-red-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDeletingAccount ? "Deleting..." : "Permanently Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
