# EmailJS Template Setup with Branded Design

This guide shows you how to set up your EmailJS template to match the Meal Prep Recipe Manager branding.

## Quick Setup

1. **Copy the Branded Template HTML**
   - The template HTML is available in `src/utils/emailService.js` via the `getBrandedEmailTemplate()` function
   - Or use the template below

2. **In EmailJS Dashboard:**
   - Go to **Email Templates** → Your template
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
```
Meal Prep Shopping List - {{week_range}}
```

## Template Variables Used

The template uses these variables (automatically provided by the app):

- `{{week_range}}` - Week date range (e.g., "Dec 1 - Dec 7, 2024")
- `{{{schedule_table}}}` - HTML table of meals (use triple braces for HTML)
- `{{{shopping_list_html}}}` - Shopping list HTML (use triple braces for HTML)
- `{{item_count}}` - Number of shopping list items
- `{{recipe_count}}` - Number of recipes this week
- `{{to_email}}` - Recipient email address (used by EmailJS, not in template)

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

## Testing

After updating your EmailJS template:

1. Save the template in EmailJS
2. Go to your app
3. Add recipes to cart and assign them
4. Click "Send Email & Calendar Invites"
5. Check your email - it should match your app's branding!

## Troubleshooting

- **Variables not showing**: Make sure you use `{{{triple_braces}}}` for HTML content
- **Styling looks off**: Some email clients strip CSS - the template uses inline styles where possible
- **Fonts not loading**: Email clients may fall back to system fonts, which is fine

