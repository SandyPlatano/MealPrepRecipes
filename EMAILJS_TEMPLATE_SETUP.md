# EmailJS Template Setup with Branded Design

This guide shows you how to set up your EmailJS template to match the Meal Prep Recipe Manager branding.

## ⚠️ Critical Setup Step: Configure "To Email" Field

**This step is REQUIRED and must be done in the EmailJS dashboard, not in the HTML template.**

1. Go to your EmailJS dashboard → **Email Templates** → Select your template
2. Find the **"To Email"** field (usually at the top of the template settings)
3. Set it to: `{{to_email}}`
4. **Do NOT leave it empty** - this will cause a 422 error when sending emails

**Why this is needed:** EmailJS requires the recipient email address to be configured in the template settings. The app sends `to_email` as a template parameter, but EmailJS needs to know which field to use for the recipient address.

If you see errors like "The recipient email address is invalid" or get a 422 status code, this is almost always because the "To Email" field is not set to `{{to_email}}`.

## Quick Setup

1. **Copy the Branded Template HTML**
   - The template HTML is available in `src/utils/emailService.js` via the `getBrandedEmailTemplate()` function
   - Or use the template below

2. **In EmailJS Dashboard:**
   - Go to **Email Templates** → Your template
   - **Set "To Email" field to `{{to_email}}`** (see Critical Setup Step above)
   - Paste the HTML below into the template editor
   - Make sure to use the exact variable names shown

## Branded Email Template HTML

Copy this entire HTML into your EmailJS template:

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
      background-color: #fafafa;
      color: #0a0a0a;
      line-height: 1.6;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }
    .email-container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
    }
    .header {
      background-color: #ffffff;
      border-bottom: 1px solid #e5e5e5;
      padding: 32px 24px;
      text-align: left;
    }
    .header h1 {
      font-family: 'JetBrains Mono', 'Fira Code', Consolas, Monaco, monospace;
      font-size: 24px;
      font-weight: 700;
      color: #0a0a0a;
      letter-spacing: -0.02em;
      margin-bottom: 4px;
    }
    .header p {
      font-size: 14px;
      color: #737373;
      margin: 0;
    }
    .content {
      padding: 32px 24px;
    }
    .section {
      margin-bottom: 32px;
    }
    .section:last-child {
      margin-bottom: 0;
    }
    .section-title {
      font-family: 'JetBrains Mono', 'Fira Code', Consolas, Monaco, monospace;
      font-size: 16px;
      font-weight: 600;
      color: #0a0a0a;
      letter-spacing: -0.02em;
      margin-bottom: 16px;
      padding-bottom: 8px;
      border-bottom: 2px solid #0a0a0a;
    }
    .stats {
      display: inline-block;
      background-color: #f5f5f5;
      padding: 6px 12px;
      border-radius: 4px;
      font-size: 13px;
      color: #737373;
      margin-bottom: 16px;
    }
    .footer {
      background-color: #ffffff;
      border-top: 1px solid #e5e5e5;
      padding: 24px;
      text-align: center;
    }
    .footer p {
      font-family: 'JetBrains Mono', 'Fira Code', Consolas, Monaco, monospace;
      font-size: 12px;
      color: #737373;
      margin: 4px 0;
    }
    .footer .version {
      font-size: 11px;
      color: #a3a3a3;
    }
    table {
      border-collapse: collapse;
      width: 100%;
      margin: 24px 0;
      border: 1px solid #e5e5e5;
      border-radius: 8px;
      overflow: hidden;
    }
    th {
      border-bottom: 1px solid #e5e5e5;
      padding: 14px 16px;
      text-align: left;
      font-family: 'JetBrains Mono', 'Fira Code', Consolas, Monaco, monospace;
      font-size: 13px;
      font-weight: 600;
      color: #0a0a0a;
      letter-spacing: -0.02em;
      background-color: #f5f5f5;
    }
    td {
      border-bottom: 1px solid #e5e5e5;
      padding: 12px 16px;
      font-family: Inter, system-ui, sans-serif;
      color: #0a0a0a;
    }
    tr:last-child td {
      border-bottom: none;
    }
    tr:nth-child(even) {
      background-color: #fafafa;
    }
    @media only screen and (max-width: 600px) {
      .email-container {
        width: 100% !important;
      }
      .header, .content, .footer {
        padding: 24px 16px !important;
      }
    }
  </style>
</head>
<body>
  <div class="email-container">
    <!-- Header -->
    <div class="header">
      <h1>Meal Prep Recipe Manager</h1>
      <p>Plan, cook, and organize your meals</p>
    </div>
    
    <!-- Content -->
    <div class="content">
      <!-- Week Range -->
      <div class="section">
        <div class="stats">Week of {{week_range}}</div>
      </div>
      
      <!-- Schedule -->
      <div class="section">
        <h2 class="section-title">This Week's Schedule</h2>
        {{{schedule_table}}}
      </div>
      
      <!-- Shopping List -->
      <div class="section">
        <h2 class="section-title">Shopping List</h2>
        <div class="stats">{{item_count}} items • {{recipe_count}} recipes</div>
        <div style="margin-top: 16px;">
          {{{shopping_list_html}}}
        </div>
      </div>
      
      <!-- Download Shopping List (Free Alternative to EmailJS Attachments) -->
      <div class="section" style="margin-top: 32px; padding-top: 24px; border-top: 2px solid #e5e5e5;">
        <h2 class="section-title">Download Shopping List</h2>
        <p style="color: #737373; font-size: 14px; margin-bottom: 16px;">
          Click the button below to download your shopping list as a markdown file ({{shopping_list_download_filename}}).
        </p>
        <div style="text-align: center; margin: 20px 0;">
          <a href="{{shopping_list_download_link}}" download="{{shopping_list_download_filename}}" style="display: inline-block; background-color: #3b82f6; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; font-family: Inter, system-ui, sans-serif; font-size: 14px;">
            📥 Download Shopping List
          </a>
        </div>
        <p style="color: #737373; font-size: 12px; margin-top: 12px; font-style: italic;">
          Note: If the download button doesn't work in your email client, use the copy option below instead.
        </p>
      </div>
      
      <!-- Shopping List Attachment (for Apple Notes & Google Keep) -->
      <div class="section" style="margin-top: 32px; padding-top: 24px; border-top: 2px solid #e5e5e5;">
        <h2 class="section-title">Copy to Apple Notes or Google Keep</h2>
        <p style="color: #737373; font-size: 14px; margin-bottom: 16px;">
          Copy the shopping list below into Apple Notes or Google Keep for an interactive checklist while shopping.
        </p>
        <div style="background-color: #f5f5f5; padding: 16px; border-radius: 8px; font-family: 'JetBrains Mono', 'Fira Code', Consolas, Monaco, monospace; font-size: 13px; white-space: pre-wrap; overflow-x: auto; border: 1px solid #e5e5e5;">
          {{shopping_list_attachment_text}}
        </div>
        <p style="color: #737373; font-size: 12px; margin-top: 12px; font-style: italic;">
          Tip: Select all text in the box above, copy it, and paste it into a new note in Apple Notes or Google Keep. The checkboxes will work as interactive lists.
        </p>
      </div>
    </div>
    
    <!-- Footer -->
    <div class="footer">
      <p>Meal Prep Recipe Manager</p>
      <p class="version">v1.0.0 • Built with React & Tailwind</p>
    </div>
  </div>
</body>
</html>
```

## Email Subject Line

Use this for your email subject:

```text
Meal Prep Shopping List - {{week_range}}
```

## Template Variables Used

The template uses these variables (automatically provided by the app):

- `{{week_range}}` - Week date range (e.g., "Dec 1 - Dec 7, 2024")
- `{{{schedule_table}}}` - HTML table of meals (use triple braces for HTML)
- `{{{shopping_list_html}}}` - Shopping list HTML (use triple braces for HTML)
- `{{shopping_list_text}}` - Shopping list in plain text format
- `{{shopping_list_markdown}}` - Shopping list in markdown format
- `{{shopping_list_attachment_text}}` - **Shopping list optimized for Apple Notes & Google Keep** - Markdown format with checkboxes that can be copied into notes apps
- `{{shopping_list_attachment_html}}` - HTML version of the attachment (alternative to text version)
- `{{shopping_list_download_link}}` - **FREE: Data URI download link for shopping list** - Clickable download button (works in most email clients, no paid plan needed)
- `{{shopping_list_download_filename}}` - Filename for the downloadable shopping list (e.g., `shopping-list-dec-1-dec-7-2024.md`)
- `{{shopping_list_attachment}}` - **PAID PLAN ONLY: Base64-encoded shopping list** - Used by EmailJS Attachments tab (Parameter Name: `shopping_list_attachment`, requires paid EmailJS subscription)
- `{{shopping_list_attachment_filename}}` - Dynamic filename for EmailJS attachment (e.g., `shopping-list-dec-1-dec-7-2024.md`)
- `{{item_count}}` - Number of shopping list items
- `{{recipe_count}}` - Number of recipes this week
- `{{to_email}}` - **Recipient email address** - **MUST be set in EmailJS template's "To Email" field** (see Critical Setup Step above). This variable is used by EmailJS to determine where to send the email, not in the HTML body.

## Branding Details

The template matches your app's design:

- **Primary Font**: JetBrains Mono / Fira Code (monospace) for headings
- **Body Font**: Inter (sans-serif) for content
- **Colors**:
  - Primary text: `#0a0a0a`
  - Muted text: `#737373`
  - Borders: `#e5e5e5`
  - Background: `#ffffff` / `#fafafa`
- **Spacing**: Consistent 24px/32px padding
- **Typography**: Matches app's letter-spacing and font weights

## Shopping List Attachment for Apple Notes & Google Keep

The email includes a shopping list attachment that's optimized for copying into Apple Notes and Google Keep. This provides an interactive checklist format that's easy to use while shopping.

**How it works:**

- The shopping list is included in the email as a formatted text block with checkboxes
- Recipients can copy the text and paste it into Apple Notes or Google Keep
- The checkboxes (`- [ ] item`) will work as interactive lists in both apps

**Included in template:**

The template HTML above includes a section that displays `{{shopping_list_attachment_text}}` in a copyable format. This is automatically generated and includes:

- Week range
- Recipes for the week
- Categorized ingredients with checkboxes
- Optimized markdown format

**Using the attachment:**

1. Open the email on your device
2. Find the "Copy to Apple Notes or Google Keep" section
3. Select all the text in the gray box
4. Copy it
5. Paste into a new note in Apple Notes or Google Keep
6. The checkboxes will be interactive - tap them to check off items while shopping!

## Downloadable Shopping List (Free Solution - No Paid Plan Needed!)

The app includes a **free download solution** that works without requiring a paid EmailJS subscription. A download button is automatically added to your emails.

### How It Works

The email template includes a **"Download Shopping List"** button that uses a data URI link. When recipients click the button, their browser will download the shopping list as a `.md` file.

**Features:**

- ✅ **100% Free** - No paid EmailJS subscription required
- ✅ Works in most email clients (Gmail, Outlook.com, Apple Mail, etc.)
- ✅ One-click download
- ✅ Automatically generates filename (e.g., `shopping-list-dec-1-dec-7-2024.md`)

**The download button is already included in the email template HTML above** - no additional configuration needed! Just make sure your EmailJS template includes the download section shown in the template HTML.

### Alternative: EmailJS Paid Attachments (Optional)

If you have a paid EmailJS subscription and want traditional email attachments, you can configure EmailJS attachments:

1. Log into [EmailJS Dashboard](https://dashboard.emailjs.com/)
2. Go to **Email Templates** and select your template
3. Click on the **Attachments** tab (next to the HTML editor)
4. Click **Add Attachment** button
5. Select **Dynamic Attachment** (not Static Attachment)
6. Configure the attachment:
   - **Parameter Name**: `shopping_list_attachment` (must match exactly)
   - **Content Type**: `text/markdown` (or `text/plain` if markdown isn't available)
   - **Filename**: Leave empty or set a static name like `shopping-list.md`
7. **Save** the template

**Note:** The free download button solution works great for most users and doesn't require any paid subscription. The EmailJS attachment feature is only needed if you specifically want traditional email attachments and have a paid plan.

## Testing

After updating your EmailJS template:

1. Save the template in EmailJS
2. Go to your app
3. Add recipes to cart and assign them
4. Click "Send Email & Calendar Invites"
5. Check your email - it should match your app's branding!
6. Try copying the shopping list attachment into Apple Notes or Google Keep

## Troubleshooting

### 422 Error: "The recipient email address is invalid" or "Failed to send to all recipients"

**This is the most common error.** It means the EmailJS template's "To Email" field is not configured correctly.

**Solution:**

1. Go to EmailJS Dashboard → Email Templates → Your template
2. Find the **"To Email"** field in the template settings (not in the HTML editor)
3. Set it to exactly: `{{to_email}}`
4. Save the template
5. Try sending again

**Why this happens:** EmailJS requires the recipient email to be specified in the template settings. Even though the app sends `to_email` as a parameter, EmailJS needs to know which field to use for the recipient address.

### Other Common Issues

- **Variables not showing**: Make sure you use `{{{triple_braces}}}` for HTML content
- **Styling looks off**: Some email clients strip CSS - the template uses inline styles where possible
- **Fonts not loading**: Email clients may fall back to system fonts, which is fine
- **Email credentials error**: Double-check your EmailJS Service ID, Template ID, and Public Key in the app's Settings
