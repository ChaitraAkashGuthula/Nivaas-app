import { useState } from "react";
import { Link, useLocation } from "wouter";
import { SiteHeader } from "@/components/NivaasChrome";
import { localDb } from "@/lib/localStorage";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export default function Login() {
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await localDb.auth.login(email, password);
      if (res.success) {
        toast.success("Welcome back!");
        window.dispatchEvent(new Event("nivaas-auth-change"));
        
        // Return to where they wanted to go
        const params = new URLSearchParams(window.location.search);
        const redirect = params.get("redirect") || "/";
        setLocation(redirect);
      } else {
        toast.error(res.error || "Login failed");
      }
    } catch (err) {
      toast.error("An error occurred during login.");
    } finally {
      setLoading(false);
    }
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
            <h1 className="text-2xl font-bold tracking-tight">Sign in to your account</h1>
            <p className="text-sm text-[var(--muted-ink)] mt-2">
              Welcome back to NIVAAS
            </p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-4">
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
            
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-sm font-semibold">Password</label>
                <Link href="/forgot-password" className="text-xs text-[var(--orange-dark)] font-medium hover:underline">
                  Forgot password?
                </Link>
              </div>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full rounded-xl border border-[var(--line-strong)] px-4 py-3 outline-none focus:border-[var(--ink)] focus:ring-1 focus:ring-[var(--ink)] transition"
              />
            </div>

            <Button 
              type="submit" 
              disabled={loading}
              className="w-full min-h-12 rounded-xl bg-[var(--orange)] hover:bg-[var(--orange-dark)] text-white font-bold transition shadow-md"
            >
              {loading ? "Signing in..." : "Sign in"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-[var(--muted-ink)]">
            Don't have an account?{" "}
            <Link href="/signup" className="text-[var(--orange-dark)] font-semibold hover:underline">
              Sign up
            </Link>
          </p>
          <div className="mt-8 text-center text-xs text-[var(--muted-ink)] flex items-center justify-center gap-4">
            <Link href="/" className="font-semibold text-[var(--orange-dark)] hover:underline">← Back Home</Link>
            <span>•</span>
            <Link href="/privacy" className="hover:text-[var(--ink)] hover:underline">Privacy Policy</Link>
            <span>•</span>
            <Link href="/terms" className="hover:text-[var(--ink)] hover:underline">Terms & Conditions</Link>
          </div>
        </div>
      </main>
    </div>
  );
}
