"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AtSign, Check, X, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { checkUsernameAvailable, setUsername } from "@/app/actions/sharing";
import { useDebounce } from "@/lib/use-debounce";
import { useEffect } from "react";

interface UsernameSetupModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function UsernameSetupModal({
  open,
  onOpenChange,
  onSuccess,
}: UsernameSetupModalProps) {
  const [username, setUsernameValue] = useState("");
  const [isChecking, setIsChecking] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [suggestion, setSuggestion] = useState<string | null>(null);

  const debouncedUsername = useDebounce(username, 500);

  // Check availability when username changes
  useEffect(() => {
    async function check() {
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
  }, [debouncedUsername]);

  const handleUseSuggestion = () => {
    if (suggestion) {
      setUsernameValue(suggestion);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAvailable) {
      toast.error("Please choose an available username");
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
      toast.success("Username set successfully!");
      onSuccess();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow lowercase letters, numbers, and underscores
    const value = e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "");
    setUsernameValue(value);
    setIsAvailable(null);
    setError(null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AtSign className="h-5 w-5" />
            Choose Your Username
          </DialogTitle>
          <DialogDescription>
            Your username will be displayed as the author of your public
            recipes. Choose something memorable!
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
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
                autoFocus
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

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!isAvailable || isSaving || isChecking}
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Set Username"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
