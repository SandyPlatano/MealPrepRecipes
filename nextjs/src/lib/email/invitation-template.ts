interface InvitationEmailData {
  inviterName: string;
  inviteLink: string;
  expiresInDays: number;
}

export function generateInvitationHTML(data: InvitationEmailData): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
</head>
<body style="margin: 0; padding: 0; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif; background-color: #FFFCF6; color: #1A1A1A; line-height: 1.6; -webkit-font-smoothing: antialiased;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #FFFFFF; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);">

    <!-- Header -->
    <div style="background: #FFFCF6; border-bottom: 2px solid #D9F99D; padding: 40px 24px 32px 24px; text-align: center;">
      <div style="display: inline-block; width: 48px; height: 48px; background: #D9F99D; border-radius: 12px; margin-bottom: 16px; line-height: 48px; font-size: 24px;">🍽️</div>
      <h1 style="margin: 0 0 8px 0; line-height: 1.2;">
        <span style="font-family: 'Inter', -apple-system, sans-serif; font-size: 28px; font-weight: 700; color: #1A1A1A; font-style: italic;">Babe,</span>
        <span style="font-family: 'Inter', -apple-system, sans-serif; font-size: 22px; font-weight: 700; color: #1A1A1A;"> What's for Dinner?</span>
      </h1>
      <p style="font-size: 14px; color: #6B7280; margin: 0; font-style: italic;">You've been invited to join the meal planning party!</p>
    </div>

    <!-- Content -->
    <div style="padding: 32px 24px;">

      <!-- Invitation Message -->
      <div style="margin-bottom: 28px; text-align: center;">
        <div style="display: inline-block; background-color: #E4F8C9; border: 1px solid #D9F99D; padding: 20px 28px; border-radius: 16px;">
          <p style="margin: 0 0 8px 0; font-size: 16px; color: #1A1A1A;">
            <strong>${data.inviterName}</strong> has invited you to join their household!
          </p>
          <p style="margin: 0; font-size: 14px; color: #6B7280;">
            Plan meals together, share recipes, and never wonder what's for dinner again.
          </p>
        </div>
      </div>

      <!-- Join Button -->
      <div style="text-align: center; margin: 32px 0;">
        <a href="${data.inviteLink}" target="_blank" style="display: inline-block; background-color: #1A1A1A; color: #FFFFFF; padding: 16px 40px; text-decoration: none; border-radius: 100px; font-weight: 700; font-family: 'Inter', sans-serif; font-size: 16px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);">
          🏠 Join Household
        </a>
      </div>

      <!-- Expiration Notice -->
      <div style="text-align: center; margin-bottom: 24px;">
        <p style="font-size: 13px; color: #6B7280; margin: 0;">
          This invitation expires in <strong style="color: #1A1A1A;">${data.expiresInDays} days</strong>
        </p>
      </div>

      <!-- Alternate Link -->
      <div style="background-color: #F9FAFB; padding: 16px; border-radius: 12px; margin-top: 24px; border: 1px solid #E5E7EB;">
        <p style="font-size: 12px; color: #6B7280; margin: 0 0 8px 0;">
          If the button doesn't work, copy and paste this link into your browser:
        </p>
        <p style="font-family: 'SF Mono', Consolas, monospace; font-size: 11px; color: #1A1A1A; word-break: break-all; margin: 0;">
          ${data.inviteLink}
        </p>
      </div>

    </div>

    <!-- Footer -->
    <div style="background: #1A1A1A; padding: 32px 24px; text-align: center;">
      <div style="display: inline-block; width: 32px; height: 32px; background: #D9F99D; border-radius: 8px; margin-bottom: 12px; line-height: 32px; font-size: 16px;">🍽️</div>
      <p style="margin: 0 0 8px 0; line-height: 1.2;">
        <span style="font-family: 'Inter', -apple-system, sans-serif; font-size: 20px; font-weight: 700; color: #FFFFFF; font-style: italic;">Babe,</span>
        <span style="font-family: 'Inter', -apple-system, sans-serif; font-size: 16px; font-weight: 700; color: #FFFFFF;"> What's for Dinner?</span>
      </p>
      <p style="font-size: 13px; color: rgba(255, 255, 255, 0.7); margin: 8px 0; font-style: italic;">
        Finally, an answer. 💕
      </p>
    </div>
  </div>
</body>
</html>`;
}

export function generateInvitationText(data: InvitationEmailData): string {
  return `BABE, WHAT'S FOR DINNER?
You've been invited to join the meal planning party!

${"=".repeat(50)}

${data.inviterName} has invited you to join their household!

Plan meals together, share recipes, and never wonder what's for dinner again.

${"=".repeat(50)}

JOIN HOUSEHOLD:
${data.inviteLink}

This invitation expires in ${data.expiresInDays} days.

${"=".repeat(50)}
Babe, What's for Dinner?
Finally, an answer.
`;
}
