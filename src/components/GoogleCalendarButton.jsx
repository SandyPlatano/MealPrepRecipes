import { useState } from 'react';
import { Button } from './ui/button';
import { useSettings } from '../context/SettingsContext';
import { getGoogleOAuthURL, exchangeCodeForTokens, getUserInfo } from '../utils/googleCalendarService';
import { toast } from 'sonner';
import { Loader2, Calendar } from 'lucide-react';

export default function GoogleCalendarButton() {
  const { settings, updateGoogleTokens, clearGoogleConnection, updateSettings } = useSettings();
  const [loading, setLoading] = useState(false);

  const handleConnect = () => {
    if (!settings.googleClientId) {
      toast.error('Please set Google Client ID in Settings first');
      return;
    }

    const redirectUri = `${window.location.origin}/auth/google/callback`;
    const authUrl = getGoogleOAuthURL(settings.googleClientId, redirectUri);
    
    // Open popup for OAuth
    const width = 500;
    const height = 600;
    const left = (window.screen.width - width) / 2;
    const top = (window.screen.height - height) / 2;
    
    const popup = window.open(
      authUrl,
      'Google Calendar Auth',
      `width=${width},height=${height},left=${left},top=${top}`
    );

    // Check if popup was blocked
    if (!popup || popup.closed || typeof popup.closed === 'undefined') {
      toast.error('Popup was blocked. Please allow popups for this site and try again.');
      return;
    }

    // Listen for OAuth callback
    const handleMessage = async (event) => {
      if (event.origin !== window.location.origin) return;
      
      if (event.data.type === 'GOOGLE_OAUTH_SUCCESS') {
        const { code } = event.data;
        if (popup && !popup.closed) {
          popup.close();
        }
        window.removeEventListener('message', handleMessage);
        
        setLoading(true);
        try {
          const tokens = await exchangeCodeForTokens(
            code,
            settings.googleClientId,
            settings.googleClientSecret,
            redirectUri
          );
          
          // Fetch user email
          let userEmail = '';
          try {
            const userInfo = await getUserInfo(tokens.access_token);
            userEmail = userInfo.email || '';
          } catch (error) {
            console.warn('Failed to fetch user email:', error);
            // Continue without email - connection still works
          }
          
          updateGoogleTokens({
            access_token: tokens.access_token,
            refresh_token: tokens.refresh_token,
            email: userEmail,
          });
          
          toast.success('Google Calendar connected!');
        } catch (error) {
          toast.error(`Failed to connect: ${error.message}`);
        } finally {
          setLoading(false);
        }
      } else if (event.data.type === 'GOOGLE_OAUTH_ERROR') {
        if (popup && !popup.closed) {
          popup.close();
        }
        window.removeEventListener('message', handleMessage);
        toast.error('Failed to connect Google Calendar');
      }
    };

    window.addEventListener('message', handleMessage);
    
    // Check if popup was closed
    const checkClosed = setInterval(() => {
      if (!popup || popup.closed) {
        clearInterval(checkClosed);
        window.removeEventListener('message', handleMessage);
      }
    }, 1000);
  };

  const handleDisconnect = () => {
    clearGoogleConnection();
    toast.success('Google Calendar disconnected');
  };

  if (settings.googleConnectedAccount || settings.googleAccessToken) {
    return (
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">
          Connected: <strong>{settings.googleConnectedAccount || 'Google Calendar'}</strong>
        </p>
        <Button variant="outline" onClick={handleDisconnect}>
          Disconnect
        </Button>
      </div>
    );
  }

  return (
    <Button
      onClick={handleConnect}
      disabled={loading || !settings.googleClientId}
      variant="outline"
    >
      {loading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Connecting...
        </>
      ) : (
        <>
          <Calendar className="mr-2 h-4 w-4" />
          Connect Google Calendar
        </>
      )}
    </Button>
  );
}

