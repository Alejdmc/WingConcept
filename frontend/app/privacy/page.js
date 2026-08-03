'use client'
import LegalLayout from '@/components/legal/LegalLayout'
import Link from 'next/link'

export default function PrivacyPage() {
  return (
    <LegalLayout
      title="Privacy Policy"
      subtitle="How WingConcept collects, uses, and protects your personal information."
    >
      <section>
        <h2>1. Who we are</h2>
        <p>
          WingConcept operates wingconcept.com, an online store for paramotors, paratrikes, parts, and accessories.
          For privacy questions or requests, contact{' '}
          <a href="mailto:andres@wingconcept.com">andres@wingconcept.com</a>.
        </p>
      </section>

      <section>
        <h2>2. Information we collect</h2>
        <ul>
          <li><strong>Account data:</strong> name, email, phone (optional), password (stored hashed), role, and email verification status.</li>
          <li><strong>Order data:</strong> shipping address, items purchased, order totals, order status, tracking numbers, and notes you provide.</li>
          <li><strong>Payment data:</strong> processed by Stripe. We do not store full card numbers on our servers. Stripe may collect billing details and fraud signals.</li>
          <li><strong>Communications:</strong> messages sent through our contact form and support correspondence.</li>
          <li><strong>Technical data:</strong> IP address, browser type, device information, and security logs (including captcha verification via Cloudflare Turnstile).</li>
          <li><strong>Cookies &amp; local storage:</strong> see our <Link href="/cookies">Cookie Policy</Link>.</li>
        </ul>
      </section>

      <section>
        <h2>3. How we use your information</h2>
        <ul>
          <li>Create and manage your account and authenticate sessions.</li>
          <li>Process orders, payments, shipping, refunds, and customer support.</li>
          <li>Send transactional emails (verification, order confirmations, status updates, password reset).</li>
          <li>Maintain inventory, prevent fraud, and secure the platform.</li>
          <li>Improve our website, products, and services.</li>
          <li>Comply with legal obligations and enforce our Terms.</li>
        </ul>
        <p>We do not sell your personal information.</p>
      </section>

      <section>
        <h2>4. Legal bases (where applicable)</h2>
        <p>
          Depending on your location, we process data based on: performance of a contract (orders and accounts),
          legitimate interests (security, fraud prevention, site improvement), consent (where required, e.g. non-essential cookies),
          and legal obligation.
        </p>
      </section>

      <section>
        <h2>5. Service providers</h2>
        <p>We share data with trusted processors only as needed to operate the site:</p>
        <ul>
          <li><strong>Stripe</strong> — payment processing.</li>
          <li><strong>Resend</strong> — transactional email delivery.</li>
          <li><strong>Cloudflare</strong> — Turnstile captcha and CDN/security.</li>
          <li><strong>Hosting &amp; database providers</strong> — application and data storage (e.g. Supabase/PostgreSQL infrastructure).</li>
          <li><strong>Shipping carriers</strong> — name, address, and contact details required for delivery.</li>
        </ul>
        <p>Each provider processes data under their own privacy terms and our agreements with them.</p>
      </section>

      <section>
        <h2>6. Retention</h2>
        <p>
          We keep account and order records as long as needed to fulfill orders, provide support, meet tax and legal requirements,
          and resolve disputes. Security logs are retained for a limited period. You may request deletion subject to legal exceptions
          (e.g. completed transactions we must retain for accounting).
        </p>
      </section>

      <section>
        <h2>7. Security</h2>
        <p>
          We use industry-standard measures including HTTPS, hashed passwords, access controls for admin areas, and captcha on sensitive forms.
          No method of transmission or storage is 100% secure; please use a strong, unique password.
        </p>
      </section>

      <section>
        <h2>8. Your rights</h2>
        <p>Depending on your jurisdiction, you may have the right to:</p>
        <ul>
          <li>Access, correct, or delete personal data we hold about you.</li>
          <li>Object to or restrict certain processing.</li>
          <li>Withdraw consent where processing is consent-based.</li>
          <li>Request a copy of your data in a portable format.</li>
        </ul>
        <p>
          To exercise these rights, email{' '}
          <a href="mailto:andres@wingconcept.com">andres@wingconcept.com</a>. We may verify your identity before responding.
        </p>
      </section>

      <section>
        <h2>9. International transfers</h2>
        <p>
          Our service providers may process data in countries other than yours. Where required, we rely on appropriate safeguards
          for cross-border transfers.
        </p>
      </section>

      <section>
        <h2>10. Children</h2>
        <p>
          Our services are not directed to children under 16. We do not knowingly collect personal data from children.
          Contact us if you believe a child has provided information and we will delete it.
        </p>
      </section>

      <section>
        <h2>11. Changes</h2>
        <p>
          We may update this Privacy Policy from time to time. The &quot;Last updated&quot; date at the top reflects the latest version.
          Significant changes may also be communicated by email or a site notice where appropriate.
        </p>
      </section>
    </LegalLayout>
  )
}
