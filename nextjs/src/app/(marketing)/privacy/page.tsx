import { Navigation } from "@/components/landing/navigation";
import { Footer } from "@/components/landing/footer";

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[#FFFCF6]">
      <Navigation />

      <div className="container mx-auto px-4 py-32 max-w-3xl">
        <div className="prose prose-neutral max-w-none">
          <h1 className="text-4xl font-bold text-[#1A1A1A] mb-2">Privacy Policy</h1>
      <p className="text-muted-foreground">Last updated: December 2024</p>

      <h2>The Short Version</h2>
      <p>
        We collect your email to let you log in, your recipes because that&apos;s
        the whole point, and basic usage data to make the app better. We don&apos;t
        sell your data or your grandma&apos;s secret recipe to anyone. Ever.
      </p>

      <h2>Information We Collect</h2>

      <h3>Account Information</h3>
      <p>
        When you create an account, we collect your email address and optional
        name. If you sign in with Google, we receive your email and profile
        picture from Google. We use this to identify you and let you into your
        account.
      </p>

      <h3>Recipe Data</h3>
      <p>
        We store the recipes you add, including titles, ingredients,
        instructions, and any notes you make. This is stored securely in our
        database so you can access your recipes from any device.
      </p>

      <h3>Payment Information</h3>
      <p>
        If you subscribe to a paid plan, payment processing is handled entirely
        by Stripe. We never see or store your full credit card number. We only
        receive confirmation of your subscription status and a customer ID from
        Stripe.
      </p>

      <h3>Usage Data</h3>
      <p>
        We collect basic usage information like which features you use, when you
        use them, and how often. This helps us understand what&apos;s working and
        what needs improvement.
      </p>

      <h3>Household Data</h3>
      <p>
        If you create or join a household, we store household membership
        information so you can share recipes and meal plans with your family or
        roommates.
      </p>

      <h3>AI-Generated Data</h3>
      <p>
        For Pro and Premium subscribers, we use AI to extract nutrition
        information from your recipes and provide meal suggestions. This data is
        processed by Anthropic&apos;s Claude API and stored in your account.
        Nutrition estimates are AI-generated and may not be 100% accurate.
      </p>

      <h3>Calendar Data</h3>
      <p>
        If you connect Google Calendar, we only access your calendar to create
        meal plan events. We don&apos;t read your existing calendar events or
        share your calendar data.
      </p>

      <h2>How We Use Your Information</h2>
      <ul>
        <li>To provide and maintain the service</li>
        <li>To let you save and sync recipes across devices</li>
        <li>To enable household sharing features</li>
        <li>To send you shopping lists (if you ask us to)</li>
        <li>To process payments and manage subscriptions</li>
        <li>To provide AI-powered features (nutrition tracking, meal suggestions)</li>
        <li>To sync your meal plans with Google Calendar (if connected)</li>
        <li>To improve the app based on usage patterns</li>
        <li>To fix bugs and troubleshoot issues</li>
      </ul>

      <h2>Data Sharing</h2>
      <p>
        We don&apos;t sell your personal information. Period. We may share data
        with:
      </p>
      <ul>
        <li>
          <strong>Supabase:</strong> Our database provider that securely stores
          your data
        </li>
        <li>
          <strong>Vercel:</strong> Our hosting provider
        </li>
        <li>
          <strong>Anthropic:</strong> For AI-powered recipe parsing, nutrition
          extraction, and meal suggestions (recipe content only, processed
          securely)
        </li>
        <li>
          <strong>Stripe:</strong> For secure payment processing (PCI-compliant)
        </li>
        <li>
          <strong>Resend:</strong> For sending shopping list emails
        </li>
        <li>
          <strong>Google:</strong> For calendar integration (only if you connect
          your Google account)
        </li>
        <li>
          <strong>Sentry:</strong> For error tracking and monitoring to improve
          app stability
        </li>
      </ul>

      <h2>Data Security</h2>
      <p>
        We use industry-standard security practices including encrypted
        connections (HTTPS), secure password hashing, and row-level security in
        our database. Your recipes are only visible to you and household members
        you explicitly invite. Payment data is handled by Stripe and never
        touches our servers.
      </p>

      <h2>Your Rights</h2>
      <p>You can:</p>
      <ul>
        <li>Access all your data through the app</li>
        <li>Export your recipes anytime</li>
        <li>Delete your account and all associated data</li>
        <li>Leave any household you&apos;ve joined</li>
        <li>Cancel your subscription at any time</li>
        <li>Disconnect Google Calendar integration</li>
        <li>Request a copy of your data (contact us)</li>
      </ul>

      <h2>Data Retention</h2>
      <p>
        We retain your data for as long as your account is active. If you delete
        your account, all your data is permanently deleted within 30 days,
        except for anonymized analytics data. Stripe may retain payment records
        as required by law.
      </p>

      <h2>Cookies</h2>
      <p>
        We use essential cookies for authentication (keeping you logged in). We
        don&apos;t use tracking cookies or sell cookie data to advertisers.
      </p>

      <h2>Children&apos;s Privacy</h2>
      <p>
        This service is not intended for children under 13. We don&apos;t
        knowingly collect information from children under 13.
      </p>

      <h2>International Data Transfers</h2>
      <p>
        Your data may be processed in the United States where our service
        providers are located. By using the service, you consent to this
        transfer.
      </p>

      <h2>Changes to This Policy</h2>
      <p>
        We&apos;ll update this policy if our practices change. Significant
        changes will be communicated through the app.
      </p>

          <h2>Contact Us</h2>
          <p>
            Questions about privacy? Reach out at{" "}
            <a href="mailto:privacy@babewhatsfordinner.com" className="text-[#1A1A1A] underline hover:no-underline">
              privacy@babewhatsfordinner.com
            </a>
          </p>
        </div>
      </div>

      <Footer />
    </main>
  );
}
