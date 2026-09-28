import { SiteHeader } from "@/components/NivaasChrome";
import { Link } from "wouter";
import { Home, Key, MapPin, Building, Search, Bookmark, Building2, Store, PlusCircle } from "lucide-react";
import { useLocationSelector } from "@/components/LocationSelector";

export default function ExplorePage() {
  const globalLocation = useLocationSelector();
  const currentCity = globalLocation.city || "Kakinada";

  return (
    <div className="min-h-screen bg-[var(--paper)] text-[var(--ink)]">
      <SiteHeader />
      <main className="pb-20">
        
        {/* HERO */}
        <section className="bg-[var(--sand)] py-16 text-center border-b border-[var(--line)]">
          <div className="container max-w-4xl text-left mb-6">
            <Link href="/" className="inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--orange-dark)] hover:underline transition">
              ← Back Home
            </Link>
          </div>
          <div className="container max-w-4xl text-center">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-[var(--ink)] mb-6">Explore NIVAAS</h1>
            <p className="text-lg md:text-xl text-[var(--muted-ink)] font-medium">
              Everything you need to find, rent, buy, or list a place.
            </p>
          </div>
        </section>

        {/* WHAT IS NIVAAS */}
        <section className="py-20 container max-w-4xl">
          <h2 className="text-3xl font-bold mb-6 text-center">What is NIVAAS?</h2>
          <p className="text-[var(--muted-ink)] text-lg leading-relaxed text-center mb-12 max-w-3xl mx-auto">
            NIVAAS is a local real-estate marketplace designed to help people discover homes, apartments, plots, PG/co-living spaces, and commercial properties in the places they know. We focus on simple property discovery, local locations, clear information, and making it easy to communicate with property owners.
          </p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <Link href="/search?purpose=buy" className="group rounded-3xl border border-[var(--line-strong)] bg-white p-6 transition hover:border-[var(--orange)] hover:shadow-lg">
              <div className="h-12 w-12 rounded-2xl bg-[var(--peach)] flex items-center justify-center mb-4 text-[var(--orange-dark)]">
                <Home className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold mb-2 group-hover:text-[var(--orange-dark)]">BUY</h3>
              <p className="text-sm text-[var(--muted-ink)]">Find homes, apartments, plots and other properties available for purchase.</p>
            </Link>

            <Link href="/search?purpose=rent" className="group rounded-3xl border border-[var(--line-strong)] bg-white p-6 transition hover:border-[var(--orange)] hover:shadow-lg">
              <div className="h-12 w-12 rounded-2xl bg-[var(--peach)] flex items-center justify-center mb-4 text-[var(--orange-dark)]">
                <Key className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold mb-2 group-hover:text-[var(--orange-dark)]">RENT</h3>
              <p className="text-sm text-[var(--muted-ink)]">Discover homes and spaces available for rent.</p>
            </Link>

            <Link href="/sell" className="group rounded-3xl border border-[var(--line-strong)] bg-white p-6 transition hover:border-[var(--orange)] hover:shadow-lg">
              <div className="h-12 w-12 rounded-2xl bg-[var(--peach)] flex items-center justify-center mb-4 text-[var(--orange-dark)]">
                <PlusCircle className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold mb-2 group-hover:text-[var(--orange-dark)]">LIST A PROPERTY</h3>
              <p className="text-sm text-[var(--muted-ink)]">Owners can add their property and provide details for potential buyers or tenants.</p>
            </Link>

            <Link href="/search?purpose=pg" className="group rounded-3xl border border-[var(--line-strong)] bg-white p-6 transition hover:border-[var(--orange)] hover:shadow-lg">
              <div className="h-12 w-12 rounded-2xl bg-[var(--peach)] flex items-center justify-center mb-4 text-[var(--orange-dark)]">
                <Building className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold mb-2 group-hover:text-[var(--orange-dark)]">PG & CO-LIVING</h3>
              <p className="text-sm text-[var(--muted-ink)]">Find suitable PG and co-living options.</p>
            </Link>

            <Link href="/search?purpose=commercial" className="group rounded-3xl border border-[var(--line-strong)] bg-white p-6 transition hover:border-[var(--orange)] hover:shadow-lg">
              <div className="h-12 w-12 rounded-2xl bg-[var(--peach)] flex items-center justify-center mb-4 text-[var(--orange-dark)]">
                <Building2 className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold mb-2 group-hover:text-[var(--orange-dark)]">COMMERCIAL</h3>
              <p className="text-sm text-[var(--muted-ink)]">Explore offices, shops, warehouses and other commercial spaces.</p>
            </Link>

            <div className="group rounded-3xl border border-[var(--line-strong)] bg-white p-6 transition">
              <div className="h-12 w-12 rounded-2xl bg-[var(--peach)] flex items-center justify-center mb-4 text-[var(--orange-dark)]">
                <MapPin className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold mb-2">EXPLORE LOCALITIES</h3>
              <p className="text-sm text-[var(--muted-ink)]">Browse properties based on cities, areas and local neighbourhoods.</p>
            </div>
          </div>
        </section>

        {/* HOW NIVAAS WORKS */}
        <section className="bg-white py-20 border-y border-[var(--line)]">
          <div className="container max-w-5xl">
            <h2 className="text-3xl font-bold mb-12 text-center">How NIVAAS works</h2>
            <div className="grid md:grid-cols-2 gap-12">
              <div>
                <h3 className="text-xl font-bold mb-6 text-[var(--orange-dark)]">For Buyers & Tenants</h3>
                <ol className="space-y-6">
                  <li className="flex gap-4"><span className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-[var(--sand)] font-bold text-sm">1</span><div><h4 className="font-semibold">Choose your location</h4><p className="text-sm text-[var(--muted-ink)] mt-1">Set your city or local area to see relevant properties.</p></div></li>
                  <li className="flex gap-4"><span className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-[var(--sand)] font-bold text-sm">2</span><div><h4 className="font-semibold">Search for the type of property you need</h4><p className="text-sm text-[var(--muted-ink)] mt-1">Select Buy or Rent, and pick a property type.</p></div></li>
                  <li className="flex gap-4"><span className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-[var(--sand)] font-bold text-sm">3</span><div><h4 className="font-semibold">Filter and compare available properties</h4><p className="text-sm text-[var(--muted-ink)] mt-1">Use filters to narrow down your choices.</p></div></li>
                  <li className="flex gap-4"><span className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-[var(--sand)] font-bold text-sm">4</span><div><h4 className="font-semibold">Open a property to see its details</h4><p className="text-sm text-[var(--muted-ink)] mt-1">View photos, descriptions, and amenities.</p></div></li>
                  <li className="flex gap-4"><span className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-[var(--sand)] font-bold text-sm">5</span><div><h4 className="font-semibold">Save, enquire or contact</h4><p className="text-sm text-[var(--muted-ink)] mt-1">Reach out to the property owner directly.</p></div></li>
                </ol>
                <div className="mt-8">
                  <Link href="/search" className="inline-flex items-center gap-2 rounded-2xl bg-[var(--orange)] px-6 py-3 text-sm font-bold text-white shadow-md transition hover:bg-[var(--orange-dark)]">
                    <Search className="h-4 w-4" /> Start Searching
                  </Link>
                </div>
              </div>
              
              <div>
                <h3 className="text-xl font-bold mb-6 text-[var(--orange-dark)]">For Property Owners</h3>
                <ol className="space-y-6">
                  <li className="flex gap-4"><span className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-[var(--sand)] font-bold text-sm">1</span><div><h4 className="font-semibold">Create an account</h4><p className="text-sm text-[var(--muted-ink)] mt-1">Sign in securely to manage your listings.</p></div></li>
                  <li className="flex gap-4"><span className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-[var(--sand)] font-bold text-sm">2</span><div><h4 className="font-semibold">Add your property details</h4><p className="text-sm text-[var(--muted-ink)] mt-1">Enter size, price, location, and key features.</p></div></li>
                  <li className="flex gap-4"><span className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-[var(--sand)] font-bold text-sm">3</span><div><h4 className="font-semibold">Add property photos</h4><p className="text-sm text-[var(--muted-ink)] mt-1">Upload clear images of your space.</p></div></li>
                  <li className="flex gap-4"><span className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-[var(--sand)] font-bold text-sm">4</span><div><h4 className="font-semibold">Preview your listing</h4><p className="text-sm text-[var(--muted-ink)] mt-1">See how it will look to potential buyers or tenants.</p></div></li>
                  <li className="flex gap-4"><span className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-[var(--sand)] font-bold text-sm">5</span><div><h4 className="font-semibold">Publish & manage</h4><p className="text-sm text-[var(--muted-ink)] mt-1">Go live and respond to enquiries from your dashboard.</p></div></li>
                </ol>
                <div className="mt-8">
                  <Link href="/sell" className="inline-flex items-center gap-2 rounded-2xl bg-[var(--orange)] px-6 py-3 text-sm font-bold text-white shadow-md transition hover:bg-[var(--orange-dark)]">
                    <PlusCircle className="h-4 w-4" /> List Your Property
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>


        {/* EXPLORE BY PROPERTY TYPE */}
        <section className="bg-[var(--sand)] py-20 border-t border-[var(--line)]">
          <div className="container max-w-5xl">
            <h2 className="text-3xl font-bold mb-8 text-center">Explore by property type</h2>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/search?propertyType=apartment" className="rounded-2xl bg-white px-6 py-3 font-semibold text-[var(--ink)] shadow-sm transition hover:text-[var(--orange-dark)]">Apartments</Link>
              <Link href="/search?propertyType=independent-house" className="rounded-2xl bg-white px-6 py-3 font-semibold text-[var(--ink)] shadow-sm transition hover:text-[var(--orange-dark)]">Independent Houses</Link>
              <Link href="/search?propertyType=villa" className="rounded-2xl bg-white px-6 py-3 font-semibold text-[var(--ink)] shadow-sm transition hover:text-[var(--orange-dark)]">Villas</Link>
              <Link href="/search?propertyType=plot" className="rounded-2xl bg-white px-6 py-3 font-semibold text-[var(--ink)] shadow-sm transition hover:text-[var(--orange-dark)]">Plots</Link>
              <Link href="/search?propertyType=pg" className="rounded-2xl bg-white px-6 py-3 font-semibold text-[var(--ink)] shadow-sm transition hover:text-[var(--orange-dark)]">PG / Co-Living</Link>
              <Link href="/search?propertyType=commercial" className="rounded-2xl bg-white px-6 py-3 font-semibold text-[var(--ink)] shadow-sm transition hover:text-[var(--orange-dark)]">Office & Commercial</Link>
            </div>
          </div>
        </section>

      </main>
      
      {/* EXPLORE PAGE FOOTER */}
      <footer className="bg-white py-10 border-t border-[var(--line)]">
        <div className="container max-w-5xl flex flex-wrap gap-8 justify-between text-sm text-[var(--muted-ink)]">
          <div className="flex flex-col gap-2">
            <Link href="/" aria-label="NIVAAS home">
              <img src="/assets/nivaas-logo.png" alt="NIVAAS" className="h-9 w-auto object-contain" />
            </Link>
            <p className="mt-1">Your local real-estate marketplace.</p>
          </div>
          <div className="flex gap-10">
            <div className="flex flex-col gap-3 font-medium">
              <Link href="/search" className="hover:text-[var(--ink)]">Buy & Rent</Link>
              <Link href="/sell" className="hover:text-[var(--ink)]">Sell</Link>
              <Link href="/explore" className="hover:text-[var(--ink)]">Explore</Link>
              <Link href="/reviews" className="hover:text-[var(--ink)]">Reviews</Link>
            </div>
            <div className="flex flex-col gap-3">
              <Link href="/explore" className="hover:text-[var(--ink)]">Help</Link>
              <Link href="/privacy" className="hover:text-[var(--ink)]">Privacy</Link>
              <Link href="/terms" className="hover:text-[var(--ink)]">Terms</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
