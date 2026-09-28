import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "@/_core/hooks/useAuth";
import { Link } from "wouter";
import { useLocationSelector } from "@/components/LocationSelector";
import { Home, Heart, Search } from "lucide-react";

export default function Overview() {
  const { user } = useAuth({ redirectOnUnauthenticated: true });
  const globalLocation = useLocationSelector();
  const locationName = globalLocation.formattedName || "your area";

  if (!user) return null;

  return (
    <DashboardLayout>
      <div className="space-y-8 max-w-4xl mx-auto py-8">
        <div className="mb-2">
          <Link href="/" className="inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--orange-dark)] hover:underline transition">
            ← Back to NIVAAS
          </Link>
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[var(--ink)]">Welcome back, {user.name.split(' ')[0]}</h1>
          <p className="text-lg text-[var(--muted-ink)] mt-2">
            Continue exploring homes in {locationName}
          </p>
          <div className="mt-6">
            <Link href="/search" className="inline-flex items-center gap-2 rounded-2xl bg-[var(--orange)] px-6 py-3 text-sm font-bold text-white shadow-md transition hover:bg-[var(--orange-dark)]">
              <Search className="h-4 w-4" /> Search Properties
            </Link>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mt-8">
          <Link href="/dashboard/properties" className="group rounded-3xl border border-[var(--line-strong)] bg-white p-6 transition hover:border-[var(--orange)] hover:shadow-lg">
            <div className="h-12 w-12 rounded-2xl bg-[var(--peach)] flex items-center justify-center mb-4 text-[var(--orange-dark)]">
              <Home className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold mb-2 group-hover:text-[var(--orange-dark)]">Your Properties</h3>
            <p className="text-sm text-[var(--muted-ink)]">Manage your published and draft property listings.</p>
          </Link>

          <Link href="/dashboard/saved-homes" className="group rounded-3xl border border-[var(--line-strong)] bg-white p-6 transition hover:border-[var(--orange)] hover:shadow-lg">
            <div className="h-12 w-12 rounded-2xl bg-[var(--peach)] flex items-center justify-center mb-4 text-[var(--orange-dark)]">
              <Heart className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold mb-2 group-hover:text-[var(--orange-dark)]">Saved Properties</h3>
            <p className="text-sm text-[var(--muted-ink)]">View the properties you have favorited and saved.</p>
          </Link>

          <Link href="/dashboard/searches" className="group rounded-3xl border border-[var(--line-strong)] bg-white p-6 transition hover:border-[var(--orange)] hover:shadow-lg">
            <div className="h-12 w-12 rounded-2xl bg-[var(--peach)] flex items-center justify-center mb-4 text-[var(--orange-dark)]">
              <Search className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold mb-2 group-hover:text-[var(--orange-dark)]">Recent Searches</h3>
            <p className="text-sm text-[var(--muted-ink)]">Pick up where you left off with your recent filters.</p>
          </Link>
        </div>
      </div>
    </DashboardLayout>
  );
}
