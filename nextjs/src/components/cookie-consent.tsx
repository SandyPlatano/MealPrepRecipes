"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { X } from "lucide-react";

const CONSENT_COOKIE_NAME = "cookie-consent";

/**
 * Get cookie value by name
 */
function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift() || null;
  return null;
}

/**
 * Set cookie with expiration
 */
function setCookie(name: string, value: string, days: number = 365) {
  if (typeof document === "undefined") return;
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
}

export function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);

  // #region agent log
  useEffect(() => {
    const isSSR = typeof window === "undefined";
    fetch('http://127.0.0.1:7242/ingest/e7393dc2-767c-4b48-9410-102b5c37a0a3',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'cookie-consent.tsx:35',message:'CookieConsent initial render',data:{isSSR,showBanner,hasWindow:typeof window !== 'undefined',hasDocument:typeof document !== 'undefined'},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
  }, []);
  // #endregion

  useEffect(() => {
    // Check both cookie and localStorage for consent
    // This handles cases where cookies are cleared but localStorage persists
    const cookieConsent = getCookie(CONSENT_COOKIE_NAME);
    const storageConsent = localStorage.getItem(CONSENT_COOKIE_NAME);
    
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/e7393dc2-767c-4b48-9410-102b5c37a0a3',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'cookie-consent.tsx:42',message:'CookieConsent useEffect - checking consent',data:{cookieConsent,storageConsent,willShowBanner:!cookieConsent && !storageConsent},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
    // #endregion
    
    // Show banner if no consent found in either location
    if (!cookieConsent && !storageConsent) {
      setShowBanner(true);
    } else {
      // Sync cookie if we have localStorage but no cookie
      if (storageConsent && !cookieConsent) {
        setCookie(CONSENT_COOKIE_NAME, storageConsent);
      }
      // Sync localStorage if we have cookie but no localStorage
      if (cookieConsent && !storageConsent) {
        localStorage.setItem(CONSENT_COOKIE_NAME, cookieConsent);
      }
    }
  }, []);

  const acceptCookies = () => {
    const value = "accepted";
    setCookie(CONSENT_COOKIE_NAME, value);
    localStorage.setItem(CONSENT_COOKIE_NAME, value);
    setShowBanner(false);
  };

  const declineCookies = () => {
    const value = "declined";
    setCookie(CONSENT_COOKIE_NAME, value);
    localStorage.setItem(CONSENT_COOKIE_NAME, value);
    setShowBanner(false);
  };

  // #region agent log
  useEffect(() => {
    if (typeof window !== "undefined") {
      fetch('http://127.0.0.1:7242/ingest/e7393dc2-767c-4b48-9410-102b5c37a0a3',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'cookie-consent.tsx:70',message:'CookieConsent render decision',data:{showBanner,willRender:showBanner},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
    }
  }, [showBanner]);
  // #endregion

  if (!showBanner) {
    return null;
  }

  return (
    <div 
      id="cookie-consent"
      className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cookie-consent-title"
      aria-describedby="cookie-consent-description"
      tabIndex={-1}
    >
      <Card className="max-w-4xl mx-auto border-2 shadow-lg cookie-consent-banner">
        <CardContent className="p-4 md:p-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex-1 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <h3 id="cookie-consent-title" className="font-semibold text-base">We use cookies</h3>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 md:hidden"
                  onClick={declineCookies}
                  aria-label="Decline cookies"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <p id="cookie-consent-description" className="text-sm text-muted-foreground">
                We use essential cookies to keep you logged in and remember your
                preferences. No tracking or advertising cookies.{" "}
                <Link
                  href="/privacy"
                  className="text-primary hover:underline"
                  target="_blank"
                >
                  Learn more
                </Link>
              </p>
            </div>
            <div className="flex items-center gap-2 w-full md:w-auto">
              <Button
                variant="outline"
                onClick={declineCookies}
                className="flex-1 md:flex-none"
              >
                Manage Settings
              </Button>
              <Button onClick={acceptCookies} className="flex-1 md:flex-none">
                Accept
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

