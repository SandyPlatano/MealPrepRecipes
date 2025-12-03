/**
 * EmailJS service for sending shopping lists
 */

/**
 * Send shopping list email via EmailJS
 */
export async function sendShoppingListEmail({
  toEmails,
  weekRange,
  schedule,
  shoppingListHtml,
  shoppingListText,
  shoppingListMarkdown,
  emailjsServiceId,
  emailjsTemplateId,
  emailjsPublicKey,
}) {
  if (!emailjsServiceId || !emailjsTemplateId || !emailjsPublicKey) {
    throw new Error('EmailJS credentials are required');
  }

  if (!toEmails || toEmails.length === 0) {
    throw new Error('At least one email address is required');
  }

  // EmailJS doesn't support multiple recipients in one call, so we send to each
  const results = await Promise.allSettled(
    toEmails.map(async (email) => {
      const response = await fetch(`https://api.emailjs.com/api/v1.0/email/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          service_id: emailjsServiceId,
          template_id: emailjsTemplateId,
          user_id: emailjsPublicKey,
          template_params: {
            to_email: email,
            subject: `Meal Plan & Shopping List - Week of ${weekRange}`,
            week_range: weekRange,
            schedule_table: formatScheduleTable(schedule),
            shopping_list_html: shoppingListHtml,
            shopping_list_text: shoppingListText,
            shopping_list_markdown: shoppingListMarkdown,
            item_count: countShoppingListItems(shoppingListText),
            recipe_count: schedule.length,
          },
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`EmailJS error: ${response.status} - ${errorText}`);
      }

      return { email, success: true };
    })
  );

  const successful = results.filter(r => r.status === 'fulfilled').length;
  const failed = results.filter(r => r.status === 'rejected');

  if (failed.length > 0) {
    console.error('Some emails failed to send:', failed);
  }

  return {
    successful,
    total: toEmails.length,
    failed: failed.length,
  };
}

/**
 * Format schedule as HTML table with app branding
 */
function formatScheduleTable(schedule) {
  if (!schedule || schedule.length === 0) {
    return '<p style="color: #737373; font-family: Inter, system-ui, sans-serif; margin: 20px 0;">No meals scheduled.</p>';
  }

  // Primary blue: hsl(221 83% 53%) = #3b82f6
  // Border: hsl(0 0% 89.8%) = #e5e5e5
  // Muted text: hsl(0 0% 45.1%) = #737373
  // Background: hsl(0 0% 96.1%) = #f5f5f5

  let html = '<table style="border-collapse: collapse; width: 100%; margin: 24px 0; border: 1px solid #e5e5e5; border-radius: 8px; overflow: hidden;">';
  html += '<thead><tr style="background-color: #f5f5f5;">';
  html += '<th style="border-bottom: 1px solid #e5e5e5; padding: 14px 16px; text-align: left; font-family: \'JetBrains Mono\', \'Fira Code\', Consolas, Monaco, monospace; font-size: 13px; font-weight: 600; color: #0a0a0a; letter-spacing: -0.02em;">Day</th>';
  html += '<th style="border-bottom: 1px solid #e5e5e5; padding: 14px 16px; text-align: left; font-family: \'JetBrains Mono\', \'Fira Code\', Consolas, Monaco, monospace; font-size: 13px; font-weight: 600; color: #0a0a0a; letter-spacing: -0.02em;">Cook</th>';
  html += '<th style="border-bottom: 1px solid #e5e5e5; padding: 14px 16px; text-align: left; font-family: \'JetBrains Mono\', \'Fira Code\', Consolas, Monaco, monospace; font-size: 13px; font-weight: 600; color: #0a0a0a; letter-spacing: -0.02em;">Recipe</th>';
  html += '</tr></thead><tbody>';

  schedule.forEach(({ day, cook, recipe }, index) => {
    const bgColor = index % 2 === 0 ? '#ffffff' : '#fafafa';
    html += `<tr style="background-color: ${bgColor};">`;
    html += `<td style="border-bottom: 1px solid #e5e5e5; padding: 12px 16px; font-family: Inter, system-ui, sans-serif; color: #0a0a0a;">${day}</td>`;
    html += `<td style="border-bottom: 1px solid #e5e5e5; padding: 12px 16px; font-family: Inter, system-ui, sans-serif; color: #0a0a0a;">${cook}</td>`;
    html += `<td style="border-bottom: 1px solid #e5e5e5; padding: 12px 16px; font-family: Inter, system-ui, sans-serif; color: #0a0a0a; font-weight: 500;">${recipe}</td>`;
    html += '</tr>';
  });

  html += '</tbody></table>';
  return html;
}

/**
 * Generate branded email HTML template
 * This function returns the HTML structure that should be used in EmailJS template
 */
export function getBrandedEmailTemplate() {
  return `<!DOCTYPE html>
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
</html>`;
}

/**
 * Count items in shopping list
 */
function countShoppingListItems(shoppingListText) {
  if (!shoppingListText) return 0;
  // Count lines that look like list items (start with - or *)
  const matches = shoppingListText.match(/^[-*]\s+/gm);
  return matches ? matches.length : 0;
}

