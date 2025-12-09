"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

function GoogleCallbackContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");
  const [canClose, setCanClose] = useState(false);

  useEffect(() => {
    const code = searchParams.get("code");
    const error = searchParams.get("error");
    const isPopup = !!window.opener;

    if (error) {
      setStatus("error");
      setMessage("Authentication failed.");
      setCanClose(true);
      
      // Redirect to settings with error after delay
      setTimeout(() => {
        if (isPopup && window.opener) {
          window.close();
        } else {
          router.push("/app/settings?oauth=error");
        }
      }, 2000);
      return;
    }

    if (code) {
      setMessage("Connecting to Google Calendar...");

      // Exchange the code for tokens directly from this page
      const redirectUri = `${window.location.origin}/auth/google/callback`;
      
      fetch("/api/google-calendar/exchange-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, redirectUri }),
      })
        .then(async (response) => {
          const result = await response.json();

          if (!response.ok) {
            throw new Error(result.error || "Failed to connect");
          }

          setStatus("success");
          setMessage("Connected! Redirecting...");

          // Redirect to settings with success
          setTimeout(() => {
            if (isPopup && window.opener) {
              // Signal success to opener and close
              try {
                window.opener.postMessage({ type: "GOOGLE_OAUTH_COMPLETE" }, window.location.origin);
              } catch {
                // Opener window not available or closed
              }
              window.close();
            } else {
              router.push("/app/settings?oauth=success");
            }
          }, 1000);
        })
        .catch((error) => {
          setStatus("error");
          setMessage(error instanceof Error ? error.message : "Failed to connect");
          setCanClose(true);

          // Redirect to settings with error after delay
          setTimeout(() => {
            if (isPopup && window.opener) {
              window.close();
            } else {
              router.push("/app/settings?oauth=error");
            }
          }, 3000);
        });
    } else {
      setStatus("error");
      setMessage("No authorization code received.");
      setCanClose(true);
      
      setTimeout(() => {
        if (isPopup && window.opener) {
          window.close();
        } else {
          router.push("/app/settings?oauth=error");
        }
      }, 2000);
    }
  }, [searchParams, router]);

  const handleClose = () => {
    // Try to close the window
    try {
      window.close();
    } catch {
      // If that fails, redirect to settings
      router.push("/app/settings");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="text-center space-y-4 p-8">
        {status === "loading" && (
          <>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
            <p className="text-lg">Connecting to Google Calendar...</p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="text-green-500 text-6xl">✓</div>
            <p className="text-lg font-semibold">Connected Successfully!</p>
            <p className="text-muted-foreground">{message}</p>
            {canClose && (
              <Button onClick={handleClose} className="mt-4">
                Close Window
              </Button>
            )}
          </>
        )}

        {status === "error" && (
          <>
            <div className="text-red-500 text-6xl">✗</div>
            <p className="text-lg font-semibold">Connection Failed</p>
            <p className="text-muted-foreground">{message}</p>
            {canClose && (
              <Button onClick={handleClose} variant="outline" className="mt-4">
                Close Window
              </Button>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default function GoogleCallbackPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center space-y-4 p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
          <p className="text-lg">Loading...</p>
        </div>
      </div>
    }>
      <GoogleCallbackContent />
    </Suspense>
  );
}
