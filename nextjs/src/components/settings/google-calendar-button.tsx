"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Calendar, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface GoogleCalendarButtonProps {
  connectedAccount: string | null;
  onConnectionChange: () => void;
}

export function GoogleCalendarButton({
  connectedAccount,
  onConnectionChange,
}: GoogleCalendarButtonProps) {
  const [loading, setLoading] = useState(false);

  // Check for OAuth result in URL params (using window.location instead of useSearchParams)
  useEffect(() => {
    if (typeof window === "undefined") return;
    
    const urlParams = new URLSearchParams(window.location.search);
    const oauthResult = urlParams.get("oauth");
    
    if (oauthResult === "success") {
      toast.success("Google Calendar connected!");
      onConnectionChange();
      // Clean up URL
      window.history.replaceState({}, "", "/app/settings");
    } else if (oauthResult === "error") {
      toast.error("Failed to connect Google Calendar");
      setLoading(false);
      // Clean up URL
      window.history.replaceState({}, "", "/app/settings");
    }
  }, [onConnectionChange]);

  // Listen for popup completion message
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      
      if (event.data.type === "GOOGLE_OAUTH_COMPLETE") {
        toast.success("Google Calendar connected!");
        onConnectionChange();
        setLoading(false);
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [onConnectionChange]);

  const handleConnect = () => {
    setLoading(true);

    const redirectUri = `${window.location.origin}/auth/google/callback`;
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||  "915222848680-59ru45o52e5auq4gbl9cm1vub6c5ch7a.apps.googleusercontent.com";
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: "code",
      scope: "https://www.googleapis.com/auth/calendar.events https://www.googleapis.com/auth/userinfo.email",
      access_type: "offline",
      prompt: "consent",
    });

    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;

    // Try to open as popup
    const width = 500;
    const height = 600;
    const left = (window.screen.width - width) / 2;
    const top = (window.screen.height - height) / 2;

    const popup = window.open(
      authUrl,
      "Google Calendar Auth",
      `width=${width},height=${height},left=${left},top=${top}`
    );

    // If popup was blocked or failed, use redirect instead
    if (!popup || popup.closed || typeof popup.closed === "undefined") {
      window.location.href = authUrl;
      return;
    }
    // Monitor popup closure
    const checkClosed = setInterval(() => {
      if (popup.closed) {
        clearInterval(checkClosed);
        // The callback page will have handled everything
        // Check if we need to reload settings after a delay
        setTimeout(() => {
          setLoading(false);
          onConnectionChange();
        }, 1000);
      }
    }, 500);
  };

  const handleDisconnect = async () => {
    setLoading(true);

    try {
      const response = await fetch("/api/google-calendar/disconnect", {
        method: "POST",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to disconnect");
      }

      toast.success("Google Calendar disconnected");
      onConnectionChange();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to disconnect";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (connectedAccount) {
    return (
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">
          Connected: <strong>{connectedAccount}</strong>
        </p>
        <Button variant="outline" onClick={handleDisconnect} disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Disconnecting...
            </>
          ) : (
            "Disconnect"
          )}
        </Button>
      </div>
    );
  }

  return (
    <Button onClick={handleConnect} disabled={loading} variant="outline">
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
