import { useState } from "react";
import { Link } from "wouter";
import { SiteHeader } from "@/components/NivaasChrome";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    toast.success("Password reset instructions sent (Development mode)");
  };

  return (
    <div className="min-h-screen bg-[var(--paper)] text-[var(--ink)] flex flex-col">
      <SiteHeader />
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white p-8 rounded-[24px] border border-[var(--line-strong)] shadow-[0_18px_46px_rgba(35,31,28,0.06)]">
          <div className="flex justify-center mb-6">
            <Link href="/" aria-label="NIVAAS Home">
              <img src="/assets/nivaas-logo.png" alt="NIVAAS Logo" className="h-16 w-auto object-contain" />
            </Link>
          </div>
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold tracking-tight">Reset password</h1>
            <p className="text-sm text-[var(--muted-ink)] mt-2">
              Enter your email to receive reset instructions
            </p>
            <div className="mt-4 p-3 bg-blue-50 text-blue-800 text-xs rounded-xl text-left border border-blue-100">
              <strong>Developer Note:</strong> This is local development authentication. An actual email will not be sent. This flow isolates reset architecture for future backend integration.
            </div>
          </div>
          
          {!submitted ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-1">Email address</label>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full rounded-xl border border-[var(--line-strong)] px-4 py-3 outline-none focus:border-[var(--ink)] focus:ring-1 focus:ring-[var(--ink)] transition"
                />
              </div>

              <Button 
                type="submit" 
                className="w-full min-h-12 rounded-xl bg-[var(--ink)] hover:bg-black text-white font-bold transition shadow-md"
              >
                Send reset link
              </Button>
            </form>
          ) : (
            <div className="text-center py-6">
              <div className="mx-auto w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              </div>
              <h3 className="font-bold text-lg mb-2">Check your email</h3>
              <p className="text-sm text-[var(--muted-ink)] mb-6">
                We've sent a password reset link to <strong>{email}</strong>.
              </p>
              <Button 
                onClick={() => setSubmitted(false)}
                variant="outline"
                className="w-full rounded-xl"
              >
                Try another email
              </Button>
            </div>
          )}

          <p className="mt-6 text-center text-sm text-[var(--muted-ink)]">
            Remembered your password?{" "}
            <Link href="/login" className="text-[var(--orange-dark)] font-semibold hover:underline">
              Sign in
            </Link>
          </p>

          <div className="mt-6 text-center">
            <Link href="/" className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--orange-dark)] hover:underline">
              ← Back Home
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
