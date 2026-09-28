import { SiteHeader } from "@/components/NivaasChrome";
import { Link } from "wouter";

export default function PrivacyPage() {
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
        <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-4 text-[var(--ink)]">Privacy Policy</h1>
        <p className="text-[var(--muted-ink)] mb-12">Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>

        <div className="prose prose-orange max-w-none text-[var(--muted-ink)] space-y-8">
          <section>
            <h2 className="text-xl font-bold text-[var(--ink)] mb-3">1. Introduction</h2>
            <p>Welcome to NIVAAS. We value your privacy and are committed to protecting your personal information. This Privacy Policy explains how we collect, use, and share information when you use our real-estate marketplace platform.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[var(--ink)] mb-3">2. Information We Collect</h2>
            <p>We collect information you provide directly to us, information collected automatically through your use of the platform, and information from third-party sources where applicable.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[var(--ink)] mb-3">3. Account Information</h2>
            <p>When you create an account, we collect your name, email address, phone number, and preferred language. We also store records of your acceptance of our legal terms.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[var(--ink)] mb-3">4. Property Listing Information</h2>
            <p>If you list a property, we collect the property details, pricing, photographs, and any description you provide. This information is intended to be publicly visible to other users of the platform.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[var(--ink)] mb-3">5. Location Information</h2>
            <p>We collect location information based on the locations you search for or specify when using the application to provide relevant property results.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[var(--ink)] mb-3">6. How We Use Information</h2>
            <p>We use your information to provide, maintain, and improve our services, authenticate your account, allow communication between property owners and seekers, and ensure the security of the platform.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[var(--ink)] mb-3">7. Property Contact Information</h2>
            <p>When you list a property, the contact information you provide (such as your phone number) will be visible to potential buyers or tenants to facilitate direct communication.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[var(--ink)] mb-3">8. Cookies and Local Storage</h2>
            <p>We use cookies and local storage technologies to keep you logged in, save your preferences (such as saved homes and searches), and understand how you interact with our platform.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[var(--ink)] mb-3">9. Data Sharing</h2>
            <p>We do not sell your personal information. We share your information only with your consent, to comply with legal obligations, or to protect the rights and safety of NIVAAS and our users.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[var(--ink)] mb-3">10. Data Security</h2>
            <p>We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[var(--ink)] mb-3">11. Data Retention</h2>
            <p>We retain your information for as long as your account is active or as needed to provide you services, comply with our legal obligations, resolve disputes, and enforce our agreements.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[var(--ink)] mb-3">12. User Rights</h2>
            <p>You have the right to access, update, or delete your personal information. You can manage your profile settings directly within the application.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[var(--ink)] mb-3">13. Account Deletion</h2>
            <p>You may request account deletion at any time. Deleting your account will remove your profile, saved homes, saved searches, and any properties you have listed from active view.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[var(--ink)] mb-3">14. Children's Privacy</h2>
            <p>NIVAAS is not intended for use by children under the age of 18. We do not knowingly collect personal information from minors.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[var(--ink)] mb-3">15. Third-Party Services</h2>
            <p>Our platform may contain links to third-party websites or services. We are not responsible for the privacy practices or content of those third parties.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[var(--ink)] mb-3">16. Changes to This Policy</h2>
            <p>We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new policy on this page or through other communication methods.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[var(--ink)] mb-3">17. Contact Us</h2>
            <p>If you have any questions about this Privacy Policy, please contact us at: <a href="mailto:chaitraakashguthula@gmail.com" className="text-[var(--orange)] hover:underline">chaitraakashguthula@gmail.com</a></p>
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
