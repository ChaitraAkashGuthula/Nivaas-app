import { ArrowRight, Building2, House, Landmark, MapPin, ShieldCheck, Store, Waves } from "lucide-react";
import { Link } from "wouter";
import { startLogin } from "@/const";
import { PropertyCard, SearchBar, SiteHeader } from "@/components/NivaasChrome";
import { trpc } from "@/lib/trpc";

const shortcuts = [
  { label: "2 BHK", query: "bedrooms=2", icon: House },
  { label: "Apartments", query: "propertyType=apartment", icon: Building2 },
  { label: "Independent houses", query: "propertyType=independent-house", icon: House },
  { label: "Plots", query: "propertyType=plot", icon: Landmark },
  { label: "PG / Co-Living", query: "purpose=pg", icon: Waves },
  { label: "Commercial", query: "propertyType=commercial", icon: Store },
];

const typeTiles = [
  { title: "Apartments", subtitle: "Easy city living", query: "propertyType=apartment", image: "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=900&q=82" },
  { title: "Independent houses", subtitle: "Room to settle in", query: "propertyType=independent-house", image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=900&q=82" },
  { title: "Plots", subtitle: "Build what is yours", query: "propertyType=plot", image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=900&q=82" },
  { title: "PG / Co-Living", subtitle: "A simpler move", query: "purpose=pg", image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=900&q=82" },
];

export default function Home() {
  const { data, isLoading, isError } = trpc.catalog.home.useQuery();

  return (
    <div className="min-h-screen bg-[var(--paper)] text-[var(--ink)]">
      <SiteHeader />
      <main>
        <section className="relative overflow-visible border-b border-[var(--line)]">
          <div className="container grid gap-12 pb-16 pt-14 md:grid-cols-[1fr_0.72fr] md:items-end md:pb-20 md:pt-24">
            <div className="relative z-10 max-w-2xl">
              <p className="mb-5 text-xs font-bold uppercase tracking-[0.22em] text-[var(--orange-dark)]">Homes · people · neighbourhoods</p>
              <h1 className="max-w-xl text-5xl font-bold leading-[0.98] tracking-[-0.07em] md:text-7xl">Find a place that fits your life.</h1>
              <p className="mt-6 max-w-lg text-base leading-7 text-[var(--muted-ink)] md:text-lg">Search homes, apartments, plots and commercial spaces to buy or rent—starting with the places you know.</p>
              <div className="mt-8 flex flex-wrap items-center gap-3 text-sm font-semibold text-[var(--muted-ink)]">
                <span className="inline-flex items-center gap-2"><MapPin className="h-4 w-4 text-[var(--orange)]" /> Kakinada & nearby</span>
                <span className="h-1 w-1 rounded-full bg-[var(--line-strong)]" />
                <span className="inline-flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-[var(--orange)]" /> Real listings, clear details</span>
              </div>
            </div>
            <div className="relative hidden h-64 overflow-hidden rounded-[28px] bg-[#e5d7c8] md:block">
              <img src="https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1000&q=82" alt="Warm modern Indian home exterior" className="h-full w-full object-cover mix-blend-multiply opacity-90" />
              <div className="absolute bottom-4 left-4 rounded-xl bg-white/90 px-4 py-3 text-sm shadow-sm"><span className="font-bold">Good homes</span><br /><span className="text-[var(--muted-ink)]">begin with good context.</span></div>
            </div>
          </div>
          <div className="container relative z-10 mb-0 md:-mb-10">
            <SearchBar />
          </div>
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-[var(--peach)] opacity-70" />
            <div className="absolute bottom-0 left-1/2 h-24 w-24 rounded-full bg-[var(--sand)] opacity-80" />
          </div>
        </section>

        <section className="container pt-20" aria-labelledby="popular-searches">
          <div className="flex items-end justify-between gap-4"><div><p className="eyebrow">Start somewhere familiar</p><h2 id="popular-searches" className="section-title">Popular searches</h2></div><Link href="/search" className="hidden items-center gap-2 text-sm font-bold text-[var(--orange-dark)] sm:flex">View all <ArrowRight className="h-4 w-4" /></Link></div>
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {shortcuts.map(({ label, query, icon: Icon }) => <Link key={label} href={`/search?${query}`} className="group rounded-2xl border border-[var(--line)] bg-white p-4 transition hover:-translate-y-0.5 hover:border-[var(--orange)] hover:shadow-sm"><Icon className="h-5 w-5 text-[var(--orange)]" /><span className="mt-5 block text-sm font-bold">{label}</span><span className="mt-1 block text-xs text-[var(--muted-ink)]">Explore homes</span></Link>)}
          </div>
        </section>

        <section className="container pt-20" aria-labelledby="nearby-properties">
          <div className="flex items-end justify-between gap-4"><div><p className="eyebrow">Selected from the marketplace</p><h2 id="nearby-properties" className="section-title">Properties near you</h2></div><Link href="/search" className="hidden items-center gap-2 text-sm font-bold text-[var(--orange-dark)] sm:flex">See all homes <ArrowRight className="h-4 w-4" /></Link></div>
          {isLoading ? (
            <div className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              <div className="skeleton-card" />
              <div className="skeleton-card" />
              <div className="skeleton-card" />
            </div>
          ) : isError ? (
            <div className="mt-7 rounded-2xl border border-dashed border-[var(--line-strong)] p-8 text-sm text-[var(--muted-ink)]">
              We couldn’t load listings right now. Please refresh and try again.
            </div>
          ) : data?.properties?.length ? (
            <div className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {data.properties.map(property => <PropertyCard key={property.slug} property={property} />)}
            </div>
          ) : (
            <div className="mt-7 rounded-3xl border border-dashed border-[var(--line-strong)] bg-white/70 p-12 text-center">
              <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-[var(--peach)] text-[var(--orange)]">
                <House className="h-7 w-7" />
              </div>
              <h3 className="text-xl font-bold text-[var(--ink)]">No properties listed yet</h3>
              <p className="mt-2 text-sm text-[var(--muted-ink)] max-w-md mx-auto">
                Be the first to list a property on NIVAAS.
              </p>
              <div className="mt-6">
                <Link
                  href="/sell"
                  className="inline-flex items-center gap-2 rounded-xl bg-[var(--orange)] px-6 py-3 text-sm font-bold text-white shadow-md transition hover:bg-[var(--orange-dark)]"
                >
                  List Your Property
                </Link>
              </div>
            </div>
          )}
        </section>

        <section id="explore" className="container pt-20" aria-labelledby="explore-types">
          <div><p className="eyebrow">Browse by fit</p><h2 id="explore-types" className="section-title">Explore by property type</h2></div>
          <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{typeTiles.map(tile => <Link key={tile.title} href={`/search?${tile.query}`} className="group relative min-h-48 overflow-hidden rounded-[22px] bg-[var(--ink)]"><img src={tile.image} alt="" className="absolute inset-0 h-full w-full object-cover opacity-70 transition duration-500 group-hover:scale-105 group-hover:opacity-80" /><div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" /><div className="relative flex min-h-48 flex-col justify-end p-5 text-white"><span className="text-lg font-bold">{tile.title}</span><span className="mt-1 text-sm text-white/75">{tile.subtitle}</span></div></Link>)}</div>
        </section>

        <section className="container pt-20" aria-labelledby="localities">
          <div><p className="eyebrow">Begin local</p><h2 id="localities" className="section-title">Popular localities</h2></div>
          <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{data?.localities?.map(locality => <Link key={locality.slug} href={`/search?location=${encodeURIComponent(locality.name)}`} className="flex items-center justify-between rounded-2xl border border-[var(--line)] bg-white px-5 py-4 transition hover:border-[var(--orange)]"><div><p className="font-bold">{locality.name}</p><p className="mt-1 text-sm text-[var(--muted-ink)]">{locality.city}</p></div><span className="text-sm font-semibold text-[var(--orange-dark)]">{Number(locality.count)} {Number(locality.count) === 1 ? "property" : "properties"}</span></Link>)}</div>
        </section>

        <section className="container pb-24 pt-20">
          <div className="grid gap-8 overflow-hidden rounded-[28px] bg-[var(--ink)] px-7 py-9 text-white md:grid-cols-[1fr_auto] md:items-center md:px-12 md:py-12"><div><p className="eyebrow text-[var(--orange-light)]">For owners</p><h2 className="mt-2 max-w-xl text-3xl font-bold tracking-[-0.04em] md:text-4xl">List your property in a few simple steps.</h2><p className="mt-3 max-w-xl leading-7 text-white/65">Reach genuine buyers and tenants with a listing that gives people the details they need.</p></div><button type="button" onClick={() => startLogin()} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--orange)] px-5 py-3 text-sm font-bold text-white transition hover:bg-[var(--orange-light)] hover:text-[var(--ink)]">List your property <ArrowRight className="h-4 w-4" /></button></div>
        </section>
      </main>
      <footer className="border-t border-[var(--line)] py-10">
        <div className="container flex flex-col gap-6 text-sm text-[var(--muted-ink)] sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" aria-label="NIVAAS home">
              <img src="/assets/nivaas-logo.png" alt="NIVAAS" className="h-9 w-auto object-contain" />
            </Link>
            <span className="text-xs text-[var(--muted-ink)]">© 2026 NIVAAS. All rights reserved.</span>
          </div>
          <div className="flex flex-wrap gap-6 text-sm font-medium">
            <Link href="/search" className="hover:text-[var(--ink)]">Buy & Rent</Link>
            <Link href="/sell" className="hover:text-[var(--ink)]">Sell</Link>
            <Link href="/explore" className="hover:text-[var(--ink)]">Explore</Link>
            <Link href="/reviews" className="hover:text-[var(--ink)]">Reviews</Link>
            <Link href="/privacy" className="hover:text-[var(--ink)]">Privacy</Link>
            <Link href="/terms" className="hover:text-[var(--ink)]">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
