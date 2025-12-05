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

    if (error) {
      setStatus("error");
      setMessage("Authentication failed. You can close this window.");

      // Send error to parent window
      if (window.opener) {
        window.opener.postMessage(
          { type: "GOOGLE_OAUTH_ERROR", error },
          window.location.origin
        );
      }
      setCanClose(true);
      return;
    }

    if (code) {
      setStatus("success");
      setMessage("Success! This window will close automatically...");

      // Send code to parent window
      if (window.opener) {
        window.opener.postMessage(
          { type: "GOOGLE_OAUTH_SUCCESS", code },
          window.location.origin
        );

        // Try to close the popup after a short delay
        setTimeout(() => {
          try {
            window.close();
            // If window.close() doesn't work, show manual close button
            setTimeout(() => {
              setCanClose(true);
              setMessage("Please close this window to return to settings.");
            }, 500);
          } catch {
            setCanClose(true);
            setMessage("Please close this window to return to settings.");
          }
        }, 1500);
      } else {
        // If there's no opener (not a popup), redirect to settings
        setMessage("Success! Redirecting to settings...");
        setTimeout(() => {
          router.push("/app/settings");
        }, 1500);
      }
    } else {
      setStatus("error");
      setMessage("No authorization code received.");
      setCanClose(true);
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
