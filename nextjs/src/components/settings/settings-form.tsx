"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Moon, Sun, Plus, X, Users, Calendar } from "lucide-react";
import { toast } from "sonner";
import {
  updateProfile,
  updateSettings,
  updateHouseholdName,
  deleteAccount,
} from "@/app/actions/settings";
import { logout } from "@/app/actions/auth";
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
import { GoogleCalendarButton } from "./google-calendar-button";

interface SettingsFormProps {
  profile: {
    id: string;
    name: string | null;
    first_name?: string | null;
    last_name?: string | null;
    email: string | null;
  };
  settings: {
    dark_mode: boolean;
    cook_names: string[];
    email_notifications: boolean;
    google_connected_account?: string | null;
    calendar_event_time?: string | null;
    calendar_event_duration_minutes?: number | null;
  };
  household: {
    id: string;
    name: string;
  } | null;
  householdRole: string;
  members: Array<{
    user_id: string;
    role: string;
    profiles: { name: string | null; email: string | null } | null;
  }>;
}

export function SettingsForm({
  profile,
  settings,
  household,
  householdRole,
  members,
}: SettingsFormProps) {
  const { theme, setTheme } = useTheme();
  const [firstName, setFirstName] = useState(profile.first_name || "");
  const [lastName, setLastName] = useState(profile.last_name || "");
  const [householdNameInput, setHouseholdNameInput] = useState(
    household?.name || ""
  );
  const [cookNames, setCookNames] = useState<string[]>(
    settings.cook_names || ["Me"]
  );
  const [emailNotifications, setEmailNotifications] = useState(
    settings.email_notifications
  );
  const [googleConnectedAccount, setGoogleConnectedAccount] = useState(
    settings.google_connected_account || null
  );
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Only render theme toggle after mounting to avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleGoogleConnectionChange = async () => {
    // Refetch settings to get updated Google Calendar connection
    try {
      const response = await fetch("/api/google-calendar/status");
      if (response.ok) {
        const data = await response.json();
        setGoogleConnectedAccount(data.connectedAccount || null);
      }
    } catch (error) {
      console.error("Failed to fetch Google Calendar status:", error);
    }
    // Also reload the page to ensure all data is fresh
    window.location.reload();
  };

  const isDarkMode = theme === "dark";

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      const result = await deleteAccount();
      if (result.error) {
        toast.error(result.error);
        setIsDeleting(false);
      } else {
        toast.success("Account deleted successfully");
        // Redirect to home page
        window.location.href = "/";
      }
    } catch (error) {
      toast.error("Failed to delete account. Please try again.");
      setIsDeleting(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Update profile name
      if (firstName !== profile.first_name || lastName !== profile.last_name) {
        const result = await updateProfile(firstName, lastName);
        if (result.error) {
          toast.error(result.error);
          setIsSaving(false);
          return;
        }
      }

      // Update settings
      const settingsResult = await updateSettings({
        dark_mode: isDarkMode,
        cook_names: cookNames.filter((n) => n.trim()),
        email_notifications: emailNotifications,
      });
      if (settingsResult.error) {
        toast.error(settingsResult.error);
        setIsSaving(false);
        return;
      }

      // Update household name if owner
      if (
        householdRole === "owner" &&
        household &&
        householdNameInput !== household.name
      ) {
        const householdResult = await updateHouseholdName(householdNameInput);
        if (householdResult.error) {
          toast.error(householdResult.error);
          setIsSaving(false);
          return;
        }
      }

      toast.success("Settings saved!");
    } catch {
      toast.error("Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  };

  const addCook = () => {
    setCookNames([...cookNames, ""]);
  };

  const removeCook = (index: number) => {
    if (cookNames.length > 1) {
      setCookNames(cookNames.filter((_, i) => i !== index));
    }
  };

  const updateCook = (index: number, value: string) => {
    const newNames = [...cookNames];
    newNames[index] = value;
    setCookNames(newNames);
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Profile */}
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Your personal information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="first-name">First Name</Label>
              <Input
                id="first-name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="First name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="last-name">Last Name</Label>
              <Input
                id="last-name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Last name"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input value={profile.email || ""} disabled className="bg-muted" />
            <p className="text-xs text-muted-foreground">
              Email cannot be changed here.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Appearance */}
      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
          <CardDescription>Customize how the app looks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {isDarkMode ? (
                <Moon className="h-5 w-5" />
              ) : (
                <Sun className="h-5 w-5" />
              )}
              <div>
                <p className="font-medium">Dark Mode</p>
                <p className="text-sm text-muted-foreground">
                  Easy on the eyes at night
                </p>
              </div>
            </div>
            {mounted && (
              <Switch
                checked={isDarkMode}
                onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
              />
            )}
          </div>
        </CardContent>
      </Card>

      {/* Cook Names */}
      <Card>
        <CardHeader>
          <CardTitle>Who&apos;s Cooking?</CardTitle>
          <CardDescription>
            Add everyone who cooks so you can assign meals fairly
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {cookNames.map((cook, index) => (
            <div key={index} className="flex gap-2">
              <Input
                value={cook}
                onChange={(e) => updateCook(index, e.target.value)}
                placeholder="Name"
              />
              {cookNames.length > 1 && (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => removeCook(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
          <Button variant="outline" onClick={addCook} className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Add Another Cook
          </Button>
        </CardContent>
      </Card>

      {/* Household */}
      {household && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Household
            </CardTitle>
            <CardDescription>
              Your household shares recipes and meal plans
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="household-name">Household Name</Label>
              <Input
                id="household-name"
                value={householdNameInput}
                onChange={(e) => setHouseholdNameInput(e.target.value)}
                placeholder="The Smith Kitchen"
                disabled={householdRole !== "owner"}
              />
              {householdRole !== "owner" && (
                <p className="text-xs text-muted-foreground">
                  Only the household owner can change this.
                </p>
              )}
            </div>

            <Separator />

            <div>
              <Label className="text-sm font-medium">Members</Label>
              <div className="mt-2 space-y-2">
                {members.map((member) => (
                  <div
                    key={member.user_id}
                    className="flex items-center justify-between text-sm p-2 rounded bg-muted/50"
                  >
                    <span>
                      {member.profiles?.name || member.profiles?.email || "Unknown"}
                    </span>
                    <span className="text-xs text-muted-foreground capitalize">
                      {member.role}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Google Calendar */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Google Calendar
          </CardTitle>
          <CardDescription>
            Automatically add meal plans to your Google Calendar
          </CardDescription>
        </CardHeader>
        <CardContent>
          <GoogleCalendarButton
            connectedAccount={googleConnectedAccount}
            onConnectionChange={handleGoogleConnectionChange}
          />
          {googleConnectedAccount && (
            <p className="text-xs text-muted-foreground mt-2">
              Calendar events will be created at 5:00 PM for each assigned meal when you send the plan.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
          <CardDescription>Control how we reach you</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Email Notifications</p>
              <p className="text-sm text-muted-foreground">
                Shopping lists and meal plan reminders
              </p>
            </div>
            <Switch
              checked={emailNotifications}
              onCheckedChange={setEmailNotifications}
            />
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <Button onClick={handleSave} disabled={isSaving} className="w-full">
        {isSaving ? "Saving..." : "Save Settings"}
      </Button>

      {/* Sign Out */}
      <Card>
        <CardHeader>
          <CardTitle>Sign Out</CardTitle>
          <CardDescription>End your current session</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={logout}>
            <Button variant="outline" type="submit" className="w-full">
              Sign Out
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Delete Account */}
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive">Danger Zone</CardTitle>
          <CardDescription>
            Permanently delete your account and all associated data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="w-full">
                Delete Account
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete your
                  account and remove all your data from our servers, including:
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>All your recipes</li>
                    <li>All your meal plans</li>
                    <li>All your cooking history</li>
                    <li>Your household data (if you&apos;re the owner)</li>
                  </ul>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteAccount}
                  disabled={isDeleting}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {isDeleting ? "Deleting..." : "Yes, delete my account"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            This action is immediate and irreversible
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
