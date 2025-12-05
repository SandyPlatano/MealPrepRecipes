"use client";

import { useState } from "react";
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

    // Open popup for OAuth
    const width = 500;
    const height = 600;
    const left = (window.screen.width - width) / 2;
    const top = (window.screen.height - height) / 2;

    const popup = window.open(
      authUrl,
      "Google Calendar Auth",
      `width=${width},height=${height},left=${left},top=${top}`
    );

    // Check if popup was blocked
    if (!popup || popup.closed || typeof popup.closed === "undefined") {
      toast.error("Popup was blocked. Please allow popups for this site and try again.");
      setLoading(false);
      return;
    }

    // Listen for OAuth callback
    const handleMessage = async (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;

      if (event.data.type === "GOOGLE_OAUTH_SUCCESS") {
        const { code } = event.data;
        if (popup && !popup.closed) {
          popup.close();
        }
        window.removeEventListener("message", handleMessage);

        try {
          const response = await fetch("/api/google-calendar/exchange-token", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ code }),
          });

          const result = await response.json();

          if (!response.ok) {
            throw new Error(result.error || "Failed to connect");
          }

          toast.success("Google Calendar connected!");
          onConnectionChange();
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "Failed to connect";
          toast.error(errorMessage);
        } finally {
          setLoading(false);
        }
      } else if (event.data.type === "GOOGLE_OAUTH_ERROR") {
        if (popup && !popup.closed) {
          popup.close();
        }
        window.removeEventListener("message", handleMessage);
        toast.error("Failed to connect Google Calendar");
        setLoading(false);
      }
    };

    window.addEventListener("message", handleMessage);

    // Check if popup was closed
    const checkClosed = setInterval(() => {
      if (!popup || popup.closed) {
        clearInterval(checkClosed);
        window.removeEventListener("message", handleMessage);
        setLoading(false);
      }
    }, 1000);
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
