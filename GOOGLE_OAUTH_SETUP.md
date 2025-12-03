# Google OAuth 2.0 Setup Guide

## Fixing the redirect_uri_mismatch Error

The error you're seeing means that the redirect URI `https://meal-prep-recipes.vercel.app/auth/google/callback` is not registered in your Google Cloud Console OAuth credentials.

## Step-by-Step Fix

### 1. Go to Google Cloud Console

1. Navigate to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project (or create a new one if needed)

### 2. Navigate to OAuth Credentials

1. Go to **APIs & Services** → **Credentials**
2. Find your OAuth 2.0 Client ID (the one you're using in the app)
3. Click on it to edit

### 3. Add Authorized Redirect URIs

In the **Authorized redirect URIs** section, add the following URIs:

**For Production:**
```
https://meal-prep-recipes.vercel.app/auth/google/callback
```

**For Local Development (optional but recommended):**
```
http://localhost:3000/auth/google/callback
http://localhost:5173/auth/google/callback
```

**Important Notes:**
- The URI must match **exactly** (including the protocol `https://` or `http://`)
- No trailing slashes
- Case-sensitive

### 4. Save Changes

Click **Save** at the bottom of the page.

### 5. Wait for Propagation

Changes may take a few minutes to propagate. If you still see the error after 5-10 minutes:
- Clear your browser cache
- Try in an incognito/private window
- Double-check the URI matches exactly

## Verification Checklist

- [ ] Redirect URI added in Google Cloud Console
- [ ] URI matches exactly (including protocol)
- [ ] Changes saved
- [ ] Waited a few minutes for propagation
- [ ] Cleared browser cache if needed

## Additional Configuration

### If Using Multiple Environments

You may want to add redirect URIs for:
- Production: `https://meal-prep-recipes.vercel.app/auth/google/callback`
- Staging (if applicable): `https://staging.meal-prep-recipes.vercel.app/auth/google/callback`
- Local development: `http://localhost:3000/auth/google/callback`

### OAuth Consent Screen

Make sure your OAuth consent screen is properly configured:
1. Go to **APIs & Services** → **OAuth consent screen**
2. Ensure your app name, support email, and other required fields are filled
3. Add your domain to **Authorized domains** if using a custom domain

## Testing

After adding the redirect URI:

1. Try connecting Google Calendar again in your app
2. You should be redirected to Google's authorization page
3. After authorizing, you should be redirected back to your callback URL
4. The popup should close and show a success message

## Troubleshooting

### Still seeing the error?

1. **Check the exact URI in the error message** - it must match exactly what you entered
2. **Verify you're editing the correct OAuth client** - check the Client ID matches
3. **Check for typos** - common issues:
   - Missing `https://` or using `http://` for production
   - Trailing slashes
   - Wrong domain
   - Wrong path (`/auth/google/callback`)

### Error persists after 10 minutes?

- Try creating a new OAuth 2.0 Client ID
- Update your app settings with the new Client ID and Client Secret
- Make sure you're using the correct credentials in your app

## Security Notes

- Never commit your Client Secret to version control
- Use environment variables for sensitive credentials
- Regularly rotate your OAuth credentials
- Only add redirect URIs for domains you control

