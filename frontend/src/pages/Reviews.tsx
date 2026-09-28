import { useState } from "react";
import { Link } from "wouter";
import { SiteHeader } from "@/components/NivaasChrome";
import { Star, MessageSquarePlus, Filter, CheckCircle2, ShieldAlert, ArrowLeft } from "lucide-react";
import { storage } from "@/lib/localStorage/storage";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";

export interface ReviewItem {
  id: string;
  userName: string;
  location: string;
  propertyType: string;
  rating: number;
  review: string;
  createdAt: string;
  verified: boolean;
  isSample: boolean;
}

const SAMPLE_REVIEWS: ReviewItem[] = [
  {
    id: "sample-1",
    userName: "Suresh K.",
    location: "Kakinada",
    propertyType: "Apartment",
    rating: 5,
    review: "Clean property details with direct owner contact made finding a 3 BHK in Ramanayyapeta straightforward without unnecessary agent pressure.",
    createdAt: "September 2026",
    verified: false,
    isSample: true,
  },
  {
    id: "sample-2",
    userName: "Madhavi L.",
    location: "Amalapuram",
    propertyType: "Plot",
    rating: 5,
    review: "Found a DTCP approved layout near the Bypass Road. Clear road dimensions and locality visibility gave us confidence before visiting in person.",
    createdAt: "September 2026",
    verified: false,
    isSample: true,
  },
  {
    id: "sample-3",
    userName: "Ramesh V.",
    location: "Suryaraopeta",
    propertyType: "House",
    rating: 4,
    review: "Independent house listings had exact boundary details and good photo angles. The search filters for bedrooms and parking saved hours.",
    createdAt: "August 2026",
    verified: false,
    isSample: true,
  },
  {
    id: "sample-4",
    userName: "Chaitanya B.",
    location: "Rajahmundry Road",
    propertyType: "Commercial Property",
    rating: 5,
    review: "Listed our commercial retail space and connected with genuine local business owners looking for showroom frontage.",
    createdAt: "August 2026",
    verified: false,
    isSample: true,
  },
  {
    id: "sample-5",
    userName: "Priyanka T.",
    location: "Bhanugudi Junction",
    propertyType: "Rent",
    rating: 5,
    review: "Rental terms and deposit expectations were clearly stated upfront on the listing card. Great experience for tenants.",
    createdAt: "July 2026",
    verified: false,
    isSample: true,
  },
  {
    id: "sample-6",
    userName: "Satish N.",
    location: "Madhavapatnam",
    propertyType: "House",
    rating: 4,
    review: "The location privacy toggle gave peace of mind when listing our villa. High quality platform for East Godavari.",
    createdAt: "July 2026",
    verified: false,
    isSample: true,
  },
];

const CATEGORIES = [
  "All",
  "Apartment",
  "House",
  "Plot",
  "Commercial Property",
  "Rent",
];

export default function ReviewsPage() {
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [userReviews, setUserReviews] = useState<ReviewItem[]>(() => {
    return storage.get<ReviewItem[]>("user_reviews", []);
  });
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Review submission form state
  const [newRating, setNewRating] = useState(5);
  const [newType, setNewType] = useState("Apartment");
  const [newLocation, setNewLocation] = useState("Kakinada");
  const [newComment, setNewComment] = useState("");
  const [newName, setNewName] = useState(user?.name || "");

  const handleAddReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !newName.trim()) {
      toast.error("Please fill in your name and review comment.");
      return;
    }

    const review: ReviewItem = {
      id: `rev_${Date.now()}`,
      userName: newName.trim(),
      location: newLocation.trim() || "Kakinada",
      propertyType: newType,
      rating: newRating,
      review: newComment.trim(),
      createdAt: new Date().toLocaleDateString("en-IN", { month: "short", year: "numeric" }),
      verified: false,
      isSample: false,
    };

    const updated = [review, ...userReviews];
    setUserReviews(updated);
    storage.set("user_reviews", updated);
    setIsDialogOpen(false);
    setNewComment("");
    toast.success("Thank you! Your review has been submitted.");
  };

  const allReviews = [...userReviews, ...SAMPLE_REVIEWS];

  const filteredReviews = allReviews.filter((r) => {
    if (selectedCategory === "All") return true;
    return r.propertyType.toLowerCase() === selectedCategory.toLowerCase();
  });

  return (
    <div className="min-h-screen bg-[var(--paper)] text-[var(--ink)]">
      <SiteHeader />

      <main className="container py-12">
        {/* Navigation Breadcrumb */}
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--orange-dark)] hover:underline transition"
          >
            <ArrowLeft className="h-4 w-4" /> Back Home
          </Link>
        </div>

        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-[var(--line)]">
          <div>
            <p className="eyebrow text-[var(--orange-dark)] font-bold uppercase tracking-wider text-xs">
              Testimonials & Feedback
            </p>
            <h1 className="mt-2 text-4xl md:text-5xl font-bold tracking-tight text-[var(--ink)]">
              Reviews
            </h1>
            <p className="mt-3 text-lg text-[var(--muted-ink)] max-w-xl">
              People finding their next place with NIVAAS.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsDialogOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-[var(--orange)] px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[var(--orange-dark)]"
          >
            <MessageSquarePlus className="h-4 w-4" /> Write a Review
          </button>
        </div>

        {/* Transparent Development / Demo Notice */}
        <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50/70 p-4 text-sm text-amber-900 flex items-start gap-3">
          <ShieldAlert className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Development Preview Notice: </span>
            Sample testimonials are clearly marked below for interface demonstration. As genuine buyers, renters, and property owners share their feedback, real reviews will appear here.
          </div>
        </div>

        {/* Category Filters */}
        <div className="mt-8 flex flex-wrap items-center gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`rounded-full px-4 py-2 text-xs font-bold transition ${
                selectedCategory === cat
                  ? "bg-[var(--ink)] text-white shadow-sm"
                  : "bg-white border border-[var(--line-strong)] text-[var(--ink)] hover:border-[var(--orange)] hover:text-[var(--orange-dark)]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Review Cards Grid */}
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredReviews.map((item) => (
            <div
              key={item.id}
              className="flex flex-col justify-between rounded-2xl border border-[var(--line)] bg-white p-6 shadow-[0_8px_30px_rgba(35,31,28,0.03)] transition hover:-translate-y-1 hover:shadow-md"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-4">
                  {/* Rating Stars */}
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < item.rating
                            ? "fill-amber-400 text-amber-400"
                            : "text-gray-200"
                        }`}
                      />
                    ))}
                  </div>

                  {/* Sample or User Badge */}
                  {item.isSample ? (
                    <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-[10px] font-semibold text-gray-600 tracking-wide uppercase">
                      Demo review
                    </span>
                  ) : (
                    <span className="rounded-full bg-green-50 px-2.5 py-0.5 text-[10px] font-semibold text-green-700 tracking-wide uppercase">
                      User review
                    </span>
                  )}
                </div>

                {/* Testimonial Quote */}
                <p className="text-sm leading-relaxed text-[var(--ink)] italic">
                  "{item.review}"
                </p>
              </div>

              {/* Author & Context */}
              <div className="mt-6 pt-4 border-t border-[var(--line)] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="grid h-9 w-9 place-items-center rounded-full bg-[var(--sand)] text-xs font-bold text-[var(--ink)]">
                    {item.userName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[var(--ink)]">
                      {item.userName}
                    </h4>
                    <p className="text-xs text-[var(--muted-ink)]">
                      {item.location}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="inline-block rounded-md bg-[var(--peach)] px-2 py-0.5 text-[10px] font-bold text-[var(--orange-dark)]">
                    {item.propertyType}
                  </span>
                  <p className="text-[10px] text-[var(--muted-ink)] mt-1">
                    {item.createdAt}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Write a Review Modal */}
        {isDialogOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
            <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl border border-[var(--line)] animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between pb-4 border-b border-[var(--line)]">
                <h3 className="text-lg font-bold text-[var(--ink)]">
                  Share Your Experience
                </h3>
                <button
                  type="button"
                  onClick={() => setIsDialogOpen(false)}
                  className="rounded-full p-1 text-[var(--muted-ink)] hover:bg-[var(--sand)] hover:text-[var(--ink)]"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleAddReview} className="mt-4 space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[var(--muted-ink)] mb-1">
                    Your Name
                  </label>
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    required
                    placeholder="e.g. Ramesh V."
                    className="w-full rounded-xl border border-[var(--line-strong)] px-3.5 py-2.5 text-sm outline-none focus:border-[var(--orange)]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[var(--muted-ink)] mb-1">
                      Locality / City
                    </label>
                    <input
                      type="text"
                      value={newLocation}
                      onChange={(e) => setNewLocation(e.target.value)}
                      required
                      placeholder="e.g. Kakinada"
                      className="w-full rounded-xl border border-[var(--line-strong)] px-3.5 py-2.5 text-sm outline-none focus:border-[var(--orange)]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[var(--muted-ink)] mb-1">
                      Property Type
                    </label>
                    <select
                      value={newType}
                      onChange={(e) => setNewType(e.target.value)}
                      className="w-full rounded-xl border border-[var(--line-strong)] px-3.5 py-2.5 text-sm outline-none bg-white focus:border-[var(--orange)]"
                    >
                      <option value="Apartment">Apartment</option>
                      <option value="House">House</option>
                      <option value="Plot">Plot</option>
                      <option value="Commercial Property">Commercial Property</option>
                      <option value="Rent">Rent</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[var(--muted-ink)] mb-1">
                    Rating
                  </label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setNewRating(star)}
                        className="p-1 hover:scale-110 transition"
                      >
                        <Star
                          className={`h-6 w-6 ${
                            star <= newRating
                              ? "fill-amber-400 text-amber-400"
                              : "text-gray-200"
                          }`}
                        />
                      </button>
                    ))}
                    <span className="text-xs font-bold text-[var(--muted-ink)] ml-2">
                      {newRating} / 5 Stars
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[var(--muted-ink)] mb-1">
                    Your Review
                  </label>
                  <textarea
                    rows={4}
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    required
                    placeholder="Tell us about finding, renting, or listing your property on NIVAAS..."
                    className="w-full rounded-xl border border-[var(--line-strong)] px-3.5 py-2.5 text-sm outline-none focus:border-[var(--orange)] resize-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setIsDialogOpen(false)}
                    className="rounded-xl border border-[var(--line-strong)] px-4 py-2 text-xs font-bold text-[var(--ink)] hover:bg-[var(--sand)] transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-xl bg-[var(--orange)] px-5 py-2 text-xs font-bold text-white hover:bg-[var(--orange-dark)] transition"
                  >
                    Submit Review
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
