'use client'
import LegalLayout from '@/components/legal/LegalLayout'
import Link from 'next/link'

export default function TermsPage() {
  return (
    <LegalLayout
      title="Terms of Service"
      subtitle="Rules for using wingconcept.com and purchasing our products."
    >
      <section>
        <h2>1. Agreement</h2>
        <p>
          These Terms of Service (&quot;Terms&quot;) govern your access to wingconcept.com and related services
          operated by WingConcept (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;). By creating an account, placing an order,
          or browsing the site, you agree to these Terms and our{' '}
          <Link href="/privacy">Privacy Policy</Link>.
        </p>
      </section>

      <section>
        <h2>2. Eligibility &amp; accounts</h2>
        <ul>
          <li>You must be at least 18 years old (or the age of majority in your jurisdiction) to purchase.</li>
          <li>You are responsible for keeping your login credentials secure and for activity under your account.</li>
          <li>We may suspend or terminate accounts that violate these Terms or applicable law.</li>
          <li>Email verification may be required before checkout or certain account features.</li>
        </ul>
      </section>

      <section>
        <h2>3. Products &amp; pricing</h2>
        <ul>
          <li>We sell paramotors, paratrikes, parts, accessories, and related gear. Specifications, images, and availability may change without notice.</li>
          <li>Prices are shown in the currency indicated at checkout. We may correct pricing errors and cancel affected orders with a full refund.</li>
          <li>Some items (especially parts and accessories) are subject to stock limits. If stock is unavailable after payment, we will contact you and may cancel or partially fulfill the order.</li>
          <li>Product use may require training, licensing, and compliance with local aviation and safety regulations. You are solely responsible for safe and legal operation.</li>
        </ul>
      </section>

      <section>
        <h2>4. Orders &amp; payment</h2>
        <ul>
          <li>An order is received when you submit it; payment must be completed through our payment provider (Stripe) before the order is confirmed as paid.</li>
          <li>We may refuse or cancel orders for suspected fraud, stock issues, pricing errors, or policy violations.</li>
          <li>Order status updates (received, paid, processing, shipped, delivered, cancelled, refunded) are shown in your account and may be sent by email.</li>
          <li>Shipping times, carriers, and tracking numbers depend on product type, destination, and availability. Estimated dates are not guaranteed.</li>
        </ul>
      </section>

      <section>
        <h2>5. Shipping, returns &amp; warranty</h2>
        <ul>
          <li>Shipping costs and delivery areas are shown at checkout or communicated after order review for large equipment.</li>
          <li>Return and warranty terms vary by product. Contact us before returning any item. Used or modified aviation equipment may not be eligible for return.</li>
          <li>Manufacturer warranties may apply to certain products; we will assist with valid warranty claims where applicable.</li>
        </ul>
      </section>

      <section>
        <h2>6. Acceptable use</h2>
        <p>You agree not to:</p>
        <ul>
          <li>Use the site for unlawful purposes or to interfere with its operation.</li>
          <li>Attempt unauthorized access to accounts, admin areas, or systems.</li>
          <li>Scrape, reverse engineer, or overload our services without permission.</li>
          <li>Submit false information at registration, checkout, or contact forms.</li>
        </ul>
        <p>
          We use Cloudflare Turnstile and similar tools to reduce abuse. Bypassing security measures is prohibited.
        </p>
      </section>

      <section>
        <h2>7. Intellectual property</h2>
        <p>
          Site content, logos, product photography, manuals, and software are owned by WingConcept or our licensors.
          You may not copy or redistribute them without written permission, except for personal use of manuals linked to your purchases.
        </p>
      </section>

      <section>
        <h2>8. Disclaimer &amp; limitation of liability</h2>
        <p>
          THE SITE AND PRODUCTS ARE PROVIDED &quot;AS IS&quot; TO THE MAXIMUM EXTENT PERMITTED BY LAW.
          WINGCONCEPT IS NOT LIABLE FOR INDIRECT, INCIDENTAL, OR CONSEQUENTIAL DAMAGES, OR FOR INJURY OR PROPERTY
          DAMAGE RESULTING FROM MISUSE OF PARAMOTOR OR PARATRIKE EQUIPMENT, FAILURE TO FOLLOW OWNER MANUALS,
          OR NON-COMPLIANCE WITH LOCAL REGULATIONS.
        </p>
        <p>
          Our total liability for any claim relating to an order is limited to the amount you paid for that order,
          except where law requires otherwise.
        </p>
      </section>

      <section>
        <h2>9. Changes &amp; governing law</h2>
        <p>
          We may update these Terms at any time. Material changes will be reflected on this page with an updated date.
          Continued use after changes constitutes acceptance. If you do not agree, stop using the site.
        </p>
        <p>
          These Terms are governed by the laws applicable in our place of business, without regard to conflict-of-law rules.
          Disputes should first be raised with us at{' '}
          <a href="mailto:andres@wingconcept.com">andres@wingconcept.com</a>.
        </p>
      </section>
    </LegalLayout>
  )
}
