import {
  getProfile,
  getSettings,
  getHouseholdInfo,
  getMealTypeCustomization,
  getPlannerViewSettings,
} from "@/app/actions/settings";
import { getUserPreferencesV2 } from "@/app/actions/user-preferences";
import { SettingsProvider, type SettingsState } from "@/contexts/settings-context";
import { SettingsSidebar } from "@/components/settings/layout/settings-sidebar";
import { SettingsMobileNav } from "@/components/settings/layout/settings-mobile-nav";
import { DEFAULT_USER_PREFERENCES_V2 } from "@/types/user-preferences-v2";

export default async function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Fetch all settings data in parallel
  const [
    profileResult,
    settingsResult,
    householdResult,
    mealTypeSettingsResult,
    plannerViewSettingsResult,
  ] = await Promise.all([
    getProfile(),
    getSettings(),
    getHouseholdInfo(),
    getMealTypeCustomization(),
    getPlannerViewSettings(),
  ]);

  const profile = profileResult.data || {
    id: "",
    first_name: null,
    last_name: null,
    email: null,
    avatar_url: null,
    username: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const settings = settingsResult.data || {
    id: "",
    user_id: "",
    dark_mode: false,
    cook_names: ["Me"],
    cook_colors: {},
    email_notifications: true,
    allergen_alerts: [],
    custom_dietary_restrictions: [],
    category_order: null,
    calendar_event_time: null,
    calendar_event_duration_minutes: null,
    calendar_excluded_days: null,
    dismissed_hints: [],
    macro_goals: undefined,
    macro_tracking_enabled: false,
    macro_goal_preset: null,
    unit_system: "imperial" as const,
    recipe_export_preferences: undefined,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  // Fetch preferences V2 with profile id
  const userPreferencesV2Result = profile.id
    ? await getUserPreferencesV2(profile.id)
    : { error: null, data: DEFAULT_USER_PREFERENCES_V2 };

  const household = householdResult.data
    ? {
        household: householdResult.data.household as { id: string; name: string; created_at: string } | null,
        role: householdResult.data.role as string,
        members: (householdResult.data.members || []).map((m) => {
          // profiles might be an array from the join, take first item
          const profileData = Array.isArray(m.profiles) ? m.profiles[0] : m.profiles;
          return {
            user_id: m.user_id as string,
            role: m.role as string,
            profiles: profileData as { first_name: string | null; last_name: string | null; email: string | null } | null,
          };
        }),
      }
    : null;

  // Build initial state for context
  const initialData: SettingsState = {
    profile,
    settings,
    preferencesV2: userPreferencesV2Result.data || DEFAULT_USER_PREFERENCES_V2,
    household,
    mealTypeSettings: mealTypeSettingsResult.data,
    plannerViewSettings: plannerViewSettingsResult.data,
    calendarPreferences: null,
  };

  return (
    <SettingsProvider initialData={initialData}>
      <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
        {/* Desktop sidebar */}
        <SettingsSidebar />

        {/* Main content area */}
        <main className="flex-1 overflow-y-auto pb-20 md:pb-8">
          <div className="max-w-3xl mx-auto px-4 py-6 md:py-8">{children}</div>
        </main>

        {/* Mobile bottom navigation */}
        <SettingsMobileNav />
      </div>
    </SettingsProvider>
  );
}
