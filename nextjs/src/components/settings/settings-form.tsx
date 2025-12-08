"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useTheme } from "next-themes";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Moon, Sun, Plus, X, Users, Calendar, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { ALLERGEN_TYPES, getAllergenDisplayName } from "@/lib/allergen-detector";
import { Badge } from "@/components/ui/badge";
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

// Helper to format time as HH:MM:SS for database
const formatTimeForDB = (time: string | null | undefined): string | null => {
  if (!time || time.trim() === '') return null;
  // If already has seconds (HH:MM:SS), return as is
  if (time.split(':').length === 3) return time;
  // If just HH:MM, add seconds
  return `${time}:00`;
};

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
    cook_colors?: Record<string, string>;
    email_notifications: boolean;
    allergen_alerts?: string[];
    custom_dietary_restrictions?: string[];
    google_connected_account?: string | null;
    calendar_event_time?: string | null;
    calendar_event_duration_minutes?: number | null;
    calendar_excluded_days?: string[] | null;
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
  const [cookColors, setCookColors] = useState<Record<string, string>>(
    settings.cook_colors || {}
  );
  const [emailNotifications, setEmailNotifications] = useState(
    settings.email_notifications
  );
  const [allergenAlerts, setAllergenAlerts] = useState<string[]>(
    settings.allergen_alerts || []
  );
  const [customRestrictions, setCustomRestrictions] = useState<string[]>(
    settings.custom_dietary_restrictions || []
  );
  const [customRestrictionInput, setCustomRestrictionInput] = useState("");
  const [googleConnectedAccount, setGoogleConnectedAccount] = useState(
    settings.google_connected_account || null
  );
  const [calendarEventTime, setCalendarEventTime] = useState(() => {
    const time = settings.calendar_event_time;
    if (!time) return "17:00";
    // If time has format HH:MM:SS, extract just HH:MM
    if (time.length >= 5) return time.substring(0, 5);
    return time;
  });
  const [calendarEventDuration, setCalendarEventDuration] = useState(
    settings.calendar_event_duration_minutes || 60
  );
  const [calendarExcludedDays, setCalendarExcludedDays] = useState<string[]>(
    settings.calendar_excluded_days || []
  );
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [mounted, setMounted] = useState(false);
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Use refs to store latest values to avoid dependency issues
  const themeRef = useRef(theme);
  const cookNamesRef = useRef(cookNames);
  const cookColorsRef = useRef(cookColors);
  const emailNotificationsRef = useRef(emailNotifications);
  const allergenAlertsRef = useRef(allergenAlerts);
  const customRestrictionsRef = useRef(customRestrictions);
  const calendarEventTimeRef = useRef(calendarEventTime);
  const calendarEventDurationRef = useRef(calendarEventDuration);
  const calendarExcludedDaysRef = useRef(calendarExcludedDays);

  // Keep refs in sync with state
  useEffect(() => {
    themeRef.current = theme;
  }, [theme]);
  useEffect(() => {
    cookNamesRef.current = cookNames;
  }, [cookNames]);
  useEffect(() => {
    cookColorsRef.current = cookColors;
  }, [cookColors]);
  useEffect(() => {
    emailNotificationsRef.current = emailNotifications;
  }, [emailNotifications]);
  useEffect(() => {
    allergenAlertsRef.current = allergenAlerts;
  }, [allergenAlerts]);
  useEffect(() => {
    customRestrictionsRef.current = customRestrictions;
  }, [customRestrictions]);
  useEffect(() => {
    calendarEventTimeRef.current = calendarEventTime;
  }, [calendarEventTime]);
  useEffect(() => {
    calendarEventDurationRef.current = calendarEventDuration;
  }, [calendarEventDuration]);
  useEffect(() => {
    calendarExcludedDaysRef.current = calendarExcludedDays;
  }, [calendarExcludedDays]);

  // Only render theme toggle after mounting to avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Auto-save settings with debounce - using refs to avoid callback recreation
  const autoSaveSettings = useCallback(() => {
    // Clear existing timeout
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }

    // Set new timeout to save after 500ms of inactivity
    autoSaveTimeoutRef.current = setTimeout(async () => {
      const isDarkMode = themeRef.current === "dark";
      
      // Update settings using refs for latest values
      const settingsResult = await updateSettings({
        dark_mode: isDarkMode,
        cook_names: cookNamesRef.current.filter((n) => n.trim()),
        cook_colors: cookColorsRef.current,
        email_notifications: emailNotificationsRef.current,
        allergen_alerts: allergenAlertsRef.current,
        custom_dietary_restrictions: customRestrictionsRef.current,
        calendar_event_time: formatTimeForDB(calendarEventTimeRef.current),
        calendar_event_duration_minutes: calendarEventDurationRef.current,
        calendar_excluded_days: calendarExcludedDaysRef.current,
      });
      
      if (settingsResult.error) {
        toast.error(settingsResult.error);
      } else {
        toast.success("Settings saved", { duration: 2000 });
      }
    }, 500);
  }, []); // No dependencies - uses refs instead

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
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
    } catch {
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
        cook_colors: cookColors,
        email_notifications: emailNotifications,
        allergen_alerts: allergenAlerts,
        custom_dietary_restrictions: customRestrictions,
        calendar_event_time: formatTimeForDB(calendarEventTime),
        calendar_event_duration_minutes: calendarEventDuration,
        calendar_excluded_days: calendarExcludedDays,
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
          toast.error(typeof householdResult.error === 'string' ? householdResult.error : householdResult.error.message || 'Failed to update household name');
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
    autoSaveSettings();
  };

  const removeCook = (index: number) => {
    if (cookNames.length > 1) {
      setCookNames(cookNames.filter((_, i) => i !== index));
      autoSaveSettings();
    }
  };

  const updateCook = (index: number, value: string) => {
    const newNames = [...cookNames];
    const oldName = newNames[index];
    newNames[index] = value;
    setCookNames(newNames);
    
    // Update color mapping if name changed
    if (oldName && oldName !== value && cookColors[oldName]) {
      const newColors = { ...cookColors };
      newColors[value] = newColors[oldName];
      delete newColors[oldName];
      setCookColors(newColors);
    }
    
    autoSaveSettings();
  };

  const updateCookColor = (cookName: string, color: string) => {
    setCookColors({ ...cookColors, [cookName]: color });
    autoSaveSettings();
  };

  const toggleAllergenAlert = useCallback((allergen: string) => {
    // Update state immediately - React will batch and apply instantly
    setAllergenAlerts((prev) => {
      const updated = prev.includes(allergen)
        ? prev.filter((a) => a !== allergen)
        : [...prev, allergen];
      // Update ref immediately for auto-save
      allergenAlertsRef.current = updated;
      return updated;
    });
    // Schedule auto-save asynchronously - don't block the UI update
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }
    autoSaveTimeoutRef.current = setTimeout(() => autoSaveSettings(), 300);
  }, [autoSaveSettings]);

  // Memoize toggle handlers for each allergen to prevent re-creating callbacks
  const allergenToggleHandlers = useMemo(() => {
    const handlers: Record<string, () => void> = {};
    ALLERGEN_TYPES.forEach((allergen) => {
      handlers[allergen] = () => toggleAllergenAlert(allergen);
    });
    return handlers;
  }, [toggleAllergenAlert]);

  const addCustomRestriction = () => {
    const trimmed = customRestrictionInput.trim();
    if (trimmed && !customRestrictions.includes(trimmed)) {
      setCustomRestrictions([...customRestrictions, trimmed]);
      setCustomRestrictionInput("");
      autoSaveSettings();
    } else if (customRestrictions.includes(trimmed)) {
      toast.info("Already added");
    }
  };

  const removeCustomRestriction = (restriction: string) => {
    setCustomRestrictions(customRestrictions.filter((r) => r !== restriction));
    autoSaveSettings();
  };

  // Default colors for cooks
  const defaultColors = [
    "#3b82f6", // blue
    "#a855f7", // purple
    "#10b981", // green
    "#f59e0b", // amber
    "#ec4899", // pink
    "#14b8a6", // teal
    "#f97316", // orange
  ];

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
                maxLength={50}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="last-name">Last Name</Label>
              <Input
                id="last-name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Last name"
                maxLength={50}
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
      {mounted && (
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
              <Switch
                checked={isDarkMode}
                onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
              />
            </div>
          </CardContent>
        </Card>
      )}

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
            <div key={index} className="flex gap-2 items-center">
              <div className="relative overflow-hidden rounded-md shadow-sm ring-1 ring-gray-200 dark:ring-gray-800 hover:ring-gray-300 dark:hover:ring-gray-700 transition-all h-10 w-12">
                <input
                  type="color"
                  value={cookColors[cook] || defaultColors[index % defaultColors.length]}
                  onChange={(e) => updateCookColor(cook, e.target.value)}
                  className="h-full w-full cursor-pointer"
                  style={{
                    border: 'none',
                    outline: 'none',
                    padding: 0,
                    margin: 0,
                    width: '100%',
                    height: '100%',
                    WebkitAppearance: 'none',
                    MozAppearance: 'none',
                    appearance: 'none',
                  }}
                  title="Choose color"
                />
              </div>
              <Input
                value={cook}
                onChange={(e) => updateCook(index, e.target.value)}
                placeholder="Name"
                className="flex-1"
                maxLength={50}
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
                maxLength={100}
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

      {/* Dietary Restrictions & Allergens */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Dietary Restrictions & Allergens
          </CardTitle>
          <CardDescription>
            Select allergens to receive warnings on recipes that contain them
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Common Allergens */}
          <div>
            <Label className="text-sm font-medium mb-3 block">
              Common Allergens
            </Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {ALLERGEN_TYPES.map((allergen) => {
                const isSelected = allergenAlerts.includes(allergen);
                return (
                  <label
                    key={allergen}
                    htmlFor={`allergen-alert-${allergen}`}
                    className={`
                      flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all
                      ${isSelected 
                        ? 'border-red-300 bg-red-50 dark:bg-red-950/20 dark:border-red-800' 
                        : 'border-border bg-card hover:bg-accent/50'
                      }
                    `}
                  >
                    <Switch
                      id={`allergen-alert-${allergen}`}
                      checked={isSelected}
                      onCheckedChange={allergenToggleHandlers[allergen]}
                      className="flex-shrink-0"
                    />
                    <span className={`
                      text-sm font-medium flex-1
                      ${isSelected 
                        ? 'text-red-900 dark:text-red-200' 
                        : 'text-foreground'
                      }
                    `}>
                      {getAllergenDisplayName(allergen)}
                    </span>
                  </label>
                );
              })}
            </div>
            {allergenAlerts.length > 0 && (
              <p className="text-sm text-muted-foreground mt-4">
                You&apos;ll see prominent warnings on recipes containing:{" "}
                <span className="font-medium">
                  {allergenAlerts.map((a) => getAllergenDisplayName(a as typeof ALLERGEN_TYPES[number])).join(", ")}
                </span>
              </p>
            )}
          </div>

          {/* Custom Dietary Restrictions */}
          <div className="pt-4 border-t">
            <Label className="text-sm font-medium mb-2 block">
              Custom Restrictions
            </Label>
            <p className="text-xs text-muted-foreground mb-4">
              Add any other ingredients or food types you need to avoid (e.g., nightshades, MSG, sulfites)
            </p>
            
            {/* List of custom restrictions */}
            {customRestrictions.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {customRestrictions.map((restriction) => (
                  <Badge
                    key={restriction}
                    variant="secondary"
                    className="gap-1.5 px-3 py-1.5 text-sm"
                  >
                    {restriction}
                    <button
                      onClick={() => removeCustomRestriction(restriction)}
                      className="ml-0.5 hover:text-destructive transition-colors rounded-full hover:bg-destructive/10 p-0.5"
                      type="button"
                      aria-label={`Remove ${restriction}`}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
            
            {/* Input to add new restriction */}
            <div className="flex gap-2">
              <Input
                value={customRestrictionInput}
                onChange={(e) => setCustomRestrictionInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addCustomRestriction();
                  }
                }}
                placeholder="e.g., nightshades, MSG, sulfites"
                maxLength={50}
                className="flex-1"
              />
              <Button
                onClick={addCustomRestriction}
                disabled={!customRestrictionInput.trim()}
                variant="outline"
                type="button"
                className="flex-shrink-0"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

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
        <CardContent className="space-y-4">
          <GoogleCalendarButton
            connectedAccount={googleConnectedAccount}
            onConnectionChange={handleGoogleConnectionChange}
          />
          
          {googleConnectedAccount && (
            <>
              <Separator />
              
              {/* Event Time */}
              <div className="space-y-2">
                <Label htmlFor="calendar-time">Event Time</Label>
                <Input
                  id="calendar-time"
                  type="time"
                  step="900"
                  value={calendarEventTime}
                  onChange={(e) => {
                    setCalendarEventTime(e.target.value);
                    autoSaveSettings();
                  }}
                  className="max-w-[200px]"
                />
                <p className="text-xs text-muted-foreground">
                  Default time for calendar events (15-minute intervals)
                </p>
              </div>

              {/* Event Duration */}
              <div className="space-y-2">
                <Label>Event Duration</Label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { label: "15 min", value: 15 },
                    { label: "30 min", value: 30 },
                    { label: "45 min", value: 45 },
                    { label: "1 hr", value: 60 },
                    { label: "1.5 hr", value: 90 },
                    { label: "2 hr", value: 120 },
                  ].map((option) => (
                    <Button
                      key={option.value}
                      type="button"
                      variant={calendarEventDuration === option.value ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        setCalendarEventDuration(option.value);
                        autoSaveSettings();
                      }}
                    >
                      {option.label}
                    </Button>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  How long calendar events should last
                </p>
              </div>

              {/* Excluded Days */}
              <div className="space-y-2">
                <Label>Skip calendar events on these days:</Label>
                <div className="flex flex-wrap gap-2">
                  {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((day) => {
                    const isExcluded = calendarExcludedDays.includes(day);
                    return (
                      <Button
                        key={day}
                        type="button"
                        variant={isExcluded ? "secondary" : "outline"}
                        size="sm"
                        onClick={() => {
                          const updated = isExcluded
                            ? calendarExcludedDays.filter((d) => d !== day)
                            : [...calendarExcludedDays, day];
                          setCalendarExcludedDays(updated);
                          autoSaveSettings();
                        }}
                        className={isExcluded ? "opacity-50 line-through" : ""}
                      >
                        {day.slice(0, 3)}
                      </Button>
                    );
                  })}
                </div>
                <p className="text-xs text-muted-foreground">
                  Calendar events won&apos;t be created for excluded days
                </p>
              </div>
            </>
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
              onCheckedChange={(checked) => {
                setEmailNotifications(checked);
                autoSaveSettings();
              }}
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
