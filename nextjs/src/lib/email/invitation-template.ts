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
  <link href="https://fonts.googleapis.com/css2?family=Caveat:wght@500;600;700&family=JetBrains+Mono:wght@500;600;700&display=swap" rel="stylesheet">
</head>
<body style="margin: 0; padding: 0; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif; background-color: #FFF8F5; color: #0a0a0a; line-height: 1.6; -webkit-font-smoothing: antialiased;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(249, 115, 22, 0.08);">

    <!-- Header -->
    <div style="background: linear-gradient(135deg, #FFF8F5 0%, #ffffff 100%); border-bottom: 2px solid #F97316; padding: 40px 24px 32px 24px; text-align: center;">
      <h1 style="margin: 0 0 8px 0; line-height: 1.2;">
        <span style="font-family: 'Caveat', cursive, system-ui; font-size: 36px; font-weight: 600; color: #F97316;">Babe,</span>
        <span style="font-family: 'JetBrains Mono', Consolas, Monaco, monospace; font-size: 22px; font-weight: 700; color: #0a0a0a; letter-spacing: -0.02em;"> What's for Dinner?</span>
      </h1>
      <p style="font-size: 14px; color: #737373; margin: 0; font-style: italic;">You've been invited to join the meal planning party!</p>
    </div>

    <!-- Content -->
    <div style="padding: 32px 24px;">

      <!-- Invitation Message -->
      <div style="margin-bottom: 28px; text-align: center;">
        <div style="display: inline-block; background-color: #FFF8F5; border: 2px solid #F97316; padding: 20px 28px; border-radius: 12px;">
          <p style="margin: 0 0 8px 0; font-size: 16px; color: #0a0a0a;">
            <strong style="color: #F97316;">${data.inviterName}</strong> has invited you to join their household!
          </p>
          <p style="margin: 0; font-size: 14px; color: #737373;">
            Plan meals together, share recipes, and never wonder what's for dinner again.
          </p>
        </div>
      </div>

      <!-- Join Button -->
      <div style="text-align: center; margin: 32px 0;">
        <a href="${data.inviteLink}" target="_blank" style="display: inline-block; background-color: #F97316; color: #ffffff; padding: 16px 40px; text-decoration: none; border-radius: 10px; font-weight: 700; font-family: 'Inter', sans-serif; font-size: 16px; box-shadow: 0 4px 12px rgba(249, 115, 22, 0.35);">
          🏠 Join Household
        </a>
      </div>

      <!-- Expiration Notice -->
      <div style="text-align: center; margin-bottom: 24px;">
        <p style="font-size: 13px; color: #737373; margin: 0;">
          This invitation expires in <strong style="color: #F97316;">${data.expiresInDays} days</strong>
        </p>
      </div>

      <!-- Alternate Link -->
      <div style="background-color: #FFF8F5; padding: 16px; border-radius: 8px; margin-top: 24px;">
        <p style="font-size: 12px; color: #737373; margin: 0 0 8px 0;">
          If the button doesn't work, copy and paste this link into your browser:
        </p>
        <p style="font-family: 'JetBrains Mono', Consolas, monospace; font-size: 11px; color: #F97316; word-break: break-all; margin: 0;">
          ${data.inviteLink}
        </p>
      </div>

    </div>

    <!-- Footer -->
    <div style="background: linear-gradient(135deg, #F97316 0%, #ea580c 100%); padding: 32px 24px; text-align: center;">
      <p style="margin: 0 0 8px 0; line-height: 1.2;">
        <span style="font-family: 'Caveat', cursive, system-ui; font-size: 28px; font-weight: 600; color: #ffffff;">Babe,</span>
        <span style="font-family: 'JetBrains Mono', Consolas, Monaco, monospace; font-size: 16px; font-weight: 700; color: #ffffff;"> What's for Dinner?</span>
      </p>
      <p style="font-size: 13px; color: rgba(255,255,255,0.85); margin: 8px 0; font-style: italic;">
        Made with love (and mild guilt)
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
Made with love (and mild guilt)
`;
}
