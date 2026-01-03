# Google Calendar OAuth Debugging Guide

## Current Issue
The OAuth flow appears to succeed (green checkmark in popup), but the connection is not saved to the database. The token exchange endpoint is never called.

## Diagnosis Steps

### 1. Check Browser Console
Open the browser console (F12) on the settings page before clicking "Connect Google Calendar". You should see:

```
[Google OAuth] Starting OAuth flow with redirect URI: http://localhost:3001/auth/google/callback
[Google OAuth] Popup opened successfully
[Google OAuth] Message listener attached, waiting for callback...
[Google OAuth] Popup still open, checking opener access...
```

### 2. Check Popup Console
If the popup doesn't auto-close, open its console (F12) and check for:

```
[Google OAuth Callback] Loaded with: { code: "4/0ATX87l...", error: null, hasOpener: true }
[Google OAuth Callback] Authorization code received: 4/0ATX87l...
[Google OAuth Callback] Sending code to parent window
[Google OAuth Callback] Message sent successfully
[Google OAuth Callback] Attempting to close popup
```

### 3. Check Parent Console After Popup Closes
After the popup closes, check the parent window console for:

```
[Google OAuth] Message received: { type: "GOOGLE_OAUTH_SUCCESS", code: "..." }
[Google OAuth] Received authorization code: 4/0ATX87l...
[Google OAuth] Exchanging code for tokens with redirect URI: http://localhost:3001/auth/google/callback
[Google OAuth] Token exchange response: { ok: true, result: {...} }
[Google OAuth] Successfully connected!
```

### 4. Check Server Terminal
Look for these log entries:

```
POST /api/google-calendar/exchange-token 200
[Google OAuth API] Exchange token request: { userId: "...", hasCode: true, redirectUri: "..." }
[Google OAuth API] Exchanging code for tokens with redirect URI: http://localhost:3001/auth/google/callback
[Google OAuth API] Token exchange successful
[Google OAuth API] Retrieved Google user email: your@email.com
[Google OAuth API] Saving tokens to database for user: ...
[Google OAuth API] Successfully saved Google Calendar connection
```

## Common Issues

### Issue 1: No message received in parent window
**Symptom**: Popup shows success but parent console never shows "Message received"

**Possible Causes**:
- Browser security policy blocking cross-window communication
- Popup opened with `noopener` attribute (now fixed)
- Parent window navigated/refreshed before message received

**Solution**: 
- Ensure you're using the same browser window for settings page
- Check browser security settings
- Try a different browser (Chrome recommended)

### Issue 2: 401 Not Authenticated
**Symptom**: `/api/google-calendar/status` returns 401 after OAuth

**Possible Causes**:
- Session cookies not being preserved
- Browser privacy settings blocking cookies
- Incognito/private mode

**Solution**:
- Check browser cookie settings
- Ensure you're logged in before starting OAuth
- Try regular (non-private) browsing mode

### Issue 3: Redirect URI Mismatch
**Symptom**: Token exchange fails with redirect URI error

**Check**:
- Client redirect URI: `http://localhost:3001/auth/google/callback`
- Server redirect URI: Should match exactly
- Google OAuth console: Must have this URI in authorized redirect URIs

### Issue 4: Environment Variable Issues
**Check `.env.local`**:
```bash
NEXT_PUBLIC_APP_URL=http://localhost:3001
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
```

## Alternative Communication Method

If `postMessage` continues to fail, we can switch to using `localStorage` for cross-window communication:

### Popup writes to localStorage:
```javascript
localStorage.setItem('google_oauth_code', code);
localStorage.setItem('google_oauth_timestamp', Date.now().toString());
```

### Parent polls localStorage:
```javascript
const checkInterval = setInterval(() => {
  const code = localStorage.getItem('google_oauth_code');
  const timestamp = localStorage.getItem('google_oauth_timestamp');
  if (code && timestamp && Date.now() - parseInt(timestamp) < 5000) {
    // Process code
    localStorage.removeItem('google_oauth_code');
    localStorage.removeItem('google_oauth_timestamp');
    clearInterval(checkInterval);
  }
}, 500);
```

This is more reliable across different browser security contexts.

