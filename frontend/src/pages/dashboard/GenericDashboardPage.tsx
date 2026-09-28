import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "@/_core/hooks/useAuth";
import { Link } from "wouter";

export default function GenericDashboardPage({ 
  title, 
  description,
  emptyStateTitle = "No data available",
  emptyStateDesc = "This section is currently empty. Start interacting with properties to see information here.",
  actionLabel,
  actionHref
}: { 
  title: string, 
  description: string,
  emptyStateTitle?: string,
  emptyStateDesc?: string,
  actionLabel?: string,
  actionHref?: string
}) {
  const { user } = useAuth({ redirectOnUnauthenticated: true });

  if (!user) return null;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="mb-2">
          <Link href="/" className="inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--orange-dark)] hover:underline transition">
            ← Back Home
          </Link>
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">{title}</h1>
          <p className="text-sm text-gray-500 mt-1">{description}</p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-12 text-center flex flex-col items-center justify-center min-h-[300px]">
          <div className="h-12 w-12 rounded-full bg-orange-50 text-orange-500 flex items-center justify-center mb-4">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
          </div>
          <h3 className="tracking-tight text-lg font-semibold text-gray-900 mb-1">{emptyStateTitle}</h3>
          <p className="text-sm text-gray-500 max-w-sm mb-6">{emptyStateDesc}</p>
          {actionLabel && actionHref && (
            <Link href={actionHref} className="inline-flex items-center gap-2 rounded-xl bg-[var(--orange)] px-6 py-2.5 text-sm font-bold text-white shadow-md transition hover:bg-[var(--orange-dark)]">
              {actionLabel}
            </Link>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
