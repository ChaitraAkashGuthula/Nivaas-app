import { SiteHeader } from "@/components/NivaasChrome";
import { Link } from "wouter";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[var(--paper)] text-[var(--ink)]">
      <SiteHeader />
      
      {/* 
        DEVELOPER NOTE:
        These documents are application templates and should be reviewed by qualified legal counsel before production launch.
      */}

      <main className="container max-w-4xl py-12 md:py-20">
        <div className="mb-6">
          <Link href="/" className="inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--orange-dark)] hover:underline transition">
            ← Back Home
          </Link>
        </div>
        <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-4 text-[var(--ink)]">Terms & Conditions</h1>
        <p className="text-[var(--muted-ink)] mb-12">Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>

        <div className="prose prose-orange max-w-none text-[var(--muted-ink)] space-y-8">
          <section>
            <h2 className="text-xl font-bold text-[var(--ink)] mb-3">1. Acceptance of Terms</h2>
            <p>By accessing or using the NIVAAS platform, you agree to be bound by these Terms & Conditions. If you do not agree to these terms, you may not use our services.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[var(--ink)] mb-3">2. About NIVAAS</h2>
            <p>NIVAAS is a marketplace and platform designed to facilitate the discovery and listing of real estate properties. NIVAAS does not itself become the owner of listed properties and is not a party to any transaction between buyers, sellers, landlords, or tenants.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[var(--ink)] mb-3">3. User Accounts</h2>
            <p>You must provide accurate and complete information when creating an account. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[var(--ink)] mb-3">4. Property Listings</h2>
            <p>Property owners and authorized agents may create listings on the platform. All listings must be accurate, lawful, and relate to real properties available for the stated purpose.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[var(--ink)] mb-3">5. Accuracy of Information</h2>
            <p>NIVAAS does not guarantee that every property listing is accurate. Information is provided by users, and we do not independently verify the claims made in listings.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[var(--ink)] mb-3">6. User Responsibilities</h2>
            <p>Users should independently verify ownership, title, documents, price, availability, location, permissions, property condition, and legal status before making any commitments or payments.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[var(--ink)] mb-3">7. Property Owner Responsibilities</h2>
            <p>If you list a property, you represent that you have the legal right to do so and that the information provided is truthful. You are solely responsible for compliance with all applicable real estate and housing laws.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[var(--ink)] mb-3">8. Buyer/Tenant Responsibilities</h2>
            <p>Buyers and tenants are responsible for conducting their own due diligence, visiting properties, and negotiating terms directly with the property owner or their authorized representative.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[var(--ink)] mb-3">9. Contact Between Users</h2>
            <p>NIVAAS facilitates contact by displaying owner information. We are not responsible for the communications, meetings, or transactions that take place between users.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[var(--ink)] mb-3">10. Prohibited Use</h2>
            <p>You may not use NIVAAS for any unlawful purpose, to post fraudulent listings, to harass other users, or to scrape data or imagery from the platform without authorization.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[var(--ink)] mb-3">11. Intellectual Property</h2>
            <p>The platform's design, text, graphics, and code are the property of NIVAAS. You retain ownership of the content and photographs you upload, but grant NIVAAS a license to display them.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[var(--ink)] mb-3">12. Third-Party Services</h2>
            <p>The platform may integrate or link to third-party services. We are not responsible for their availability, accuracy, or related policies.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[var(--ink)] mb-3">13. Property Information Disclaimer</h2>
            <p>All property information is provided "as is". NIVAAS makes no warranties, express or implied, regarding the suitability, condition, or legality of any property listed on the platform.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[var(--ink)] mb-3">14. Availability of the Platform</h2>
            <p>We strive to keep the platform accessible but do not guarantee uninterrupted service. We may modify or discontinue features at any time.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[var(--ink)] mb-3">15. Account Suspension/Termination</h2>
            <p>We reserve the right to suspend or terminate accounts that violate these Terms & Conditions, post fraudulent listings, or engage in abusive behavior.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[var(--ink)] mb-3">16. Limitation of Liability</h2>
            <p>To the maximum extent permitted by law, NIVAAS shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the platform or transactions with other users.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[var(--ink)] mb-3">17. Changes to Terms</h2>
            <p>We may update these terms periodically. Continued use of the platform after changes constitutes acceptance of the modified terms.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[var(--ink)] mb-3">18. Governing Law</h2>
            <p>These terms shall be governed by and construed in accordance with the laws of the applicable jurisdiction, without regard to its conflict of law provisions.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[var(--ink)] mb-3">19. Contact Information</h2>
            <p>For any questions regarding these Terms & Conditions, please contact: <a href="mailto:chaitraakashguthula@gmail.com" className="text-[var(--orange)] hover:underline">chaitraakashguthula@gmail.com</a></p>
          </section>
        </div>
      </main>

      <footer className="bg-white py-10 border-t border-[var(--line)] mt-20">
        <div className="container max-w-5xl flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-[var(--muted-ink)]">
          <Link href="/" aria-label="NIVAAS home">
            <img src="/assets/nivaas-logo.png" alt="NIVAAS" className="h-8 w-auto object-contain" />
          </Link>
          <p>&copy; {new Date().getFullYear()} NIVAAS. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
