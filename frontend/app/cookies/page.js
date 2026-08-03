'use client'
import LegalLayout from '@/components/legal/LegalLayout'
import Link from 'next/link'

export default function CookiesPage() {
  return (
    <LegalLayout
      title="Cookie Policy"
      subtitle="How wingconcept.com uses cookies, local storage, and similar technologies."
    >
      <section>
        <h2>1. What are cookies?</h2>
        <p>
          Cookies are small text files stored on your device. Local storage is a similar browser feature that lets the site
          remember data between visits. We use both to run the store securely and keep your cart and session working.
        </p>
      </section>

      <section>
        <h2>2. Cookies we use</h2>

        <h3 className="text-ink font-bold mt-4 mb-2">Strictly necessary (always on)</h3>
        <ul>
          <li><strong>Authentication tokens</strong> — keep you signed in after login.</li>
          <li><strong>Cart &amp; checkout session</strong> — remember items while you shop and complete payment.</li>
          <li><strong>Language &amp; UI preferences</strong> — store choices such as language where applicable.</li>
          <li><strong>Cookie consent</strong> — remember that you accepted this notice (<code className="text-sm bg-bg2 px-1 rounded">wc_cookie_consent</code> in local storage).</li>
          <li><strong>Security</strong> — support captcha (Cloudflare Turnstile) and abuse prevention during login, registration, and contact forms.</li>
        </ul>
        <p>These are required for core functionality. The site may not work correctly if you block them.</p>

        <h3 className="text-ink font-bold mt-6 mb-2">Third-party (during checkout &amp; security)</h3>
        <ul>
          <li><strong>Stripe</strong> — fraud prevention and payment processing cookies when you pay.</li>
          <li><strong>Cloudflare Turnstile</strong> — may set cookies or use browser storage to validate that requests come from real users.</li>
        </ul>
        <p>We do not use third-party advertising or social tracking pixels on this site at this time.</p>
      </section>

      <section>
        <h2>3. Analytics</h2>
        <p>
          We do not currently run optional analytics cookies (such as Google Analytics). If we add analytics in the future,
          we will update this policy and request consent where required before enabling non-essential tracking.
        </p>
      </section>

      <section>
        <h2>4. Managing cookies</h2>
        <ul>
          <li>Use your browser settings to block or delete cookies. Instructions vary by browser (Chrome, Safari, Firefox, Edge, etc.).</li>
          <li>Clearing cookies will sign you out and may empty your cart.</li>
          <li>Our cookie banner records essential consent in local storage when you click Accept.</li>
        </ul>
      </section>

      <section>
        <h2>5. More information</h2>
        <p>
          For how we handle personal data, see our{' '}
          <Link href="/privacy">Privacy Policy</Link>. Questions:{' '}
          <a href="mailto:andres@wingconcept.com">andres@wingconcept.com</a>.
        </p>
      </section>
    </LegalLayout>
  )
}
