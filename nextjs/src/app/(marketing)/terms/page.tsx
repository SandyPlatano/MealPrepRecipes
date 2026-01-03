import { Navigation } from "@/components/landing/navigation";
import { Footer } from "@/components/landing/footer";

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-[#FFFCF6]">
      <Navigation />

      <div className="container mx-auto px-4 py-32 max-w-3xl">
        <div className="prose prose-neutral max-w-none">
          <h1 className="text-4xl font-bold text-[#1A1A1A] mb-2">Terms of Service</h1>
      <p className="text-muted-foreground">Last updated: December 2024</p>

      <h2>The Human Version</h2>
      <p>
        Use the app to plan meals and save recipes. Don&apos;t do anything
        illegal or harmful. We&apos;ll do our best to keep the service running
        smoothly, but we can&apos;t guarantee perfection. Your recipes are yours.
      </p>

      <h2>1. Acceptance of Terms</h2>
      <p>
        By accessing or using &quot;Babe, What&apos;s for Dinner?&quot; (the
        &quot;Service&quot;), you agree to be bound by these Terms of Service.
        If you don&apos;t agree, please don&apos;t use the service.
      </p>

      <h2>2. Description of Service</h2>
      <p>
        &quot;Babe, What&apos;s for Dinner?&quot; is a meal planning and recipe
        management application that allows you to:
      </p>
      <ul>
        <li>Save and organize recipes</li>
        <li>Plan weekly meals</li>
        <li>Generate shopping lists</li>
        <li>Share recipes with household members</li>
        <li>Track cooking history</li>
        <li>Access AI-powered features (paid plans only)</li>
      </ul>

      <h2>3. Account Registration</h2>
      <p>
        You must provide accurate information when creating an account. You&apos;re
        responsible for maintaining the security of your account and password.
        You&apos;re responsible for all activities that occur under your account.
      </p>

      <h2>4. Subscription Plans and Billing</h2>

      <h3>4.1 Free and Paid Plans</h3>
      <p>
        The Service offers both free and paid subscription tiers. Free accounts
        have access to core features. Paid plans (Pro at $7/month and Premium at
        $12/month) unlock additional features including AI-powered meal
        suggestions, nutrition tracking, pantry scanning, and Google Calendar
        integration.
      </p>

      <h3>4.2 Billing</h3>
      <p>
        Paid subscriptions are billed monthly in advance through Stripe. By
        subscribing, you authorize us to charge your payment method on a
        recurring basis until you cancel. Prices are in US dollars and may be
        subject to applicable taxes.
      </p>

      <h3>4.3 Cancellation</h3>
      <p>
        You can cancel your subscription at any time through the Settings page
        or Stripe customer portal. Upon cancellation, you&apos;ll retain access
        to paid features until the end of your current billing period. After
        that, your account will revert to the free tier.
      </p>

      <h3>4.4 Refunds</h3>
      <p>
        We do not offer refunds for partial subscription periods. If you cancel,
        you&apos;ll continue to have access until the end of your billing
        period. For exceptional circumstances, contact us at{" "}
        <a href="mailto:support@babewhatsfordinner.com" className="text-primary">
          support@babewhatsfordinner.com
        </a>
        .
      </p>

      <h3>4.5 Price Changes</h3>
      <p>
        We may change subscription prices with 30 days&apos; notice. Existing
        subscribers will be notified via email before any price increase takes
        effect.
      </p>

      <h3>4.6 Failed Payments</h3>
      <p>
        If a payment fails, we&apos;ll attempt to process it again. After
        multiple failed attempts, your subscription may be suspended or
        downgraded to the free tier. You can update your payment method at any
        time.
      </p>

      <h2>5. Acceptable Use</h2>
      <p>You agree not to:</p>
      <ul>
        <li>Use the service for any illegal purpose</li>
        <li>Attempt to gain unauthorized access to the service or other accounts</li>
        <li>Interfere with or disrupt the service</li>
        <li>Upload malicious code or harmful content</li>
        <li>Violate any intellectual property rights</li>
        <li>Harass other users</li>
        <li>Use the service for commercial purposes without permission</li>
        <li>Abuse AI features or attempt to circumvent usage limits</li>
      </ul>

      <h2>6. Your Content</h2>
      <p>
        You retain ownership of recipes and content you create. By using the
        service, you grant us a license to store, display, and process your
        content as needed to provide the service. We won&apos;t share your
        recipes publicly without your permission.
      </p>

      <h2>7. AI-Generated Content</h2>
      <p>
        Certain features use AI to generate nutrition estimates, meal
        suggestions, and other content. AI-generated content is provided for
        informational purposes only. We do not guarantee the accuracy,
        completeness, or reliability of AI-generated content. Always verify
        nutrition information and use your own judgment, especially for dietary
        restrictions or health conditions.
      </p>

      <h2>8. Intellectual Property</h2>
      <p>
        The service, including its design, code, and branding, is owned by us
        and protected by intellectual property laws. You may not copy, modify,
        or distribute the service without permission.
      </p>

      <h2>9. Third-Party Services</h2>
      <p>
        The service integrates with third-party services including Google
        Calendar, Stripe (payments), and Anthropic (AI). Your use of those
        services is governed by their respective terms and privacy policies.
      </p>

      <h2>10. Service Availability</h2>
      <p>
        We strive to maintain high availability but don&apos;t guarantee
        uninterrupted service. We may modify, suspend, or discontinue features
        at any time. We&apos;ll try to give reasonable notice for significant
        changes.
      </p>

      <h2>11. Data and Privacy</h2>
      <p>
        Your use of the service is also governed by our{" "}
        <a href="/privacy" className="text-primary">
          Privacy Policy
        </a>
        . By using the service, you consent to our data practices as described
        there.
      </p>

      <h2>12. Limitation of Liability</h2>
      <p>
        To the maximum extent permitted by law, we&apos;re not liable for any
        indirect, incidental, special, consequential, or punitive damages. Our
        total liability is limited to the amount you&apos;ve paid us in the past
        12 months (which, if you&apos;re on the free plan, is $0).
      </p>

      <h2>13. Disclaimer of Warranties</h2>
      <p>
        The service is provided &quot;as is&quot; without warranties of any
        kind. We don&apos;t guarantee that recipes imported from third-party
        sources are accurate, safe, or appropriate for your dietary needs.
        AI-generated nutrition data is an estimate and should not be used for
        medical decisions. Always use your own judgment when cooking.
      </p>

      <h2>14. Termination</h2>
      <p>
        You can delete your account at any time from the Settings page. We may
        terminate or suspend your account if you violate these terms. Upon
        termination, your right to use the service ends immediately. If you have
        an active paid subscription, you may still be entitled to a refund for
        unused time at our discretion.
      </p>

      <h2>15. Changes to Terms</h2>
      <p>
        We may update these terms from time to time. Continued use of the
        service after changes constitutes acceptance of the new terms.
        Significant changes will be communicated through the app and/or email.
      </p>

      <h2>16. Governing Law</h2>
      <p>
        These terms are governed by the laws of the State of California and the
        United States. Any disputes will be resolved in the courts of California.
      </p>

          <h2>17. Contact</h2>
          <p>
            Questions about these terms? Email us at{" "}
            <a href="mailto:legal@babewhatsfordinner.com" className="text-[#1A1A1A] underline hover:no-underline">
              legal@babewhatsfordinner.com
            </a>
          </p>
        </div>
      </div>

      <Footer />
    </main>
  );
}
