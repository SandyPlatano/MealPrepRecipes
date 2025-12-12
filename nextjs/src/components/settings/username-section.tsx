"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { AtSign, Check, X, Loader2, Sparkles, Globe } from "lucide-react";
import { toast } from "sonner";
import { checkUsernameAvailable, setUsername } from "@/app/actions/sharing";
import { useDebounce } from "@/lib/use-debounce";

interface UsernameSectionProps {
  currentUsername: string | null;
}

export function UsernameSection({ currentUsername }: UsernameSectionProps) {
  const [username, setUsernameValue] = useState(currentUsername || "");
  const [isChecking, setIsChecking] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [suggestion, setSuggestion] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  const debouncedUsername = useDebounce(username, 500);

  // Reset when currentUsername changes
  useEffect(() => {
    setUsernameValue(currentUsername || "");
    setHasChanges(false);
    setIsAvailable(null);
    setError(null);
    setSuggestion(null);
  }, [currentUsername]);

  // Check availability when username changes
  useEffect(() => {
    async function check() {
      const normalized = debouncedUsername.toLowerCase().trim();
      
      // If it's the same as current username, mark as available
      if (normalized === (currentUsername || "").toLowerCase()) {
        setIsAvailable(null);
        setError(null);
        setSuggestion(null);
        setHasChanges(false);
        return;
      }

      if (!debouncedUsername || debouncedUsername.length < 3) {
        setIsAvailable(null);
        setError(null);
        setSuggestion(null);
        return;
      }

      setIsChecking(true);
      const result = await checkUsernameAvailable(debouncedUsername);
      setIsChecking(false);

      if (result.error) {
        setError(result.error);
        setIsAvailable(false);
        setSuggestion(null);
      } else if (!result.available) {
        setError("This username is taken");
        setIsAvailable(false);
        setSuggestion(result.suggestion || null);
      } else {
        setError(null);
        setIsAvailable(true);
        setSuggestion(null);
      }
    }

    check();
  }, [debouncedUsername, currentUsername]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow lowercase letters, numbers, and underscores
    const value = e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "");
    setUsernameValue(value);
    setIsAvailable(null);
    setError(null);
    setSuggestion(null);
    setHasChanges(value !== (currentUsername || ""));
  };

  const handleUseSuggestion = () => {
    if (suggestion) {
      setUsernameValue(suggestion);
    }
  };

  const handleSave = async () => {
    if (!isAvailable && username.toLowerCase() !== (currentUsername || "").toLowerCase()) {
      toast.error("Please choose an available username");
      return;
    }

    // If no changes, don't save
    if (username.toLowerCase() === (currentUsername || "").toLowerCase()) {
      toast.info("No changes to save");
      return;
    }

    setIsSaving(true);
    const result = await setUsername(username);
    setIsSaving(false);

    if (result.error) {
      toast.error(result.error);
      return;
    }

    if (result.success) {
      toast.success("Username updated successfully!");
      setHasChanges(false);
      // The parent will refetch the profile
      window.location.reload();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="h-5 w-5" />
          Public Username
        </CardTitle>
        <CardDescription>
          Your username appears on public recipes you share. This is how others will find you.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="username">Username</Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              @
            </span>
            <Input
              id="username"
              value={username}
              onChange={handleInputChange}
              placeholder="your_username"
              className="pl-8 pr-10"
              maxLength={30}
              autoComplete="off"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              {isChecking && (
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              )}
              {!isChecking && isAvailable === true && (
                <Check className="h-4 w-4 text-green-600" />
              )}
              {!isChecking && isAvailable === false && (
                <X className="h-4 w-4 text-destructive" />
              )}
            </div>
          </div>

          {/* Error message */}
          {error && (
            <p className="text-sm text-destructive flex items-center gap-1">
              <X className="h-3 w-3" />
              {error}
            </p>
          )}

          {/* Suggestion */}
          {suggestion && (
            <div className="flex items-center gap-2 text-sm">
              <Sparkles className="h-3 w-3 text-primary" />
              <span className="text-muted-foreground">Try:</span>
              <button
                type="button"
                onClick={handleUseSuggestion}
                className="text-primary hover:underline font-medium"
              >
                @{suggestion}
              </button>
            </div>
          )}

          {/* Success message */}
          {isAvailable && (
            <p className="text-sm text-green-600 flex items-center gap-1">
              <Check className="h-3 w-3" />
              Username is available!
            </p>
          )}

          {/* Current username display */}
          {currentUsername && !hasChanges && (
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <AtSign className="h-3 w-3" />
              Your current username: <span className="font-medium">@{currentUsername}</span>
            </p>
          )}

          {/* Guidelines */}
          <div className="text-xs text-muted-foreground space-y-1 mt-3">
            <p>Username requirements:</p>
            <ul className="list-disc list-inside space-y-0.5 ml-2">
              <li>3-30 characters</li>
              <li>Lowercase letters, numbers, and underscores only</li>
              <li>Cannot start with a number</li>
            </ul>
          </div>
        </div>

        <Button
          onClick={handleSave}
          disabled={!hasChanges || !isAvailable || isSaving || isChecking}
          className="w-full"
        >
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            "Save Username"
          )}
        </Button>
      </CardContent>
    </Card>
  );
}

