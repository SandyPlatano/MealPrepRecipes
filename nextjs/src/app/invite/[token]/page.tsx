"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, CheckCircle, XCircle, Home, LogIn } from "lucide-react";
import { acceptHouseholdInvitation } from "@/app/actions/household-invitations";
import { createClient } from "@/lib/supabase/client";

type InviteState = "loading" | "ready" | "accepting" | "success" | "error" | "needs_auth";

export default function InvitePage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;

  const [state, setState] = useState<InviteState>("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check authentication status on mount
  useEffect(() => {
    async function checkAuth() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        setIsAuthenticated(true);
        setState("ready");
      } else {
        setIsAuthenticated(false);
        setState("needs_auth");
      }
    }

    checkAuth();
  }, []);

  const handleAcceptInvitation = async () => {
    setState("accepting");

    const result = await acceptHouseholdInvitation(token);

    if (result.error) {
      setErrorMessage(result.error);
      setState("error");
    } else {
      setState("success");
      // Redirect to app after a brief delay
      setTimeout(() => {
        router.push("/app");
      }, 2000);
    }
  };

  const handleSignIn = () => {
    // Redirect to sign in with a return URL back to this page
    router.push(`/auth/sign-in?redirect=/invite/${token}`);
  };

  const handleSignUp = () => {
    // Redirect to sign up with a return URL back to this page
    router.push(`/auth/sign-up?redirect=/invite/${token}`);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Household Invitation</CardTitle>
          <CardDescription>
            You&apos;ve been invited to join a household
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {state === "loading" && (
            <div className="flex flex-col items-center gap-4 py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Loading invitation...</p>
            </div>
          )}

          {state === "needs_auth" && (
            <div className="flex flex-col items-center gap-4 py-4">
              <LogIn className="h-12 w-12 text-muted-foreground" />
              <p className="text-center text-muted-foreground">
                You need to sign in or create an account to accept this invitation.
              </p>
              <div className="flex gap-2 w-full">
                <Button className="flex-1" onClick={handleSignIn}>
                  Sign In
                </Button>
                <Button variant="outline" className="flex-1" onClick={handleSignUp}>
                  Sign Up
                </Button>
              </div>
            </div>
          )}

          {state === "ready" && (
            <div className="flex flex-col items-center gap-4 py-4">
              <Home className="h-12 w-12 text-primary" />
              <p className="text-center text-muted-foreground">
                Click below to join the household and start collaborating on meal plans.
              </p>
              <Button className="w-full" onClick={handleAcceptInvitation}>
                Accept Invitation
              </Button>
            </div>
          )}

          {state === "accepting" && (
            <div className="flex flex-col items-center gap-4 py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Accepting invitation...</p>
            </div>
          )}

          {state === "success" && (
            <div className="flex flex-col items-center gap-4 py-4">
              <CheckCircle className="h-12 w-12 text-green-500" />
              <p className="text-center text-green-600 font-medium">
                You&apos;ve successfully joined the household!
              </p>
              <p className="text-sm text-muted-foreground">
                Redirecting you to the app...
              </p>
            </div>
          )}

          {state === "error" && (
            <div className="flex flex-col items-center gap-4 py-4">
              <XCircle className="h-12 w-12 text-destructive" />
              <p className="text-center text-destructive font-medium">
                {errorMessage || "Something went wrong"}
              </p>
              <Button variant="outline" onClick={() => router.push("/app")}>
                Go to App
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
