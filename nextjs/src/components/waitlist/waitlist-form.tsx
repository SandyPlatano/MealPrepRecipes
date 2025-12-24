"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Check, Mail } from "lucide-react";

interface WaitlistFormProps {
  source?: string;
  className?: string;
}

type FormState = "idle" | "loading" | "success" | "error";

export function WaitlistForm({ source = "website", className }: WaitlistFormProps) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<FormState>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) return;

    setState("loading");
    setErrorMessage("");

    try {
      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), source }),
      });

      const data = await response.json();

      if (!response.ok) {
        setState("error");
        setErrorMessage(data.error || "Something went wrong");
        return;
      }

      setState("success");
    } catch {
      setState("error");
      setErrorMessage("Network error. Please try again.");
    }
  };

  if (state === "success") {
    return (
      <div className={className}>
        <div className="flex items-center justify-center gap-2 rounded-lg border border-green-500/30 bg-green-500/10 px-4 py-3 text-green-600 dark:text-green-400">
          <Check className="size-5" />
          <span className="font-medium">You&apos;re on the list!</span>
        </div>
        <p className="mt-2 text-center text-sm text-muted-foreground">
          We&apos;ll let you know when we&apos;re ready.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={className}>
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={state === "loading"}
            className="pl-9"
            required
          />
        </div>
        <Button type="submit" disabled={state === "loading" || !email.trim()}>
          {state === "loading" ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              <span>Joining...</span>
            </>
          ) : (
            "Join Waitlist"
          )}
        </Button>
      </div>

      {state === "error" && (
        <p className="mt-2 text-sm text-destructive">{errorMessage}</p>
      )}
    </form>
  );
}
