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

  useEffect(() => {
    // Check both cookie and localStorage for consent
    // This handles cases where cookies are cleared but localStorage persists
    const cookieConsent = getCookie(CONSENT_COOKIE_NAME);
    const storageConsent = localStorage.getItem(CONSENT_COOKIE_NAME);
    
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

