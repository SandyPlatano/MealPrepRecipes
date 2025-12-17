"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSettings } from "@/contexts/settings-context";
import { SettingsHeader } from "@/components/settings/layout/settings-header";
import { SettingRow, SettingSection } from "@/components/settings/shared/setting-row";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { updateProfile, deleteAccount } from "@/app/actions/settings";
import { logout } from "@/app/actions/auth";
import { checkUsernameAvailable, setUsername } from "@/app/actions/sharing";
import { useDebounce } from "@/lib/use-debounce";
import { toast } from "sonner";
import { LogOut, Trash2, AtSign, Check, X, Loader2, Sparkles, Globe } from "lucide-react";

export default function ProfileSettingsPage() {
  const { profile } = useSettings();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Profile name state
  const [firstName, setFirstName] = useState(profile.first_name || "");
  const [lastName, setLastName] = useState(profile.last_name || "");
  const [hasChanges, setHasChanges] = useState(false);

  // Username state
  const [username, setUsernameValue] = useState(profile.username || "");
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [isSavingUsername, setIsSavingUsername] = useState(false);
  const [isUsernameAvailable, setIsUsernameAvailable] = useState<boolean | null>(null);
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [usernameSuggestion, setUsernameSuggestion] = useState<string | null>(null);
  const [hasUsernameChanges, setHasUsernameChanges] = useState(false);
  const debouncedUsername = useDebounce(username, 500);

  // Check username availability when it changes
  useEffect(() => {
    async function checkUsername() {
      const normalized = debouncedUsername.toLowerCase().trim();

      // If same as current username, mark as available
      if (normalized === (profile.username || "").toLowerCase()) {
        setIsUsernameAvailable(null);
        setUsernameError(null);
        setUsernameSuggestion(null);
        setHasUsernameChanges(false);
        return;
      }

      if (!debouncedUsername || debouncedUsername.length < 3) {
        setIsUsernameAvailable(null);
        setUsernameError(null);
        setUsernameSuggestion(null);
        return;
      }

      setIsCheckingUsername(true);
      const result = await checkUsernameAvailable(debouncedUsername);
      setIsCheckingUsername(false);

      if (result.error) {
        setUsernameError(result.error);
        setIsUsernameAvailable(false);
        setUsernameSuggestion(null);
      } else if (!result.available) {
        setUsernameError("This username is taken");
        setIsUsernameAvailable(false);
        setUsernameSuggestion(result.suggestion || null);
      } else {
        setUsernameError(null);
        setIsUsernameAvailable(true);
        setUsernameSuggestion(null);
      }
    }

    checkUsername();
  }, [debouncedUsername, profile.username]);

  const handleNameChange = (field: "first" | "last", value: string) => {
    if (field === "first") {
      setFirstName(value);
    } else {
      setLastName(value);
    }
    setHasChanges(true);
  };

  const handleSaveProfile = () => {
    startTransition(async () => {
      const result = await updateProfile(firstName, lastName);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Profile updated");
        setHasChanges(false);
      }
    });
  };

  const handleSignOut = () => {
    startTransition(async () => {
      await logout();
    });
  };

  const handleDeleteAccount = () => {
    startTransition(async () => {
      const result = await deleteAccount();
      if (result.error) {
        toast.error(result.error);
      } else {
        router.push("/");
      }
    });
  };

  const handleUsernameInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow lowercase letters, numbers, and underscores
    const value = e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "");
    setUsernameValue(value);
    setIsUsernameAvailable(null);
    setUsernameError(null);
    setUsernameSuggestion(null);
    setHasUsernameChanges(value !== (profile.username || ""));
  };

  const handleUseSuggestion = () => {
    if (usernameSuggestion) {
      setUsernameValue(usernameSuggestion);
    }
  };

  const handleSaveUsername = async () => {
    if (!isUsernameAvailable && username.toLowerCase() !== (profile.username || "").toLowerCase()) {
      toast.error("Please choose an available username");
      return;
    }

    if (username.toLowerCase() === (profile.username || "").toLowerCase()) {
      toast.info("No changes to save");
      return;
    }

    setIsSavingUsername(true);
    const result = await setUsername(username);
    setIsSavingUsername(false);

    if (result.error) {
      toast.error(result.error);
      return;
    }

    if (result.success) {
      toast.success("Username updated successfully!");
      setHasUsernameChanges(false);
      router.refresh();
    }
  };

  return (
    <div className="space-y-8">
      <SettingsHeader
        title="Profile & Account"
        description="Your personal information and account settings"
      />

      {/* Profile Information */}
      <SettingSection title="Profile Information">
        <SettingRow
          id="setting-first-name"
          label="First Name"
          description="Your first name"
        >
          <Input
            id="setting-first-name-control"
            value={firstName}
            onChange={(e) => handleNameChange("first", e.target.value)}
            className="w-48"
            placeholder="First name"
          />
        </SettingRow>

        <SettingRow
          id="setting-last-name"
          label="Last Name"
          description="Your last name"
        >
          <Input
            id="setting-last-name-control"
            value={lastName}
            onChange={(e) => handleNameChange("last", e.target.value)}
            className="w-48"
            placeholder="Last name"
          />
        </SettingRow>

        <SettingRow
          id="setting-email"
          label="Email"
          description="Your account email (cannot be changed)"
        >
          <Input
            id="setting-email-control"
            value={profile.email || ""}
            disabled
            className="w-64 bg-muted"
          />
        </SettingRow>

        {hasChanges && (
          <div className="pt-4">
            <Button onClick={handleSaveProfile} disabled={isPending}>
              {isPending ? "Saving..." : "Save Profile"}
            </Button>
          </div>
        )}
      </SettingSection>

      {/* Public Username */}
      <SettingSection title="Public Username">
        <div id="setting-username" className="py-2 space-y-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Globe className="h-4 w-4" />
            <span>Your username appears on public recipes you share</span>
          </div>

          <div className="space-y-2">
            <div className="relative max-w-xs">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                @
              </span>
              <Input
                id="setting-username-control"
                value={username}
                onChange={handleUsernameInputChange}
                placeholder="your_username"
                className="pl-8 pr-10"
                maxLength={30}
                autoComplete="off"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                {isCheckingUsername && (
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                )}
                {!isCheckingUsername && isUsernameAvailable === true && (
                  <Check className="h-4 w-4 text-green-600" />
                )}
                {!isCheckingUsername && isUsernameAvailable === false && (
                  <X className="h-4 w-4 text-destructive" />
                )}
              </div>
            </div>

            {/* Error message */}
            {usernameError && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <X className="h-3 w-3" />
                {usernameError}
              </p>
            )}

            {/* Suggestion */}
            {usernameSuggestion && (
              <div className="flex items-center gap-2 text-sm">
                <Sparkles className="h-3 w-3 text-primary" />
                <span className="text-muted-foreground">Try:</span>
                <button
                  type="button"
                  onClick={handleUseSuggestion}
                  className="text-primary hover:underline font-medium"
                >
                  @{usernameSuggestion}
                </button>
              </div>
            )}

            {/* Success message */}
            {isUsernameAvailable && (
              <p className="text-sm text-green-600 flex items-center gap-1">
                <Check className="h-3 w-3" />
                Username is available!
              </p>
            )}

            {/* Current username display */}
            {profile.username && !hasUsernameChanges && (
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <AtSign className="h-3 w-3" />
                Your current username: <span className="font-medium">@{profile.username}</span>
              </p>
            )}

            {/* Requirements */}
            <div className="text-xs text-muted-foreground space-y-0.5 pt-2">
              <p>3-30 characters, lowercase letters, numbers, and underscores only</p>
            </div>

            {hasUsernameChanges && (
              <Button
                onClick={handleSaveUsername}
                disabled={!isUsernameAvailable || isSavingUsername || isCheckingUsername}
                size="sm"
              >
                {isSavingUsername ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Username"
                )}
              </Button>
            )}
          </div>
        </div>
      </SettingSection>

      {/* Account Actions */}
      <SettingSection title="Account Actions">
        <SettingRow
          id="setting-sign-out"
          label="Sign Out"
          description="Sign out of your account on this device"
        >
          <Button
            variant="outline"
            onClick={handleSignOut}
            disabled={isPending}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </SettingRow>

        <SettingRow
          id="setting-delete-account"
          label="Delete Account"
          description="Permanently delete your account and all data"
        >
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" disabled={isPending}>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Account
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete your
                  account and remove all your data from our servers, including all
                  recipes, meal plans, and settings.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteAccount}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Yes, delete my account
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </SettingRow>
      </SettingSection>
    </div>
  );
}
