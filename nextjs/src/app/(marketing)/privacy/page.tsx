export default function PrivacyPage() {
  return (
    <div className="prose prose-neutral dark:prose-invert max-w-none">
      <h1 className="font-mono">Privacy Policy</h1>
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

      <h2>How We Use Your Information</h2>
      <ul>
        <li>To provide and maintain the service</li>
        <li>To let you save and sync recipes across devices</li>
        <li>To enable household sharing features</li>
        <li>To send you shopping lists (if you ask us to)</li>
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
          <strong>Anthropic:</strong> For AI-powered recipe parsing (recipe text
          only, not linked to your account)
        </li>
        <li>
          <strong>Resend:</strong> For sending shopping list emails
        </li>
      </ul>

      <h2>Data Security</h2>
      <p>
        We use industry-standard security practices including encrypted
        connections (HTTPS), secure password hashing, and row-level security in
        our database. Your recipes are only visible to you and household members
        you explicitly invite.
      </p>

      <h2>Your Rights</h2>
      <p>You can:</p>
      <ul>
        <li>Access all your data through the app</li>
        <li>Export your recipes anytime</li>
        <li>Delete your account and all associated data</li>
        <li>Leave any household you&apos;ve joined</li>
      </ul>

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

      <h2>Changes to This Policy</h2>
      <p>
        We&apos;ll update this policy if our practices change. Significant
        changes will be communicated through the app.
      </p>

      <h2>Contact Us</h2>
      <p>
        Questions about privacy? Reach out at{" "}
        <a href="mailto:privacy@babewhatsfordinner.com" className="text-primary">
          privacy@babewhatsfordinner.com
        </a>
      </p>
    </div>
  );
}
