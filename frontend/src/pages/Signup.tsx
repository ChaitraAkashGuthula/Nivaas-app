import { useState } from "react";
import { Link, useLocation } from "wouter";
import { SiteHeader } from "@/components/NivaasChrome";
import { localDb } from "@/lib/localStorage";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { NivaasSelect } from "@/components/ui/NivaasSelect";

export default function Signup() {
  const [, setLocation] = useLocation();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    preferredLanguage: "English",
  });
  const [consent, setConsent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    if (!consent) {
      toast.error("Please agree to the Terms & Conditions and Privacy Policy to create your account.");
      return;
    }

    setLoading(true);

    try {
      const res = await localDb.auth.signup(
        {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          accountType: "buyer",
          preferredLanguage: formData.preferredLanguage,
          termsAccepted: consent,
          privacyAccepted: consent,
          termsVersion: "1.0",
          privacyVersion: "1.0",
          termsAcceptedAt: new Date().toISOString(),
          privacyAcceptedAt: new Date().toISOString(),
        },
        formData.password
      );

      if (res.success) {
        toast.success("Account created successfully.");
        window.dispatchEvent(new Event("nivaas-auth-change"));
        const params = new URLSearchParams(window.location.search);
        const redirect = params.get("redirect") || "/";
        setLocation(redirect);
      } else {
        toast.error(res.error || "Signup failed");
      }
    } catch (err) {
      toast.error("An error occurred during signup.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--paper)] text-[var(--ink)] flex flex-col">
      <SiteHeader />
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-lg bg-white p-8 rounded-[24px] border border-[var(--line-strong)] shadow-[0_18px_46px_rgba(35,31,28,0.06)] my-8">
          <div className="flex justify-center mb-6">
            <Link href="/" aria-label="NIVAAS Home">
              <img src="/assets/nivaas-logo.png" alt="NIVAAS Logo" className="h-16 w-auto object-contain" />
            </Link>
          </div>
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold tracking-tight">Create your account</h1>
            <p className="text-sm text-[var(--muted-ink)] mt-2">
              Join NIVAAS to explore or list properties
            </p>
          </div>
          
          <form onSubmit={handleSignup} className="space-y-4">

            <div>
              <label className="block text-sm font-semibold mb-1">Full name *</label>
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
              <label className="block text-sm font-semibold mb-1">Email address *</label>
              <input 
                type="email" 
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full rounded-xl border border-[var(--line-strong)] px-4 py-3 outline-none focus:border-[var(--ink)] focus:ring-1 focus:ring-[var(--ink)] transition"
              />
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
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-1">Password *</label>
                <input 
                  type="password" 
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full rounded-xl border border-[var(--line-strong)] px-4 py-3 outline-none focus:border-[var(--ink)] focus:ring-1 focus:ring-[var(--ink)] transition"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Confirm password *</label>
                <input 
                  type="password" 
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  className="w-full rounded-xl border border-[var(--line-strong)] px-4 py-3 outline-none focus:border-[var(--ink)] focus:ring-1 focus:ring-[var(--ink)] transition"
                />
              </div>
            </div>

            <div className="flex items-start gap-3 mt-4">
              <input 
                type="checkbox" 
                id="consent"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-gray-300 text-[var(--orange)] focus:ring-[var(--orange)]"
              />
              <label htmlFor="consent" className="text-sm text-[var(--muted-ink)] leading-relaxed">
                I agree to the NIVAAS <Link href="/terms" className="text-[var(--orange-dark)] hover:underline font-medium">Terms & Conditions</Link> and acknowledge the <Link href="/privacy" className="text-[var(--orange-dark)] hover:underline font-medium">Privacy Policy</Link>.
              </label>
            </div>

            <Button 
              type="submit" 
              disabled={loading || !consent}
              className="w-full min-h-12 mt-6 rounded-xl bg-[var(--orange)] hover:bg-[var(--orange-dark)] text-white font-bold transition shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Creating account..." : "Create account"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-[var(--muted-ink)]">
            Already have an account?{" "}
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
